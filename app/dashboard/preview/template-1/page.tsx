'use client'

import { useEffect, useState } from 'react'
import { getProfileAction, updateMediaAction } from '../../../actions/auth'
import { uploadToCloudinary } from '../../../../lib/cloudinary'

const PINK = '#E0728A'
const PINK_DARK = '#9C3F58'
const PINK_DEEP = '#7A2A40'
const CREAM = '#FBF3EE'
const GOLD = '#C99A4B'
const DARK = '#3A2A26'

type SlideName = 'cover' | 'calendar' | 'story' | 'details'

export default function Template1Preview() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState<SlideName>('cover')
  const [calendarRevealed, setCalendarRevealed] = useState(false)
  const [storyRevealed, setStoryRevealed] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const [draftPhotos, setDraftPhotos] = useState<Record<string, string>>({})
  const [draftMusicUrl, setDraftMusicUrl] = useState('')
  const [musicInputOpen, setMusicInputOpen] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await getProfileAction()
      if (res.success) {
        setProfile(res.data)
        setDraftPhotos({
          together_photo_url: res.data.together_photo_url || '',
          story_photo_url: res.data.story_photo_url || '',
        })
        setDraftMusicUrl(res.data.music_youtube_url || '')
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
    setMusicStarted(true)
    setSlide('calendar')
    setTimeout(() => setCalendarRevealed(true), 200)
    setTimeout(() => {
      setSlide('story')
      setTimeout(() => setStoryRevealed(true), 100)
    }, 3800)
    setTimeout(() => setSlide('details'), 6800)
  }

  const handleReplay = () => {
    setSlide('cover')
    setCalendarRevealed(false)
    setStoryRevealed(false)
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const parts = time.split(':')
    const h = parts[0]
    const m = parts[1]
    const hour = parseInt(h)
    const displayHour = hour > 12 ? hour - 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return displayHour + ':' + m + ' ' + ampm
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const handleMusicSave = () => {
    setMusicInputOpen(false)
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    await updateMediaAction({
      togetherPhotoUrl: draftPhotos.together_photo_url || undefined,
      storyPhotoUrl: draftPhotos.story_photo_url || undefined,
      musicYoutubeUrl: draftMusicUrl,
    })
    setSaving(false)
    setHasChanges(false)
    alert('Saved!')
  }

  const handleDiscard = () => {
    setDraftPhotos({
      together_photo_url: profile?.together_photo_url || '',
      story_photo_url: profile?.story_photo_url || '',
    })
    setDraftMusicUrl(profile?.music_youtube_url || '')
    setHasChanges(false)
  }

  const getYoutubeEmbedUrl = (url: string, autoplay: boolean) => {
    if (!url) return ''
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplay ? 1 : 0}&mute=0` : ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="text-2xl animate-pulse" style={{ color: PINK_DARK }}>♥</div>
      </div>
    )
  }

  const boyName = profile?.boy_name || 'Denuwan'
  const girlName = profile?.girl_name || 'Janani'
  const venueName = profile?.venue_name || 'Galle Face Hotel'
  const venueAddress = profile?.venue_address || 'Colombo, Sri Lanka'
  const weddingDate = profile?.wedding_date || ''
  const weddingDateText = weddingDate ? formatDate(weddingDate) : 'Saturday, August 14, 2026'
  const boyFather = profile?.boy_father_name || 'Mr. Perera'
  const boyMother = profile?.boy_mother_name || 'Mrs. Perera'
  const girlFather = profile?.girl_father_name || 'Mr. Silva'
  const girlMother = profile?.girl_mother_name || 'Mrs. Silva'
  const mapUrl = profile?.map_url || ''
  const togetherPhoto = draftPhotos.together_photo_url
  const ceremonyTime = profile?.ceremony_time || ''
  const receptionTime = profile?.reception_time || ''
  const dinnerTime = profile?.dinner_time || ''
  const notes = profile?.additional_notes || ''

  const dObj = weddingDate ? new Date(weddingDate) : new Date(2026, 7, 14)
  const year = dObj.getFullYear()
  const month = dObj.getMonth()
  const weddingDay = dObj.getDate()
  const monthName = dObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  const Petals = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-sm"
          style={{
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 95}%`,
            opacity: 0.4 + Math.random() * 0.4,
            transform: `rotate(${Math.random() * 360}deg)`,
            color: PINK,
          }}
        >
          ❀
        </div>
      ))}
    </div>
  )

  const EditBadge = ({ slotKey }: { slotKey: string }) => (
    <label
      className="absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-sm shadow-lg z-30"
      style={{ background: PINK_DEEP, color: '#fff', border: '2px solid #fff' }}
    >
      {uploadingKey === slotKey ? '...' : '✏️'}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, slotKey)} />
    </label>
  )

  const MusicPlayer = () => (
    draftMusicUrl && getYoutubeEmbedUrl(draftMusicUrl, musicStarted) ? (
      <iframe
        src={getYoutubeEmbedUrl(draftMusicUrl, musicStarted)}
        title="Wedding music"
        className="hidden"
        allow="autoplay"
      ></iframe>
    ) : null
  )

  if (slide === 'cover') {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #FCE4EC 60%, #F8D7E0 100%)` }}>
        <Petals />
        <div className="relative z-10 text-center px-6 animate-[fadeIn_1.2s_ease-out]">
          <div className="text-xl mb-5" style={{ color: PINK_DEEP }}>❀ ❀ ❀</div>
          <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>The Wedding Of</p>
          <p className="text-[11px] mb-4" style={{ color: GOLD, opacity: 0.8 }}>විවාහ මංගල්‍යය</p>
          <h1 className="font-serif text-4xl mb-1" style={{ color: PINK_DEEP }}>{boyName}</h1>
          <p className="text-xl font-serif italic my-1" style={{ color: PINK }}>&amp;</p>
          <h1 className="font-serif text-4xl mb-10" style={{ color: PINK_DEEP }}>{girlName}</h1>

          <button onClick={handlePlay} className="group relative w-20 h-20 mx-auto mb-4 flex items-center justify-center" aria-label="Play invitation">
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(224,114,138,0.4)' }}></span>
            <span className="relative w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-xl transition-transform group-active:scale-95" style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})`, color: '#fff' }}>
              ▶
            </span>
          </button>
          <p className="text-xs tracking-widest uppercase" style={{ color: PINK_DEEP }}>Tap to play invitation</p>
          <p className="text-[11px]" style={{ color: GOLD, opacity: 0.8 }}>ආරාධනය බැලීමට ස්පර්ශ කරන්න</p>
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    )
  }

  if (slide === 'calendar') {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-6" style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #FCE4EC 60%, #F8D7E0 100%)` }}>
        <MusicPlayer />
        <Petals />
        <div className={`relative z-10 text-center max-w-sm w-full transition-all duration-1000 ${calendarRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: GOLD }}>Save the date</p>
          <h1 className="font-serif text-3xl italic mb-1" style={{ color: PINK_DEEP }}>{boyName} &amp; {girlName}</h1>
          <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: GOLD, opacity: 0.85 }}>{monthName}</p>

          <div className="rounded-2xl p-4 shadow-lg" style={{ background: '#fff', border: `1px solid ${PINK}50` }}>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-[10px] font-medium" style={{ color: GOLD, opacity: 0.85 }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, i) => (
                <div key={i} className="aspect-square flex items-center justify-center text-xs">
                  {day ? (
                    day === weddingDay ? (
                      <span className="w-full h-full rounded-full flex items-center justify-center font-medium" style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})`, color: '#fff' }}>
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

          <p className="font-serif italic text-sm mt-6" style={{ color: PINK_DEEP }}>Formal invitation to follow</p>
        </div>
      </div>
    )
  }

 // ===================== SLIDE: STORY (Improved) =====================
if (slide === 'story') {
  const storyBackgroundPhoto = togetherPhoto || '/assests/images/couple1.png'

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-6">
      <MusicPlayer />

      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <img
          src={storyBackgroundPhoto}
          alt="Background"
          className="w-full h-full object-cover transition-all duration-[1600ms]"
          // Blur එක අඩු කර (පැහැදිලි බව වැඩි කිරීමට), brightness සහ scale පාලනය කර ඇත
          style={{ 
            filter: storyRevealed ? 'blur(4px) brightness(0.8)' : 'blur(10px) brightness(0.5)', 
            transform: storyRevealed ? 'scale(1.02)' : 'scale(1.1)' 
          }}
        />
        {/* වඩාත් අලංකාර Dark Overlay එකක් */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Content Section */}
      <div className={`relative z-10 text-center max-w-sm w-full transition-all duration-1000 ${storyRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: '#ffd700' }}>OUR STORY</p>
        
        <div className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
          {/* ඉංග්‍රීසි Caption එක */}
          <p className="text-lg font-serif italic text-white leading-relaxed mb-6">
            "Unexpectedly met, deeply in love, and now ready to begin our beautiful journey together."
          </p>
          
          <div className="w-16 h-[1px] bg-white/50 mx-auto mb-6"></div>

          <h1 className="font-serif text-3xl font-light tracking-wide" style={{ color: '#fff' }}>
            {boyName} <span className="text-white/60">&</span> {girlName}
          </h1>
        </div>

        {editMode && (
          <label className="inline-flex items-center gap-2 mt-6 text-xs px-5 py-2.5 rounded-full cursor-pointer bg-white text-gray-800 hover:bg-gray-100 transition shadow-lg">
            {uploadingKey === 'together_photo_url' ? 'Uploading...' : '✏️ Change Photo'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'together_photo_url')} />
          </label>
        )}
      </div>
    </div>
  )
}
 const getMapEmbedUrl = (url: string) => {
    if (!url) return ''
    // If it's already an embed URL, use as-is
    if (url.includes('/maps/embed')) return url
    // Try to extract coordinates from a standard Google Maps URL
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`
    }
    // Try to extract a place query from /maps/place/ URLs
    const placeMatch = url.match(/\/maps\/place\/([^/@]+)/)
    if (placeMatch) {
      return `https://maps.google.com/maps?q=${decodeURIComponent(placeMatch[1])}&z=15&output=embed`
    }
    // Fallback: treat the whole string as a search query (works for short share links pasted as text venue names)
    return ''
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'Playfair Display', serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />

      {togetherPhoto ? (
        <div className="fixed inset-0 z-0">
          <img src={togetherPhoto} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(251,243,238,0.55), rgba(251,243,238,0.92))', backdropFilter: 'blur(2px)' }}></div>
        </div>
      ) : (
        <div className="fixed inset-0 z-0">
          <img src="/assests/images/couple2.jpeg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(251,243,238,0.6), rgba(251,243,238,0.93))', backdropFilter: 'blur(2px)' }}></div>
        </div>
      )}

      <MusicPlayer />

      <div className="relative z-10 max-w-md mx-auto px-6 py-16 text-center">

        <div className="flex justify-center mb-3 animate-[fadeUp_0.8s_ease-out]">
          <div className="relative p-1 rounded-full shadow-xl" style={{ background: `linear-gradient(135deg, ${GOLD}, ${PINK})` }}>
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white relative">
              {togetherPhoto ? (
                <img src={togetherPhoto} alt="Couple" className="w-full h-full object-cover" />
              ) : (
                <img src="/assests/images/couple1.png" alt="Couple" className="w-full h-full object-cover" />
              )}
              {editMode && <EditBadge slotKey="together_photo_url" />}
            </div>
          </div>
        </div>

        <div className="mb-8 animate-[fadeUp_0.8s_ease-out_0.1s_both]">
          <h1 className="text-5xl mb-2 leading-tight" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            {boyName} <span className="text-3xl italic" style={{ color: PINK }}>&</span> {girlName}
          </h1>
          <p className="text-sm tracking-[0.3em] uppercase font-medium" style={{ color: GOLD }}>Getting Married</p>
          <p className="text-[11px] mt-1" style={{ color: GOLD, opacity: 0.8 }}>විවාහ වෙමින්</p>
        </div>

        {/* Card: Parents */}
        <div className="grid grid-cols-1 gap-4 mb-6 p-6 rounded-3xl shadow-xl animate-[fadeUp_0.8s_ease-out_0.2s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>Son of</p>
            <p className="text-[10px] mb-1" style={{ color: GOLD, opacity: 0.75 }}>පුත්‍රයා</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{boyFather} & {boyMother}</p>
          </div>
          <div className="text-lg italic" style={{ color: PINK }}>&</div>
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>Daughter of</p>
            <p className="text-[10px] mb-1" style={{ color: GOLD, opacity: 0.75 }}>දියණිය</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{girlFather} & {girlMother}</p>
          </div>
        </div>

        {/* Card: Countdown */}
        <div className="mb-6 p-6 rounded-3xl shadow-xl animate-[fadeUp_0.8s_ease-out_0.3s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>Until we say "I Do"</p>
          <div className="flex justify-center gap-3">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hrs', value: countdown.hours },
              { label: 'Min', value: countdown.minutes },
              { label: 'Sec', value: countdown.seconds },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl w-16 py-4 shadow-lg" style={{ background: `linear-gradient(160deg, ${PINK}, ${PINK_DEEP})` }}>
                <span className="block text-xl text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>{item.value}</span>
                <span className="block text-[8px] uppercase tracking-widest text-white opacity-80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Date & Schedule */}
        <div className="space-y-5 mb-6 p-6 rounded-3xl shadow-xl animate-[fadeUp_0.8s_ease-out_0.4s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>Wedding Date</p>
            <p className="text-lg italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{weddingDateText}</p>
          </div>

          <div className="h-px" style={{ background: `${PINK}30` }}></div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Schedule</p>
            <div className="space-y-2">
              {ceremonyTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: PINK_DEEP }}>Ceremony</span>
                  <span style={{ color: DARK }}>{formatTime(ceremonyTime)}</span>
                </div>
              )}
              {receptionTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: PINK_DEEP }}>Reception</span>
                  <span style={{ color: DARK }}>{formatTime(receptionTime)}</span>
                </div>
              )}
              {dinnerTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: PINK_DEEP }}>Dinner</span>
                  <span style={{ color: DARK }}>{formatTime(dinnerTime)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card: Venue with embedded map */}
        <div className="mb-6 rounded-3xl shadow-xl overflow-hidden animate-[fadeUp_0.8s_ease-out_0.45s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          {mapUrl && getMapEmbedUrl(mapUrl) ? (
            <div className="w-full h-44">
              <iframe
                src={getMapEmbedUrl(mapUrl)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Venue location"
              ></iframe>
            </div>
          ) : null}
          <div className="p-6 text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>Venue</p>
            <p className="text-lg italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{venueName}</p>
            <p className="text-xs opacity-80" style={{ color: DARK }}>{venueAddress}</p>
            {mapUrl && (
              <button
                onClick={() => window.open(mapUrl, '_blank')}
                className="inline-block mt-3 text-xs px-4 py-2 rounded-full shadow-md"
                style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})`, color: '#fff' }}
              >
                Open in Google Maps
              </button>
            )}
          </div>
        </div>

        {editMode && (
          <div className="mb-6 p-5 rounded-3xl shadow-lg animate-[fadeUp_0.8s_ease-out_0.5s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>🎵 Music</p>
            {musicInputOpen ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftMusicUrl}
                  onChange={(e) => setDraftMusicUrl(e.target.value)}
                  placeholder="Paste YouTube URL"
                  className="flex-1 p-2.5 rounded-xl text-xs outline-none"
                  style={{ background: '#fff', border: `1px solid ${PINK}50`, color: DARK }}
                />
                <button onClick={handleMusicSave} className="px-4 py-2.5 rounded-xl text-xs font-medium" style={{ background: PINK_DEEP, color: '#fff' }}>Set</button>
              </div>
            ) : (
              <button onClick={() => setMusicInputOpen(true)} className="text-xs px-4 py-2 rounded-full transition-all" style={{ color: PINK_DEEP, border: `1px solid ${PINK}` }}>
                {draftMusicUrl ? '✏️ Change music' : '+ Add music'}
              </button>
            )}
          </div>
        )}

        {notes && (
          <div className="rounded-3xl p-5 mb-6 shadow-lg animate-[fadeUp_0.8s_ease-out_0.5s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: GOLD }}>Note</p>
            <p className="text-sm" style={{ color: DARK }}>{notes}</p>
          </div>
        )}

        {/* Card: RSVP */}
        <div className="mb-4 p-6 rounded-3xl shadow-xl animate-[fadeUp_0.8s_ease-out_0.6s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>Will you be attending?</p>
          <p className="text-[10px] mb-4 opacity-60" style={{ color: DARK }}>Preview only — guests will see this with their own name</p>
          <div className="flex gap-3 justify-center">
            <button className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})` }}>
              Joyfully Accept
            </button>
            <button className="px-8 py-3.5 rounded-2xl text-sm font-medium border transition-all" style={{ borderColor: PINK, color: PINK_DEEP, background: 'rgba(255,255,255,0.6)' }}>
              Decline
            </button>
          </div>
        </div>

        <p className="mt-8 text-xs italic opacity-70" style={{ color: DARK }}>We look forward to celebrating with you.</p>

        <button onClick={handleReplay} className="mt-6 text-[10px] underline opacity-60" style={{ color: PINK_DEEP }}>
          Replay invitation
        </button>
      </div>

      <button
        onClick={() => setEditMode(!editMode)}
        className="fixed top-4 right-4 text-xs px-3 py-2 rounded-full z-50 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})`, color: '#fff' }}
      >
        {editMode ? 'Done editing' : '✏️ Edit'}
      </button>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between gap-3 z-50" style={{ background: '#fff', borderTop: `1px solid ${PINK}40` }}>
          <p className="text-xs" style={{ color: PINK_DEEP }}>You have unsaved changes</p>
          <div className="flex gap-2">
            <button onClick={handleDiscard} className="px-4 py-2.5 rounded-xl text-xs" style={{ border: `1px solid ${PINK}`, color: PINK_DEEP }}>
              Discard
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-medium disabled:opacity-50"
              style={{ background: PINK_DEEP, color: '#fff' }}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}