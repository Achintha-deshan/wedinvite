'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { signOutAction, getProfileAction } from '../actions/auth'
import { addGuestAction, getGuestsAction, deleteGuestAction } from '../actions/guests'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'boy' | 'girl'>('boy')
  const [guests, setGuests] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContact, setNewContact] = useState('')
  const [adding, setAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/login')
          return
        }

        const res = await getProfileAction()

        if (res.success && res.data) {
          setProfile(res.data)
          if (!res.data.is_profile_completed) {
            router.push('/dashboard/setup')
            return
          }
        } else {
          router.push('/dashboard/setup')
          return
        }

        await loadGuests()
      } catch (err) {
        console.error(err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const loadGuests = async () => {
    const res = await getGuestsAction()
    if (res.success) setGuests(res.data || [])
  }

  const handleSignOut = async () => {
    await signOutAction()
    router.push('/login')
  }

  const handleAddGuest = async () => {
    if (!newName.trim()) {
      alert('Please enter a guest name')
      return
    }
    setAdding(true)
    const res = await addGuestAction({
      name: newName.trim(),
      phoneOrEmail: newContact.trim(),
      side: activeTab
    })
    setAdding(false)
    if (res.success) {
      setNewName('')
      setNewContact('')
      setShowAddForm(false)
      await loadGuests()
    } else {
      alert(res.error || 'Failed to add guest')
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Remove this guest?')) return
    const res = await deleteGuestAction(guestId)
    if (res.success) await loadGuests()
  }

  const handleCopyLink = (guest: any) => {
    const url = `${window.location.origin}/invite/${guest.unique_token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(guest.id)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => {
      alert('Could not copy. URL: ' + url)
    })
  }

  const boyGuests = guests.filter(g => g.side === 'boy')
  const girlGuests = guests.filter(g => g.side === 'girl')
  const currentGuests = (activeTab === 'boy' ? boyGuests : girlGuests).filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const confirmedCount = guests.filter(g => g.rsvp_status === 'confirmed').length
  const pendingCount = guests.filter(g => g.rsvp_status === 'pending').length
  const declinedCount = guests.filter(g => g.rsvp_status === 'declined').length

  const statusBadge = (status: string) => {
    if (status === 'confirmed') return <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-600">Confirmed</span>
    if (status === 'declined') return <span className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-500">Declined</span>
    return <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-600">Pending</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">💍</div>
          <p className="text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F8]">

      <nav className="bg-white/80 backdrop-blur-xl border-b border-rose-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💍</span>
          <span className="font-serif text-lg font-medium text-gray-800">WedInvite</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">
              {profile?.boy_name || '—'} & {profile?.girl_name || '—'}
            </p>
            <p className="text-xs text-gray-400">
              {profile?.wedding_date
                ? new Date(profile.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Wedding date not set'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/setup')}
            className="text-xs px-4 py-2 rounded-xl border border-rose-200 text-rose-400 hover:bg-rose-50 transition-all"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-3xl p-6 text-white mb-8 shadow-lg shadow-rose-100">
          <p className="text-sm opacity-80 mb-1">Welcome back 👋</p>
          <h1 className="text-2xl font-serif font-medium mb-1">
            {profile?.boy_name && profile?.girl_name
              ? `${profile.boy_name} & ${profile.girl_name}`
              : 'Complete your profile'}
          </h1>
          <p className="text-sm opacity-75">
            {profile?.venue_name ? `📍 ${profile.venue_name}` : 'Add your venue details'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-800">{guests.length}</div>
            <div className="text-xs text-gray-400 mt-1">Total Guests</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
            <div className="text-xs text-gray-400 mt-1">Confirmed</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-gray-400 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-500">{declinedCount}</div>
            <div className="text-xs text-gray-400 mt-1">Declined</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-rose-50 shadow-sm overflow-hidden mb-6">

          <div className="flex border-b border-rose-50">
            <button
              onClick={() => { setActiveTab('boy'); setShowAddForm(false) }}
              className={`flex-1 py-4 text-sm font-medium transition-all ${
                activeTab === 'boy'
                  ? 'bg-rose-50 text-rose-500 border-b-2 border-rose-400'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              🤵 {profile?.boy_name || 'Groom'}'s Guests ({boyGuests.length})
            </button>
            <button
              onClick={() => { setActiveTab('girl'); setShowAddForm(false) }}
              className={`flex-1 py-4 text-sm font-medium transition-all ${
                activeTab === 'girl'
                  ? 'bg-rose-50 text-rose-500 border-b-2 border-rose-400'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              👰 {profile?.girl_name || 'Bride'}'s Guests ({girlGuests.length})
            </button>
          </div>

          <div className="p-6">

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests..."
                className="flex-1 p-2.5 border border-rose-100 rounded-xl text-sm outline-none focus:border-rose-300"
              />
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs px-4 py-2.5 bg-rose-400 text-white rounded-xl hover:bg-rose-500 transition-all whitespace-nowrap"
              >
                + Add Guest
              </button>
            </div>

            {showAddForm && (
              <div className="bg-rose-50 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Guest name"
                  className="flex-1 p-2.5 border border-rose-200 rounded-xl text-sm outline-none focus:border-rose-300 bg-white"
                />
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Phone or email (optional)"
                  className="flex-1 p-2.5 border border-rose-200 rounded-xl text-sm outline-none focus:border-rose-300 bg-white"
                />
                <button
                  onClick={handleAddGuest}
                  disabled={adding}
                  className="px-5 py-2.5 bg-rose-400 text-white rounded-xl text-sm font-medium hover:bg-rose-500 disabled:opacity-50 whitespace-nowrap"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
            )}

            {currentGuests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">💌</div>
                <p className="text-gray-400 text-sm">No guests added yet</p>
                <p className="text-gray-300 text-xs mt-1">Add guests to send invitations</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{guest.name}</p>
                      {guest.phone_or_email && (
                        <p className="text-xs text-gray-400 truncate">{guest.phone_or_email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {statusBadge(guest.rsvp_status)}
                      <button
                        onClick={() => handleCopyLink(guest)}
                        title="Copy invitation link"
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                          copiedId === guest.id
                            ? 'bg-green-100 text-green-600'
                            : 'bg-rose-100 text-rose-500 hover:bg-rose-200'
                        }`}
                      >
                        {copiedId === guest.id ? '✓ Copied' : '🔗 Copy URL'}
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/select-template')}
            className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left"
          >
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-sm font-medium text-gray-700">Select Template</div>
          </button>
          <button
            onClick={() => router.push('/dashboard/setup')}
            className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left"
          >
            <div className="text-2xl mb-2">✏️</div>
            <div className="text-sm font-medium text-gray-700">Edit Profile</div>
          </button>
          {profile?.template_id && (
            <button
              onClick={() => router.push(`/dashboard/preview/${profile.template_id}`)}
              className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left"
            >
              <div className="text-2xl mb-2">👁️</div>
              <div className="text-sm font-medium text-gray-700">View Invitation</div>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}