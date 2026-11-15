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

  const confirmedGuests = guests.filter(g => g.rsvp_status === 'confirmed')
  const confirmedCount = confirmedGuests.length
  const totalAttending = confirmedGuests.reduce((sum, g) => sum + (g.guest_count || 1), 0)
  const pendingCount = guests.filter(g => g.rsvp_status === 'pending').length
  const declinedCount = guests.filter(g => g.rsvp_status === 'declined').length

  const statusBadge = (status: string) => {
    if (status === 'confirmed')
      return <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium whitespace-nowrap">Confirmed</span>
    if (status === 'declined')
      return <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-100 text-red-500 font-medium whitespace-nowrap">Declined</span>
    return <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 font-medium whitespace-nowrap">Pending</span>
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
    <div className="min-h-screen bg-[#FDF8F8] overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-rose-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">💍</span>
          <span className="font-serif text-base sm:text-lg font-medium text-gray-800">WedInvite</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden md:block mr-1">
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
            className="h-10 min-w-10 px-3 text-xs rounded-xl border border-rose-200 text-rose-400 hover:bg-rose-50 transition-all flex items-center justify-center gap-1"
          >
            ✏️ <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={handleSignOut}
            className="h-10 min-w-10 px-3 text-xs rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
          >
            🚪 <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

        {/* HERO */}
        <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white mb-5 sm:mb-8 shadow-lg shadow-rose-100">
          <p className="text-xs sm:text-sm opacity-80 mb-1">Welcome back 👋</p>
          <h1 className="text-xl sm:text-2xl font-serif font-medium mb-1 break-words">
            {profile?.boy_name && profile?.girl_name
              ? `${profile.boy_name} & ${profile.girl_name}`
              : 'Complete your profile'}
          </h1>
          <p className="text-xs sm:text-sm opacity-75 break-words">
            {profile?.venue_name ? `📍 ${profile.venue_name}` : 'Add your venue details'}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-rose-50 shadow-sm">
            <div className="text-xl sm:text-2xl mb-1">👥</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800">{guests.length}</div>
            <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Total Guests</div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-rose-50 shadow-sm">
            <div className="text-xl sm:text-2xl mb-1">✅</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{confirmedCount}</div>
            <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Confirmed</div>
          </div>
          <div className="col-span-2 sm:col-span-1 order-last sm:order-none bg-white rounded-2xl p-3 sm:p-4 border border-green-100 shadow-sm border-l-4 border-l-green-400 flex sm:block items-center gap-3">
            <div className="text-xl sm:text-2xl sm:mb-1">🎉</div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-700">{totalAttending}</div>
              <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Total Attending</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-rose-50 shadow-sm">
            <div className="text-xl sm:text-2xl mb-1">⏳</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Pending</div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-rose-50 shadow-sm">
            <div className="text-xl sm:text-2xl mb-1">❌</div>
            <div className="text-xl sm:text-2xl font-bold text-red-500">{declinedCount}</div>
            <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Declined</div>
          </div>
        </div>

        {/* GUEST LIST */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-50 shadow-sm overflow-hidden mb-5 sm:mb-6">

          {/* TABS */}
          <div className="flex border-b border-rose-50">
            <button
              onClick={() => { setActiveTab('boy'); setShowAddForm(false) }}
              className={`flex-1 min-w-0 py-3 px-2 text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'boy'
                  ? 'bg-rose-50 text-rose-500 border-b-2 border-rose-400'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <span className="block truncate">🤵 {profile?.boy_name || 'Groom'}'s Guests</span>
              <span className="block text-[11px] opacity-70">({boyGuests.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('girl'); setShowAddForm(false) }}
              className={`flex-1 min-w-0 py-3 px-2 text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'girl'
                  ? 'bg-rose-50 text-rose-500 border-b-2 border-rose-400'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <span className="block truncate">👰 {profile?.girl_name || 'Bride'}'s Guests</span>
              <span className="block text-[11px] opacity-70">({girlGuests.length})</span>
            </button>
          </div>

          <div className="p-3 sm:p-6">

            {/* SEARCH + ADD */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests..."
                className="flex-1 min-w-0 h-11 px-3 border border-rose-100 rounded-xl text-base sm:text-sm outline-none focus:border-rose-300"
              />
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="h-11 px-4 text-sm bg-rose-400 text-white rounded-xl hover:bg-rose-500 active:scale-95 transition-all whitespace-nowrap"
              >
                + Add
              </button>
            </div>

            {/* ADD FORM */}
            {showAddForm && (
              <div className="bg-rose-50 rounded-2xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Guest name"
                  className="flex-1 h-11 px-3 border border-rose-200 rounded-xl text-base sm:text-sm outline-none focus:border-rose-300 bg-white"
                />
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Phone or email (optional)"
                  className="flex-1 h-11 px-3 border border-rose-200 rounded-xl text-base sm:text-sm outline-none focus:border-rose-300 bg-white"
                />
                <button
                  onClick={handleAddGuest}
                  disabled={adding}
                  className="h-11 px-5 bg-rose-400 text-white rounded-xl text-sm font-medium hover:bg-rose-500 disabled:opacity-50 whitespace-nowrap"
                >
                  {adding ? 'Adding...' : 'Add Guest'}
                </button>
              </div>
            )}

            {/* GUEST CARDS */}
            {currentGuests.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">💌</div>
                <p className="text-gray-400 text-sm">No guests added yet</p>
                <p className="text-gray-300 text-xs mt-1">Add guests to send invitations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentGuests.map((guest) => {
                  const isConfirmed = guest.rsvp_status === 'confirmed'
                  const count = guest.guest_count || 1

                  return (
                    <div
                      key={guest.id}
                      className={`rounded-2xl p-3 sm:p-4 border ${
                        isConfirmed
                          ? 'bg-green-50/70 border-green-100'
                          : 'bg-gray-50 border-transparent'
                      }`}
                    >
                      {/* Name + status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 break-words">{guest.name}</p>
                          {guest.phone_or_email && (
                            <p className="text-xs text-gray-400 break-all mt-0.5">{guest.phone_or_email}</p>
                          )}
                        </div>
                        {statusBadge(guest.rsvp_status)}
                      </div>

                      {/* Confirmed info */}
                      {isConfirmed && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs sm:text-sm text-green-700">
                          <span>
                            ✅ <span className="font-semibold">{guest.name}</span> confirmed
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-green-100 font-medium text-[11px] sm:text-xs">
                            👤 {count} {count === 1 ? 'person' : 'people'} attending
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleCopyLink(guest)}
                          className={`flex-1 h-10 text-xs sm:text-sm rounded-xl font-medium active:scale-95 transition-all ${
                            copiedId === guest.id
                              ? 'bg-green-100 text-green-600'
                              : 'bg-rose-100 text-rose-500 hover:bg-rose-200'
                          }`}
                        >
                          {copiedId === guest.id ? '✓ Copied' : '🔗 Copy Invite Link'}
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          aria-label="Delete guest"
                          className="h-10 w-12 text-sm rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/dashboard/select-template')}
            className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm hover:shadow-md hover:border-rose-200 active:scale-95 transition-all text-left"
          >
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-sm font-medium text-gray-700">Select Template</div>
          </button>
          <button
            onClick={() => router.push('/dashboard/setup')}
            className="bg-white rounded-2xl p-4 border border-rose-50 shadow-sm hover:shadow-md hover:border-rose-200 active:scale-95 transition-all text-left"
          >
            <div className="text-2xl mb-2">✏️</div>
            <div className="text-sm font-medium text-gray-700">Edit Profile</div>
          </button>
          {profile?.template_id && (
            <button
              onClick={() => router.push(`/dashboard/preview/${profile.template_id}`)}
              className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-rose-50 shadow-sm hover:shadow-md hover:border-rose-200 active:scale-95 transition-all text-left"
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