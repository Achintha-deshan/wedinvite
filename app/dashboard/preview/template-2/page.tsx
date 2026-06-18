'use client'

import { useEffect, useState } from 'react'
import { getProfileAction, updateMediaAction } from '../../../actions/auth'
import { uploadToCloudinary } from '../../../../lib/cloudinary'

const PLACEHOLDER_BOY = 'https://api.dicebear.com/7.x/avataaars/svg?seed=groomwalk&backgroundColor=transparent&clothing=blazerAndSweater'
const PLACEHOLDER_GIRL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=bridewalk&backgroundColor=transparent&clothing=overall'
const PLACEHOLDER_TOGETHER = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80'

const SAGE = '#7C9070'
const SAGE_DARK = '#3F4D38'
const CREAM = '#F7F6F1'
const DARK = '#1F231D'

type SlideName = 'cover' | 'calendar' | 'main'

export default function Template2Preview() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState<SlideName>('cover')
  const [calendarRevealed, setCalendarRevealed] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [rsvpChoice, setRsvpChoice] = useState<'yes' | 'no' | null>(null)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpPhone, setRsvpPhone] = useState('')

  const [draftPhotos, setDraftPhotos] = useState<Record<string, string>>({})
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await getProfileAction()
      if (res.success) {
        setProfile(res.data)
        setDraftPhotos({
          together_photo_url: res.data.together_photo_url || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!profile?.wedding_date) return
    const target = new Date(profile.wedding_date).getTime()
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [profile])

  const handlePlay = () => {
    setSlide('calendar')
    setTimeout(() => setCalendarRevealed(true), 200)
    setTimeout(() => setSlide('main'), 4000)
  }

  const handleReplay = () => {
    setSlide('cover')
    setCalendarRevealed(false)
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const parts = time.split(':')
    const hour = parseInt(parts[0])
    const displayHour = hour > 12 ? hour - 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return displayHour + ':' + parts[1] + ' ' + ampm
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingKey(key)
    try {
      const url = await uploadToCloudinary(file)
      setDraftPhotos(prev => ({ ...prev, [key]: url }))
      setHasChanges(true)
    } catch (err) {
      alert('Upload failed. Please try again.')
    }
    setUploadingKey(null)
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    await updateMediaAction({
      togetherPhotoUrl: draftPhotos.together_photo_url || undefined,
    })
    setSaving(false)
    setHasChanges(false)
    alert('Saved!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="text-2xl animate-pulse" style={{ color: SAGE_DARK }}>🍃</div>
      </div>
    )
  }

  const boyName = profile?.boy_name || 'Kasun'
  const girlName = profile?.girl_name || 'Hiruni'
  const venueName = profile?.venue_name || 'Galle Face Hotel'
  const venueAddress = profile?.venue_address || 'Colombo, Sri Lanka'
  const weddingDate = profile?.wedding_date || ''
  const dObj = weddingDate ? new Date(weddingDate) : new Date(2026, 4, 9)
  const ceremonyTime = profile?.ceremony_time || ''
  const receptionTime = profile?.reception_time || ''
  const dinnerTime = profile?.dinner_time || ''
  const mapUrl = profile?.map_url || ''
  const togetherPhoto = draftPhotos.together_photo_url || PLACEHOLDER_TOGETHER

  const year = dObj.getFullYear()
  const month = dObj.getMonth()
  const weddingDay = dObj.getDate()
  const monthName = dObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  const Leaves = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-base"
          style={{
            top: `${5 + Math.random() * 85}%`,
            left: `${Math.random() * 95}%`,
            opacity: 0.5 + Math.random() * 0.4,
            transform: `rotate(${Math.random() * 360}deg)`,
            color: SAGE,
          }}
        >
          🍃
        </div>
      ))}
    </div>
  )

  if (slide === 'cover') {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: CREAM }}>
        <Leaves />
        <div className="relative z-10 text-center px-6 animate-[fadeIn_1.2s_ease-out]">
          <div className="flex justify-center items-end gap-2 mb-8">
            <img src={PLACEHOLDER_GIRL} alt="Bride illustration" className="w-24 h-36 object-contain" />
            <img src={PLACEHOLDER_BOY} alt="Groom illustration" className="w-24 h-36 object-contain scale-x-[-1]" />
          </div>
          <h1 className="font-serif italic text-4xl mb-3" style={{ color: SAGE_DARK }}>{boyName} & {girlName}</h1>
          <p className="text-xs tracking-[0.3em] uppercase mb-10" style={{ color: SAGE_DARK, opacity: 0.7 }}>Are getting married</p>

          <button onClick={handlePlay} className="group relative w-20 h-20 mx-auto mb-4 flex items-center justify-center" aria-label="Play invitation">
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(124,144,112,0.3)' }}></span>
            <span className="relative w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-xl transition-transform group-active:scale-95" style={{ background: SAGE_DARK, color: '#fff' }}>
              ▶
            </span>
          </button>
          <p className="text-xs tracking-widest uppercase" style={{ color: SAGE_DARK, opacity: 0.7 }}>Tap to play invitation</p>
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    )
  }

  if (slide === 'calendar') {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-6" style={{ background: CREAM }}>
        <Leaves />
        <div className={`relative z-10 text-center max-w-sm w-full transition-all duration-1000 ${calendarRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: SAGE_DARK, opacity: 0.7 }}>Save the date</p>
          <h1 className="font-serif italic text-3xl mb-1" style={{ color: SAGE_DARK }}>{boyName} &amp; {girlName}</h1>
          <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: SAGE_DARK, opacity: 0.6 }}>{monthName}</p>

          <div className="rounded-2xl p-4 shadow-sm" style={{ background: '#fff', border: `1px solid ${SAGE}40` }}>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-[10px] font-medium" style={{ color: SAGE_DARK, opacity: 0.7 }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, i) => (
                <div key={i} className="aspect-square flex items-center justify-center text-xs">
                  {day ? (
                    day === weddingDay ? (
                      <span className="w-full h-full rounded-full flex items-center justify-center font-medium" style={{ background: SAGE_DARK, color: '#fff' }}>
                        ♥
                      </span>
                    ) : (
                      <span style={{ color: DARK, opacity: 0.8 }}>{day}</span>
                    )
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <p className="font-serif italic text-sm mt-6" style={{ color: SAGE_DARK }}>Formal invitation to follow</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: DARK }}>

      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: CREAM, borderBottom: `1px solid ${SAGE}30` }}>
        <span className="font-serif italic text-lg" style={{ color: SAGE_DARK }}>{boyName} & {girlName}</span>
        <button
          onClick={() => setEditMode(!editMode)}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: editMode ? SAGE_DARK : 'transparent', color: editMode ? '#fff' : SAGE_DARK, border: `1px solid ${SAGE_DARK}` }}
        >
          {editMode ? 'Done' : '✏️ Edit'}
        </button>
      </nav>

      <section className="relative px-6 py-12" style={{ background: `${SAGE}15` }}>
        <Leaves />
        <div className="relative max-w-xs mx-auto z-10">
          <div className="rounded-t-full overflow-hidden shadow-lg" style={{ border: `1px solid ${SAGE}40` }}>
            <img src={togetherPhoto} alt="Couple" className="w-full h-80 object-cover" />
          </div>
          {editMode && (
            <label
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-sm shadow-lg"
              style={{ background: SAGE_DARK, color: '#fff' }}
            >
              {uploadingKey === 'together_photo_url' ? '...' : '📷'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'together_photo_url')} />
            </label>
          )}
        </div>
      </section>

      <section className="relative px-6 py-16 text-center overflow-hidden">
        <Leaves />
        <p className="font-serif italic text-xl mb-8 relative z-10" style={{ color: DARK }}>
          "Together with their families, we invite you to celebrate our joyful union."
        </p>
        <p className="text-sm mb-6 leading-relaxed relative z-10" style={{ color: DARK, opacity: 0.75 }}>
          We met in an unexpected way, and it turned into the most beautiful chapter of our lives.
        </p>
        <p className="text-sm mb-10 leading-relaxed relative z-10" style={{ color: DARK, opacity: 0.75 }}>
          Now, we are excited to start our journey together forever.
        </p>
        <p className="font-serif italic text-2xl relative z-10" style={{ color: SAGE_DARK }}>Happily Ever After</p>
      </section>

      <section className="px-6 py-16 text-center" style={{ background: DARK }}>
        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#fff', opacity: 0.6 }}>Counting down to the big day</p>
        <h2 className="font-serif text-2xl mb-8" style={{ color: '#fff' }}>{boyName.toUpperCase()} & {girlName.toUpperCase()}</h2>
        <div className="flex justify-center gap-3">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hrs', value: countdown.hours },
            { label: 'Min', value: countdown.minutes },
            { label: 'Sec', value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="rounded-xl px-4 py-3 min-w-[64px]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,144,112,0.4)' }}>
              <p className="text-2xl font-serif" style={{ color: SAGE }}>{item.value}</p>
              <p className="text-[10px] uppercase mt-1" style={{ color: '#fff', opacity: 0.5 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {(profile?.boy_photo_url || profile?.girl_photo_url || togetherPhoto) && (
        <section className="relative px-6 py-16 overflow-hidden">
          <Leaves />
          <p className="text-center text-xs tracking-[0.3em] uppercase mb-8 relative z-10" style={{ color: SAGE_DARK }}>Our moments</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto relative z-10">
            <div className="rounded-lg overflow-hidden shadow-md p-2" style={{ background: '#fff' }}>
              <img src={profile?.boy_photo_url || PLACEHOLDER_BOY} alt="" className="w-full h-32 object-cover rounded" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-md p-2 mt-4" style={{ background: '#fff' }}>
              <img src={profile?.girl_photo_url || PLACEHOLDER_GIRL} alt="" className="w-full h-32 object-cover rounded" />
            </div>
            <div className="col-span-2 rounded-t-full overflow-hidden shadow-md p-2 mx-auto max-w-[200px]" style={{ background: '#fff' }}>
              <img src={togetherPhoto} alt="" className="w-full h-44 object-cover rounded-t-full" />
            </div>
          </div>
        </section>
      )}

      <section className="relative px-6 py-16 text-center overflow-hidden" style={{ background: `${SAGE}15` }}>
        <Leaves />
        <p className="text-xs tracking-[0.3em] uppercase mb-2 relative z-10" style={{ color: SAGE_DARK }}>The celebration</p>
        <h2 className="font-serif italic text-3xl mb-8 relative z-10" style={{ color: DARK }}>When & Where</h2>

        <div className="max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg relative z-10" style={{ background: CREAM }}>
          <div className="h-40 flex items-center justify-center" style={{ background: '#dde3d6' }}>
            <span className="text-3xl">📍</span>
          </div>
          <div className="p-5 text-left">
            <p className="font-serif text-lg" style={{ color: DARK }}>{venueName}</p>
            <p className="text-sm mt-1" style={{ color: DARK, opacity: 0.7 }}>{venueAddress}</p>
            <div className="mt-4 space-y-2">
              {ceremonyTime && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: SAGE_DARK }}>Ceremony</span>
                  <span>{formatTime(ceremonyTime)}</span>
                </div>
              )}
              {receptionTime && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: SAGE_DARK }}>Reception</span>
                  <span>{formatTime(receptionTime)}</span>
                </div>
              )}
              {dinnerTime && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: SAGE_DARK }}>The Party</span>
                  <span>{formatTime(dinnerTime)}</span>
                </div>
              )}
            </div>
            {mapUrl && (
              <button
                onClick={() => window.open(mapUrl, '_blank')}
                className="inline-block mt-4 text-xs px-4 py-2 rounded-full"
                style={{ background: SAGE_DARK, color: '#fff' }}
              >
                Get directions
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center max-w-sm mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: SAGE_DARK }}>RSVP</p>

        <div className="flex justify-center gap-8 mb-8">
          <button onClick={() => setRsvpChoice('yes')} className="flex flex-col items-center gap-2">
            <span className="text-4xl" style={{ color: rsvpChoice === 'yes' ? SAGE_DARK : '#c9c9c9' }}>♡</span>
            <span className="text-[11px] tracking-wide" style={{ color: DARK }}>I WILL BE<br />ATTENDING</span>
          </button>
          <button onClick={() => setRsvpChoice('no')} className="flex flex-col items-center gap-2">
            <span className="text-4xl" style={{ color: rsvpChoice === 'no' ? SAGE_DARK : '#c9c9c9' }}>♡</span>
            <span className="text-[11px] tracking-wide" style={{ color: DARK }}>I WILL NOT BE<br />ATTENDING</span>
          </button>
        </div>

        <div className="text-left mb-4">
          <p className="text-xs font-medium tracking-wide mb-2" style={{ color: DARK }}>FULL NAME</p>
          <input
            type="text"
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
            placeholder="e.g. Kasun Perera"
            className="w-full p-3 rounded-lg text-sm outline-none"
            style={{ border: `1px solid ${SAGE}50`, background: '#fff' }}
          />
        </div>

        <div className="text-left mb-6">
          <p className="text-xs font-medium tracking-wide mb-2" style={{ color: DARK }}>PHONE NUMBER</p>
          <input
            type="text"
            value={rsvpPhone}
            onChange={(e) => setRsvpPhone(e.target.value)}
            placeholder="e.g. 071 234 5678"
            className="w-full p-3 rounded-lg text-sm outline-none"
            style={{ border: `1px solid ${SAGE}50`, background: '#fff' }}
          />
        </div>

        <button
          className="w-full py-4 rounded-lg text-xs tracking-widest uppercase font-medium"
          style={{ background: DARK, color: '#fff' }}
        >
          Confirm RSVP
        </button>
        <p className="text-[10px] mt-4" style={{ color: DARK, opacity: 0.5 }}>Preview only — guests will see this with their own name</p>

        <button onClick={handleReplay} className="mt-6 text-[10px] underline" style={{ color: SAGE_DARK, opacity: 0.5 }}>
          Replay invitation
        </button>
      </section>

      <footer className="text-center py-8 px-6" style={{ background: `${SAGE}15` }}>
        <p className="font-serif italic text-lg" style={{ color: SAGE_DARK }}>{boyName} & {girlName}</p>
        <p className="text-[10px] mt-1" style={{ color: DARK, opacity: 0.5 }}>With love and gratitude</p>
      </footer>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between gap-3 z-50" style={{ background: DARK }}>
          <p className="text-xs text-white">Unsaved changes</p>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-xs font-medium disabled:opacity-50"
            style={{ background: SAGE, color: DARK }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  )
}