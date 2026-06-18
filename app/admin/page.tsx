'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAdminAction, getAllCouplesAction, togglePaymentStatusAction, changeTemplateAction, deleteCoupleAction } from '../actions/admin'
import { signOutAction } from '../actions/auth'

const AVAILABLE_TEMPLATES = ['template-1', 'template-2', 'template-3', 'template-4']

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [couples, setCouples] = useState<any[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const adminCheck = await checkAdminAction()
      if (!adminCheck.isAdmin) {
        router.push('/dashboard')
        return
      }

      const res = await getAllCouplesAction()
      if (res.success) setCouples(res.data || [])
      setLoading(false)
    }
    init()
  }, [])

  const handleTogglePayment = async (coupleId: string, currentStatus: boolean) => {
    setUpdating(coupleId)
    const res = await togglePaymentStatusAction(coupleId, !currentStatus)
    if (res.success) {
      setCouples(prev =>
        prev.map(c => c.id === coupleId ? { ...c, is_paid: !currentStatus } : c)
      )
    }
    setUpdating(null)
  }

  const handleChangeTemplate = async (coupleId: string, newTemplateId: string) => {
    setUpdating(coupleId)
    const res = await changeTemplateAction(coupleId, newTemplateId)
    if (res.success) {
      setCouples(prev =>
        prev.map(c => c.id === coupleId ? { ...c, template_id: newTemplateId } : c)
      )
    } else {
      alert(res.error || 'Failed to change template')
    }
    setUpdating(null)
  }

  const handleDeleteCouple = async (coupleId: string, label: string) => {
    if (!confirm(`Delete ${label} and all their guests? This cannot be undone.`)) return
    setDeleting(coupleId)
    const res = await deleteCoupleAction(coupleId)
    if (res.success) {
      setCouples(prev => prev.filter(c => c.id !== coupleId))
    } else {
      alert(res.error || 'Failed to delete couple')
    }
    setDeleting(null)
  }

  const handleSignOut = async () => {
    await signOutAction()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-4xl animate-pulse">⚙️</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <span className="font-medium text-gray-800">Admin Panel</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs px-4 py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-xs text-gray-400 mb-1">Total Couples</p>
            <p className="text-2xl font-bold text-gray-800">{couples.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-xs text-gray-400 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {couples.filter(c => c.is_paid).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-xs text-gray-400 mb-1">Unpaid</p>
            <p className="text-2xl font-bold text-red-500">
              {couples.filter(c => !c.is_paid).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-xs text-gray-400 mb-1">Total Guests</p>
            <p className="text-2xl font-bold text-gray-800">
              {couples.reduce((sum, c) => sum + (c.guest_count || 0), 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-medium text-gray-800">All Couples</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Couple</th>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Wedding Date</th>
                  <th className="px-6 py-3 text-left">Venue</th>
                  <th className="px-6 py-3 text-left">Guests</th>
                  <th className="px-6 py-3 text-left">Profile</th>
                  <th className="px-6 py-3 text-left">Template</th>
                  <th className="px-6 py-3 text-left">Payment</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {couples.map((couple) => (
                  <tr key={couple.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {couple.boy_name && couple.girl_name
                        ? `${couple.boy_name} & ${couple.girl_name}`
                        : '— Not set —'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {couple.users?.username || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {couple.users?.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {couple.wedding_date
                        ? new Date(couple.wedding_date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {couple.venue_name || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {couple.guest_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        couple.is_profile_completed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {couple.is_profile_completed ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={couple.template_id || ''}
                        onChange={(e) => handleChangeTemplate(couple.id, e.target.value)}
                        disabled={updating === couple.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none disabled:opacity-50"
                      >
                        <option value="">— None —</option>
                        {AVAILABLE_TEMPLATES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePayment(couple.id, couple.is_paid)}
                        disabled={updating === couple.id}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                          couple.is_paid
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-red-100 text-red-500 hover:bg-red-200'
                        } disabled:opacity-50`}
                      >
                        {updating === couple.id ? '...' : couple.is_paid ? '✓ Paid' : '✗ Unpaid'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteCouple(couple.id, `${couple.boy_name || 'Unknown'} & ${couple.girl_name || 'Unknown'}`)}
                        disabled={deleting === couple.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                      >
                        {deleting === couple.id ? '...' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {couples.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No couples registered yet
            </div>
          )}
        </div>

      </div>
    </div>
  )
}