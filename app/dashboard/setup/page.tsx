'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction, getProfileAction } from '../../actions/auth'

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    boyName: '',
    girlName: '',
    boyFatherName: '',
    boyMotherName: '',
    girlFatherName: '',
    girlMotherName: '',
    weddingDate: '',
    ceremonyTime: '',
    receptionTime: '',
    dinnerTime: '',
    venueName: '',
    venueAddress: '',
    mapUrl: '',
    additionalNotes: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      const res = await getProfileAction()
      if (res.success && res.data) {
        setFormData({
          boyName: res.data.boy_name || '',
          girlName: res.data.girl_name || '',
          boyFatherName: res.data.boy_father_name || '',
          boyMotherName: res.data.boy_mother_name || '',
          girlFatherName: res.data.girl_father_name || '',
          girlMotherName: res.data.girl_mother_name || '',
          weddingDate: res.data.wedding_date || '',
          ceremonyTime: res.data.ceremony_time || '',
          receptionTime: res.data.reception_time || '',
          dinnerTime: res.data.dinner_time || '',
          venueName: res.data.venue_name || '',
          venueAddress: res.data.venue_address || '',
          mapUrl: res.data.map_url || '',
          additionalNotes: res.data.additional_notes || ''
        })
      }
      setFetching(false)
    }
    loadProfile()
  }, [])

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!formData.boyName || !formData.girlName) {
      setError('Groom and Bride names are required')
      setLoading(false)
      return
    }

    const res = await updateProfileAction(formData)

    if (res.success) {
      setSuccess(true)
setTimeout(() => router.push('/dashboard/select-template'), 1500)    } else {
      setError(res.error || 'Update failed')
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">💍</div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100 via-white to-white p-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 mx-auto"
          >
            ← Back to Dashboard
          </button>
          <div className="text-4xl mb-3">💑</div>
          <h1 className="text-2xl font-serif font-medium text-gray-800">Wedding Details</h1>
          <p className="text-sm text-gray-400 mt-2">Fill in your details — you can update anytime</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8">

          {error && (
            <div className="mb-5 p-3 bg-red-50 text-red-500 text-xs text-center rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-3 bg-green-50 text-green-600 text-xs text-center rounded-xl border border-green-100 font-medium">
              ✅ Saved! Redirecting to templates...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Couple Names */}
            <div>
              <p className="text-[11px] font-bold text-rose-400 tracking-wider uppercase mb-4">💑 Couple Names</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Groom's Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.boyName}
                    placeholder="Nuwan"
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('boyName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Bride's Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.girlName}
                    placeholder="Sanduni"
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('girlName', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Parents Names */}
            <div>
              <p className="text-[11px] font-bold text-rose-400 tracking-wider uppercase mb-4">👨‍👩‍👦 Parents Names</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">🤵 Groom's Side</p>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Father's Name</label>
                    <input
                      type="text"
                      value={formData.boyFatherName}
                      placeholder="Kamal Perera"
                      className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                      onChange={e => update('boyFatherName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Mother's Name</label>
                    <input
                      type="text"
                      value={formData.boyMotherName}
                      placeholder="Nimala Perera"
                      className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                      onChange={e => update('boyMotherName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">👰 Bride's Side</p>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Father's Name</label>
                    <input
                      type="text"
                      value={formData.girlFatherName}
                      placeholder="Nimal Silva"
                      className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                      onChange={e => update('girlFatherName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Mother's Name</label>
                    <input
                      type="text"
                      value={formData.girlMotherName}
                      placeholder="Kamala Silva"
                      className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                      onChange={e => update('girlMotherName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-[11px] font-bold text-rose-400 tracking-wider uppercase mb-4">📅 Wedding Schedule</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Wedding Date</label>
                  <input
                    type="date"
                    value={formData.weddingDate}
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('weddingDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Ceremony Time</label>
                  <input
                    type="time"
                    value={formData.ceremonyTime}
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('ceremonyTime', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Reception Time</label>
                  <input
                    type="time"
                    value={formData.receptionTime}
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('receptionTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Dinner Time</label>
                  <input
                    type="time"
                    value={formData.dinnerTime}
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('dinnerTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Venue */}
            <div>
              <p className="text-[11px] font-bold text-rose-400 tracking-wider uppercase mb-4">📍 Venue Details</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Venue / Hotel Name</label>
                  <input
                    type="text"
                    value={formData.venueName}
                    placeholder="Hilton Colombo"
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('venueName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Full Address</label>
                  <input
                    type="text"
                    value={formData.venueAddress}
                    placeholder="2 Sir Chittampalam A Gardiner Mawatha, Colombo 02"
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('venueAddress', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">Google Maps Link (Optional)</label>
                  <input
                    type="text"
                    value={formData.mapUrl}
                    placeholder="https://maps.google.com/..."
                    className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                    onChange={e => update('mapUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <p className="text-[11px] font-bold text-rose-400 tracking-wider uppercase mb-4">📝 Additional Notes</p>
              <textarea
                value={formData.additionalNotes}
                placeholder="Dress code, special instructions..."
                rows={3}
                className="w-full p-3.5 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all resize-none"
                onChange={e => update('additionalNotes', e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-400 hover:bg-rose-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-rose-200 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Choose Template →'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}