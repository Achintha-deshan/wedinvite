'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getInvitationByTokenAction, submitRsvpAction } from '../../actions/guests'

const PINK = '#E0728A'
const PINK_DARK = '#9C3F58'
const PINK_DEEP = '#7A2A40'
const CREAM = '#FBF3EE'
const GOLD = '#C99A4B'
const DARK = '#3A2A26'

type SlideName = 'cover' | 'calendar' | 'story' | 'details'

export default function GuestInvitePage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [guest, setGuest] = useState<any>(null)
  const [couple, setCouple] = useState<any>(null)

  const [slide, setSlide] = useState<SlideName>('cover')
  const [calendarRevealed, setCalendarRevealed] = useState(false)
  const [storyRevealed, setStoryRevealed] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const [submitting, setSubmitting] = useState(false)
  const [responded, setResponded] = useState(false)
  const [responseStatus, setResponseStatus] = useState<'confirmed' | 'declined' | null>(null)
  const [guestCount, setGuestCount] = useState(1)
  const [showCountPicker, setShowCountPicker] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await getInvitationByTokenAction(token)
      if (res.success) {
        setGuest(res.guest)
        setCouple(res.couple)
        if (res.guest.rsvp_status === 'confirmed' || res.guest.rsvp_status === 'declined') {
          setResponded(true)
          setResponseStatus(res.guest.rsvp_status)
        }
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [token])

  useEffect(() => {
    if (!couple?.wedding_date) return
    const target = new Date(couple.wedding_date).getTime()
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
  }, [couple])

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

  const handleAccept = () => setShowCountPicker(true)

  const handleConfirmAccept = async () => {
    setSubmitting(true)
    const res = await submitRsvpAction(token, 'confirmed', guestCount)
    setSubmitting(false)
    if (res.success) {
      setResponded(true)
      setResponseStatus('confirmed')
      setShowCountPicker(false)
    }
  }

  const handleDecline = async () => {
    setSubmitting(true)
    const res = await submitRsvpAction(token, 'declined', 0)
    setSubmitting(false)
    if (res.success) {
      setResponded(true)
      setResponseStatus('declined')
    }
  }

  const getYoutubeEmbedUrl = (url: string, autoplay: boolean) => {
    if (!url) return ''
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplay ? 1 : 0}&mute=0` : ''
  }

  const getMapEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('/maps/embed')) return url
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`
    }
    const placeMatch = url.match(/\/maps\/place\/([^/@]+)/)
    if (placeMatch) {
      return `https://maps.google.com/maps?q=${decodeURIComponent(placeMatch[1])}&z=15&output=embed`
    }
    return ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="text-2xl animate-pulse" style={{ color: PINK_DARK }}>{'\u2665'}</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" style={{ background: CREAM }}>
        <div>
          <div className="text-4xl mb-4">{'\u{1F614}'}</div>
          <h1 className="font-serif text-xl mb-2" style={{ color: PINK_DARK }}>Invitation not found</h1>
          <p className="text-sm" style={{ color: GOLD }}>This link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  const boyName = couple?.boy_name || 'Sandaruwan'
  const girlName = couple?.girl_name || 'Amalka'
  const venueName = couple?.venue_name || 'Galle Face Hotel'
  const venueAddress = couple?.venue_address || 'Colombo, Sri Lanka'
  const weddingDate = couple?.wedding_date || ''
  const weddingDateText = weddingDate ? formatDate(weddingDate) : 'Saturday, August 14, 2026'
  const boyFather = couple?.boy_father_name || 'Mr. Perera'
  const boyMother = couple?.boy_mother_name || 'Mrs. Perera'
  const girlFather = couple?.girl_father_name || 'Mr. Silva'
  const girlMother = couple?.girl_mother_name || 'Mrs. Silva'
  const mapUrl = couple?.map_url || ''
  const togetherPhoto = couple?.together_photo_url || ''
  const ceremonyTime = couple?.ceremony_time || ''
  const receptionTime = couple?.reception_time || ''
  const dinnerTime = couple?.dinner_time || ''
  const notes = couple?.additional_notes || ''
  const musicUrl = couple?.music_youtube_url || ''
  const guestName = guest?.name || 'Guest'

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
          {'\u2740'}
        </div>
      ))}
    </div>
  )

const MusicPlayer = () => {
    useEffect(() => {
      if (!musicStarted) return
      const audioEl = document.getElementById('wedding-music-player') as HTMLVideoElement | null
      if (audioEl) {
        audioEl.volume = 1
        audioEl.muted = false
        audioEl.play().catch(() => {
          // If the browser still blocks it, retry muted then unmute on next tick
          audioEl.muted = true
          audioEl.play().then(() => {
            setTimeout(() => { audioEl.muted = false }, 300)
          }).catch(() => {})
        })
      }
    }, [musicStarted])

    return (
      <video
        id="wedding-music-player"
        src="/assests/video/video1.mp4"
        style={{ position: 'fixed', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        loop
        playsInline
      />
    )
  }

  const RsvpSection = () => (
    <div className="mb-4 p-6 rounded-3xl shadow-xl" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
      <p className="text-sm mb-1" style={{ color: DARK }}>Dear {guestName},</p>

      {responded ? (
        <div
          className="rounded-2xl p-5 mt-3"
          style={{
            background: responseStatus === 'confirmed' ? 'rgba(76,175,80,0.1)' : 'rgba(220,80,80,0.1)',
            border: `1px solid ${responseStatus === 'confirmed' ? 'rgba(76,175,80,0.4)' : 'rgba(220,80,80,0.4)'}`,
          }}
        >
          {responseStatus === 'confirmed' ? (
            <>
              <p className="text-sm font-medium mb-1" style={{ color: '#3a8a3e' }}>{'\u2713'} You're confirmed!</p>
              <p className="text-xs" style={{ color: '#3a8a3e', opacity: 0.8 }}>We can't wait to celebrate with you, {guestName}!</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium mb-1" style={{ color: '#b94545' }}>Thanks for letting us know</p>
              <p className="text-xs" style={{ color: '#b94545', opacity: 0.8 }}>We'll miss you, {guestName}. Sending our love!</p>
            </>
          )}
        </div>
      ) : showCountPicker ? (
        <div className="mt-3">
          <p className="text-sm mb-3" style={{ color: DARK }}>How many will be attending?</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${PINK}`, color: PINK_DEEP }}
            >
              -
            </button>
            <span className="text-lg font-medium w-8" style={{ color: DARK }}>{guestCount}</span>
            <button
              type="button"
              onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${PINK}`, color: PINK_DEEP }}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleConfirmAccept}
            disabled={submitting}
            className="w-full py-3 font-medium rounded-full text-sm disabled:opacity-50 shadow-md"
            style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})`, color: '#fff' }}
          >
            {submitting ? 'Submitting...' : 'Confirm Attendance'}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm mb-1 mt-2" style={{ color: DARK }}>Your presence would mean so much to us.</p>
          <p className="text-xs mb-4 opacity-70" style={{ color: DARK }}>Kindly let us know if you will be joining our celebration.</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={handleAccept}
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})` }}
            >
              Joyfully Accept
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: PINK, color: PINK_DEEP, background: 'rgba(255,255,255,0.6)' }}
            >
              {submitting ? '...' : 'Regretfully Decline'}
            </button>
          </div>
        </>
      )}
    </div>
  )

  // ===================== SLIDE: COVER =====================
  if (slide === 'cover') {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #FCE4EC 60%, #F8D7E0 100%)` }}>
        <Petals />
        <div className="relative z-10 text-center px-6 animate-[fadeIn_1.2s_ease-out]">
          <div className="mb-6 rounded-2xl py-3 px-5 shadow-lg" style={{ background: '#fff' }}>
            <p className="text-sm font-serif" style={{ color: PINK_DEEP }}>Dear {guestName},</p>
            <p className="text-xs mt-1" style={{ color: GOLD }}>We are warmly invite you to share in the celebration of our wedding day.</p>
          </div>
          <div className="text-xl mb-5" style={{ color: PINK_DEEP }}>{'\u2740 \u2740 \u2740'}</div>
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>The Wedding Of</p>
          <h1 className="text-4xl mb-1 italic" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>{boyName}</h1>
          <p className="text-xl italic my-1" style={{ color: PINK, fontFamily: "'Playfair Display', serif" }}>&amp;</p>
          <h1 className="text-4xl mb-10 italic" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>{girlName}</h1>

          <button onClick={handlePlay} className="group relative w-20 h-20 mx-auto mb-4 flex items-center justify-center" aria-label="Play invitation">
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(224,114,138,0.4)' }}></span>
            <span className="relative w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-xl transition-transform group-active:scale-95" style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DEEP})`, color: '#fff' }}>
              {'\u25B6'}
            </span>
          </button>
          <p className="text-xs tracking-widest uppercase" style={{ color: PINK_DEEP }}>Tap to Open Our Invitation</p>
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    )
  }

  // ===================== SLIDE: SAVE THE DATE CALENDAR =====================
  if (slide === 'calendar') {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-6" style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #FCE4EC 60%, #F8D7E0 100%)` }}>
        <MusicPlayer />
        <Petals />
        <div className={`relative z-10 text-center max-w-sm w-full transition-all duration-1000 ${calendarRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: GOLD }}>Save the date</p>
          <h1 className="text-3xl italic mb-1" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif" }}>{boyName} &amp; {girlName}</h1>
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
                        {'\u2665'}
                      </span>
                    ) : (
                      <span style={{ color: DARK, opacity: 0.8 }}>{day}</span>
                    )
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <p className="italic text-sm mt-6" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif" }}>We look forward to celebrating this special day with you</p>
        </div>
      </div>
    )
  }

  // ===================== SLIDE: STORY =====================
  if (slide === 'story') {
    const storyBackgroundPhoto = togetherPhoto || '/assests/images/couple1.jpeg'

    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-6">
        <MusicPlayer />

        <div className="absolute inset-0 z-0">
          <img
            src={storyBackgroundPhoto}
            alt="Background"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.65)' }}
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className={`relative z-10 text-center max-w-sm w-full transition-all duration-1000 ${storyRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: '#ffd700' }}>OUR STORY</p>

          <div className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
            <p className="text-lg italic text-white leading-relaxed mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              "Unexpectedly met, deeply in love, and ready to begin our forever."
            </p>

            <div className="w-16 h-[1px] bg-white/50 mx-auto mb-6"></div>

            <h1 className="text-3xl font-light tracking-wide" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              {boyName} <span className="text-white/60">&</span> {girlName}
            </h1>
          </div>
        </div>
      </div>
    )
  }

  // ===================== SLIDE: DETAILS =====================
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
                <img src="/assests/images/couple1.jpeg" alt="Couple" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 animate-[fadeUp_0.8s_ease-out_0.1s_both]">
          <h1 className="text-5xl mb-2 leading-tight italic" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            {boyName} <span className="text-3xl italic" style={{ color: PINK }}>&</span> {girlName}
          </h1>
          <p className="text-sm mb-1" style={{ color: DARK, opacity: 0.8 }}>Together with their families,</p>
          <p className="text-sm" style={{ color: DARK, opacity: 0.8 }}>request the pleasure of your company</p>
          <p className="text-sm" style={{ color: DARK, opacity: 0.8 }}>as they celebrate their marriage.</p>
        </div>

        {/* Card: Parents */}
        <div className="grid grid-cols-1 gap-4 mb-6 p-6 rounded-3xl shadow-xl animate-[fadeUp_0.8s_ease-out_0.2s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>Beloved Son of</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{boyFather}</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>&</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{boyMother}</p>
          </div>
          <div className="text-lg italic" style={{ color: PINK }}>&</div>
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>Beloved Daughter of</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{girlFather}</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>&</p>
            <p className="text-sm italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{girlMother}</p>
          </div>
        </div>

        {/* Card: Countdown */}
        <div className="mb-6 p-6 rounded-3xl shadow-xl animate-[fadeUp_0.8s_ease-out_0.3s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>Until We Say "I Do"</p>
          <p className="text-[10px] mb-4 opacity-70" style={{ color: DARK }}>Countdown to Our Special Day</p>
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
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>Wedding Day</p>
            <p className="text-lg italic" style={{ color: DARK, fontFamily: "'Playfair Display', serif" }}>{weddingDateText}</p>
          </div>

          <div className="h-px" style={{ background: `${PINK}30` }}></div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Schedule</p>
            <div className="space-y-2">
              {ceremonyTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: PINK_DEEP }}>{'\u{1F48D}'} Poruwa Ceremony</span>
                  <span style={{ color: DARK }}>{formatTime(ceremonyTime)}</span>
                </div>
              )}
              {receptionTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: PINK_DEEP }}>{'\u{1F942}'} Reception</span>
                  <span style={{ color: DARK }}>{formatTime(receptionTime)}</span>
                </div>
              )}
              {/* {dinnerTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: PINK_DEEP }}>Dinner</span>
                  <span style={{ color: DARK }}>{formatTime(dinnerTime)}</span>
                </div>
              )} */}
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

        {notes && (
          <div className="rounded-3xl p-5 mb-6 shadow-lg animate-[fadeUp_0.8s_ease-out_0.5s_both]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: GOLD }}>Note</p>
            <p className="text-sm" style={{ color: DARK }}>{notes}</p>
          </div>
        )}

        <RsvpSection />

        <div className="mt-8">
          <p className="text-xs italic opacity-70" style={{ color: DARK }}>Thank you for being part of our journey.</p>
          <p className="text-sm italic mt-3" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif" }}>With Love,</p>
          <p className="text-lg italic" style={{ color: PINK_DEEP, fontFamily: "'Playfair Display', serif" }}>{boyName} &amp; {girlName}</p>
          <p className="text-xs mt-3" style={{ color: GOLD }}>{'\u2764'} Forever Begins Here {'\u2764'}</p>
        </div>

        <button onClick={handleReplay} className="mt-6 text-[10px] underline opacity-60" style={{ color: PINK_DEEP }}>
          Replay invitation
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}