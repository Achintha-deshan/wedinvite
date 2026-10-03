'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getInvitationByTokenAction, submitRsvpAction } from '../../actions/guests'

// ── Sage/Emerald/Gold palette (customer requirement) ──────────────────────────
const OL       = '#7A9E7E'   // sage green — mid tone
const OL_DARK  = '#2D6A4F'   // emerald green — deep
const OL_DEEP  = '#1B3A2D'   // forest dark — bg
const GOLD     = '#C8A96E'   // warm gold
const CREAM    = '#F5F8F2'   // green-tinted cream white
const DARK     = '#162820'   // near-black green

type Slide = 'cover' | 'story' | 'details'

export default function GuestInvitePage() {
  const params = useParams()
  const token  = params.token as string

  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [guest,       setGuest]       = useState<any>(null)
  const [couple,      setCouple]      = useState<any>(null)
  const [slide,       setSlide]       = useState<Slide>('cover')
  const [animDone,    setAnimDone]    = useState(false)   // silhouette animation finished
  const [playing,     setPlaying]     = useState(false)
  const [musicOn,     setMusicOn]     = useState(false)
  const [countdown,   setCountdown]   = useState({ days:0, hours:0, minutes:0, seconds:0 })
  const [submitting,  setSubmitting]  = useState(false)
  const [responded,   setResponded]   = useState(false)
  const [rsvpStatus,  setRsvpStatus]  = useState<'confirmed'|'declined'|null>(null)
  const [guestCount,  setGuestCount]  = useState(1)
  const [showPicker,  setShowPicker]  = useState(false)
  const [showDecline, setShowDecline] = useState(false)

  // story photo index for manual swipe/tap
  const [photoIdx, setPhotoIdx] = useState(0)
  const touchStartX = useRef<number>(0)

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    getInvitationByTokenAction(token).then(res => {
      if (res.success) {
        setGuest(res.guest)
        setCouple(res.couple)
        if (res.guest.rsvp_status === 'confirmed' || res.guest.rsvp_status === 'declined') {
          setResponded(true)
          setRsvpStatus(res.guest.rsvp_status)
        }
      } else { setNotFound(true) }
      setLoading(false)
    })
  }, [token])

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!couple?.wedding_date) return
    const target = new Date(couple.wedding_date).getTime()
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setCountdown({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [couple])

  // ── Music ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = document.getElementById('wedding-music') as HTMLVideoElement | null
    if (!el) return
    if (musicOn) {
      el.loop = false; el.currentTime = 2; el.muted = false
      el.play().catch(() => {
        el.muted = true
        el.play().then(() => setTimeout(() => { el.muted = false }, 300)).catch(() => {})
      })
    } else { el.pause(); el.currentTime = 0 }
  }, [musicOn])

  // ── Tap to play → run animation → show invitation ─────────────────────────
  const handlePlay = () => {
    setPlaying(true)
    setMusicOn(true)
    setAnimDone(true)
    // hearts burst for 1s, then auto-advance to story
    setTimeout(() => setSlide('story'), 1200)
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt12 = (t: string) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
  }
  const getMapEmbed = (url: string) => {
    if (!url) return ''
    if (url.includes('/maps/embed')) return url
    const coord = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coord) return `https://maps.google.com/maps?q=${coord[1]},${coord[2]}&z=15&output=embed`
    const place = url.match(/\/maps\/place\/([^/@]+)/)
    if (place) return `https://maps.google.com/maps?q=${decodeURIComponent(place[1])}&z=15&output=embed`
    return ''
  }

  // ── Derived data (no fake fallback names) ─────────────────────────────────
  const boyName       = couple?.boy_name       || ''
  const girlName      = couple?.girl_name      || ''
  const boyFather     = couple?.boy_father_name  || ''
  const boyMother     = couple?.boy_mother_name  || ''
  const girlFather    = couple?.girl_father_name || ''
  const girlMother    = couple?.girl_mother_name || ''
  const venueName     = couple?.venue_name     || ''
  const venueAddress  = couple?.venue_address  || ''
  const mapUrl        = couple?.map_url        || ''
  const togetherPhoto = couple?.together_photo_url || ''
  const storyPhoto    = couple?.story_photo_url    || togetherPhoto
  const boyPhoto      = couple?.boy_photo_url      || ''
  const girlPhoto     = couple?.girl_photo_url     || ''
  const ceremonyTime  = couple?.ceremony_time  || ''
  const receptionTime = couple?.reception_time || ''
  const notes         = couple?.additional_notes || ''
  const guestName     = guest?.name || ''

  // Story photos — up to 4 from Supabase, fallback to placeholder slots
  const storyPhotos = [togetherPhoto, storyPhoto, boyPhoto, girlPhoto].filter(Boolean)

  const wDate           = couple?.wedding_date ? new Date(couple.wedding_date) : null
  const weddingDateText = wDate
    ? wDate.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    : ''
  const weddingDay  = wDate?.getDate() || 0
  const monthName   = wDate?.toLocaleDateString('en-US', { month:'long', year:'numeric' }) || ''

  // Calendar grid
  const calCells: (number|null)[] = []
  if (wDate) {
    const y = wDate.getFullYear(), m = wDate.getMonth()
    const first = new Date(y, m, 1).getDay()
    const days  = new Date(y, m+1, 0).getDate()
    for (let i = 0; i < first; i++) calCells.push(null)
    for (let d = 1; d <= days; d++) calCells.push(d)
  }

  // ── Early returns ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: OL_DEEP }}>
      <div style={{ width:40, height:40, border:`3px solid ${GOLD}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: OL_DEEP, textAlign:'center', padding:24 }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>🍃</div>
        <h1 style={{ color: CREAM, fontFamily:"'Playfair Display', serif", fontSize:22, fontStyle:'italic', marginBottom:8 }}>Invitation not found</h1>
        <p style={{ color: GOLD, fontSize:13 }}>This link may be invalid or expired.</p>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  //  COVER SLIDE — Romantic sage/emerald/gold, leaf petals, elegant names
  // ══════════════════════════════════════════════════════════════════════════
  if (slide === 'cover') return (
    <>
      <video id="wedding-music" src="/assests/video/video1.mp4" playsInline
        style={{ position:'fixed', width:1, height:1, opacity:0, pointerEvents:'none' }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes petalFall {
          0%   { transform: translateY(-10px) rotate(0deg) translateX(0px); opacity: 0; }
          10%  { opacity: 0.8; }
          85%  { opacity: 0.5; }
          100% { transform: translateY(105vh) rotate(540deg) translateX(30px); opacity: 0; }
        }
        @keyframes petalSway {
          0%,100% { margin-left: 0px; }
          33%      { margin-left: 18px; }
          66%      { margin-left: -12px; }
        }
        @keyframes nameReveal {
          0%   { opacity: 0; letter-spacing: 0.4em; }
          100% { opacity: 1; letter-spacing: 0.08em; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(200,169,110,0.4); }
          50%      { box-shadow: 0 0 0 14px rgba(200,169,110,0); }
        }
        @keyframes heartPop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes heartFloat {
          0%   { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(-70px) scale(0.4); opacity: 0; }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes tapBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .petal-wrap { animation: petalSway 4s ease-in-out infinite; }

        .name-boy  { animation: nameReveal 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .name-amp  { animation: fadeSlideUp 0.8s ease-out 1.2s both; }
        .name-girl { animation: nameReveal 1.4s cubic-bezier(0.16,1,0.3,1) 1.5s both; }
        .caption   { animation: fadeSlideUp 0.9s ease-out 2.4s both; }
        .cta-btn   { animation: fadeSlideUp 0.9s ease-out 2.9s both; }
        .tap-hint  { animation: tapBounce 2s ease-in-out infinite; }

        .ring-icon { animation: ringGlow 2.5s ease-in-out infinite; }
        .shimmer-line { animation: shimmer 3s ease-in-out infinite; }
      `}</style>

      <div style={{
        minHeight: '100dvh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #f2f7f0 0%, #edf5ea 40%, #f5f8f2 70%, #f0f6ed 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: "'Cormorant Garamond', serif",
      }}>

        {/* ── Falling rose petals ── */}
        {[
          { left:'5%',  dur:'7s',  delay:'0s',   size:18, opacity:0.4, color:'#7A9E7E' },
          { left:'14%', dur:'9.5s',delay:'1.2s', size:14, opacity:0.35, color:'#9CAF88' },
          { left:'24%', dur:'6.8s',delay:'2.4s', size:20, opacity:0.38, color:'#5A8A5E' },
          { left:'34%', dur:'11s', delay:'0.6s', size:12, opacity:0.3,  color:'#C8A96E' },
          { left:'46%', dur:'8.2s',delay:'3s',   size:16, opacity:0.38, color:'#7A9E7E' },
          { left:'57%', dur:'7.5s',delay:'1.8s', size:22, opacity:0.35, color:'#9CAF88' },
          { left:'67%', dur:'10s', delay:'0.9s', size:13, opacity:0.42, color:'#5A8A5E' },
          { left:'76%', dur:'6.5s',delay:'2.8s', size:17, opacity:0.3,  color:'#C8A96E' },
          { left:'85%', dur:'9s',  delay:'1.5s', size:15, opacity:0.38, color:'#7A9E7E' },
          { left:'93%', dur:'7.8s',delay:'3.5s', size:11, opacity:0.35, color:'#9CAF88' },
          { left:'20%', dur:'12s', delay:'5s',   size:10, opacity:0.28, color:'#5A8A5E' },
          { left:'72%', dur:'8.8s',delay:'4.2s', size:19, opacity:0.38, color:'#C8A96E' },
        ].map((p, i) => (
          <div key={i} style={{
            position:'absolute', top:0, left:p.left, pointerEvents:'none', zIndex:1,
            animation: `petalFall ${p.dur} ease-in ${p.delay} infinite`,
          }}>
            <div className="petal-wrap">
              <svg width={p.size} height={p.size * 1.4} viewBox="0 0 24 34" fill={p.color} opacity={p.opacity}>
                {/* leaf shape */}
                <path d="M12 2 Q20 10 12 32 Q4 10 12 2Z"/>
                <path d="M12 2 Q12 18 12 32" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none"/>
              </svg>
            </div>
          </div>
        ))}

        {/* ── Top ornament ── */}
        <div style={{ position:'relative', zIndex:10, textAlign:'center', paddingTop:52, width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:48, height:1, background:'linear-gradient(to right,transparent,#C8A96E)', opacity:0.5 }} className="shimmer-line" />
            <span style={{ color:'#C8A96E', fontSize:11, letterSpacing:'0.4em', opacity:0.75 }}>✦</span>
            <div style={{ width:48, height:1, background:'linear-gradient(to left,transparent,#C8A96E)', opacity:0.5 }} className="shimmer-line" />
          </div>
          {guestName && (
            <p style={{ color:'#9B7A5A', fontSize:13, fontStyle:'italic', letterSpacing:'0.04em', marginBottom:2, opacity:0.9 }}>
              Dear {guestName},
            </p>
          )}
          <p style={{ color:'#C8A96E', fontSize:9, letterSpacing:'0.5em', textTransform:'uppercase', opacity:0.65 }}>
            You are warmly invited to the wedding of
          </p>
        </div>

        {/* ── Ring / heart emblem ── */}
        <div style={{ position:'relative', zIndex:10, margin:'22px 0 18px', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
          <div className="ring-icon" style={{
            width:72, height:72, borderRadius:'50%',
            border:'2px solid #C8A96E',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)',
          }}>
            {playing && animDone ? (
              <>
                <span style={{ fontSize:28, animation:'heartPop 0.5s ease-out both' }}>♥</span>
                {[
                  { top:'-22px', left:'50%', s:16, delay:'0.1s' },
                  { top:'-14px', left:'20%', s:11, delay:'0.25s' },
                  { top:'-14px', left:'80%', s:10, delay:'0.35s' },
                  { top:'-30px', left:'60%', s:13, delay:'0.15s' },
                  { top:'-28px', left:'35%', s:9,  delay:'0.4s' },
                ].map((h,i) => (
                  <span key={i} style={{
                    position:'absolute', top:h.top, left:h.left,
                    fontSize:h.s, color:'#E8536A',
                    animation:`heartFloat 1.2s ease-out ${h.delay} both`,
                    transform:'translateX(-50%)',
                    pointerEvents:'none',
                  }}>♥</span>
                ))}
              </>
            ) : (
              <span style={{ fontSize:26, color:'#C8A96E', opacity:0.85 }}>💍</span>
            )}
          </div>
        </div>

        {/* ── Names ── */}
        <div style={{ position:'relative', zIndex:10, textAlign:'center', width:'100%', padding:'0 32px' }}>
          {boyName && (
            <h1 className="name-boy" style={{
              fontFamily:"'Playfair Display', serif",
              fontSize: 'clamp(36px, 10vw, 52px)',
              fontWeight:400, fontStyle:'italic',
              color:'#2C2218', lineHeight:1.1,
            }}>{boyName}</h1>
          )}
          <p className="name-amp" style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:22, color:'#C8A96E', margin:'6px 0', fontStyle:'italic', opacity:0.9,
          }}>&amp;</p>
          {girlName && (
            <h1 className="name-girl" style={{
              fontFamily:"'Playfair Display', serif",
              fontSize: 'clamp(36px, 10vw, 52px)',
              fontWeight:400, fontStyle:'italic',
              color:'#2C2218', lineHeight:1.1,
            }}>{girlName}</h1>
          )}
          {/* blush underline */}
          <div style={{
            width:80, height:2, borderRadius:2,
            background:'linear-gradient(to right,#7A9E7E,#C8A96E,#7A9E7E)',
            margin:'14px auto 0', opacity:0.7,
          }} />
        </div>

        {/* ── Date ── */}
        {weddingDateText && (
          <div className="caption" style={{ position:'relative', zIndex:10, textAlign:'center', marginTop:16, padding:'0 32px' }}>
            <p style={{ color:'#9B7A5A', fontSize:13, letterSpacing:'0.12em', fontStyle:'italic', opacity:0.85 }}>
              {weddingDateText}
            </p>
            {venueName && (
              <p style={{ color:'#9B7A5A', fontSize:11, letterSpacing:'0.1em', marginTop:4, opacity:0.65 }}>
                {venueName}
              </p>
            )}
          </div>
        )}

        {/* ── CTA button ── */}
        <div className="cta-btn" style={{
          position:'relative', zIndex:10,
          width:'100%', maxWidth:320, padding:'0 28px',
          marginTop:24,
        }}>
          <button
            onClick={handlePlay}
            className="tap-hint"
            style={{
              display:'block', width:'100%', padding:'17px 0',
              background:'linear-gradient(135deg, #2D6A4F, #1B3A2D)',
              border:'1px solid rgba(200,169,110,0.45)',
              borderRadius:50, cursor:'pointer',
              fontFamily:"'Playfair Display', serif",
              color:'#F5F8F2', fontSize:15, fontStyle:'italic',
              letterSpacing:'0.12em',
              boxShadow:'0 8px 36px rgba(29,58,45,0.28)',
            }}
          >
            Open Our Invitation
          </button>
          <p style={{
            textAlign:'center', color:'#7A9E7E', fontSize:9,
            letterSpacing:'0.35em', textTransform:'uppercase',
            marginTop:10, opacity:0.7,
          }}>tap to reveal</p>
        </div>

        {/* ── Floating hearts after open ── */}
        {playing && animDone && (
          <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:20 }}>
            {Array.from({ length: 8 }).map((_,i) => (
              <span key={i} style={{
                position:'absolute',
                left: `${15 + i * 10}%`,
                top: '60%',
                fontSize: 10 + (i % 3) * 6,
                color: i % 2 ? '#2D6A4F' : '#C8A96E',
                animation: `heartFloat ${1 + i * 0.15}s ease-out ${i * 0.1}s both`,
              }}>♥</span>
            ))}
          </div>
        )}

        {/* bottom space */}
        <div style={{ height:32 }} />
      </div>
    </>
  )

  if (slide === 'story') return (
    <>
      <video id="wedding-music" src="/assests/video/video1.mp4" loop={false} playsInline
        style={{ position:'fixed', width:1, height:1, opacity:0, pointerEvents:'none' }} />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes storyHeroReveal {
          0%   { opacity: 0; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes kenBurns {
          0%   { transform: scale(1.0) translate(0px, 0px); }
          100% { transform: scale(1.07) translate(-8px, -5px); }
        }
        @keyframes storyFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes storySlideIn {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes storyPhotoReveal {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes goldLineDraw {
          from { width: 0; opacity: 0; }
          to   { width: 40px; opacity: 0.5; }
        }
        @keyframes musicPulse {
          0%,100% { transform: scaleY(0.4); }
          50%      { transform: scaleY(1); }
        }
        @keyframes captionSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .story-hero-img    { animation: storyHeroReveal 1.1s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .story-hero-ken    { animation: kenBurns 18s ease-in-out 1.3s both alternate infinite; }
        .story-name        { animation: storyFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.6s both; }
        .story-ampersand   { animation: storyFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.9s both; }
        .story-quote       { animation: storyFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 1.1s both; }
        .story-gold-line   { animation: goldLineDraw 0.8s ease-out 1.0s both; }
        .story-photo-0     { animation: storyPhotoReveal 0.85s cubic-bezier(0.16,1,0.3,1) 1.3s both; }
        .story-photo-1     { animation: storyPhotoReveal 0.85s cubic-bezier(0.16,1,0.3,1) 1.55s both; }
        .story-photo-2     { animation: storyPhotoReveal 0.85s cubic-bezier(0.16,1,0.3,1) 1.8s both; }
        .story-photo-3     { animation: storyPhotoReveal 0.85s cubic-bezier(0.16,1,0.3,1) 2.05s both; }
        .story-date-card   { animation: storyFadeUp 0.85s cubic-bezier(0.16,1,0.3,1) 2.15s both; }
        .story-cta         { animation: storyFadeUp 0.85s cubic-bezier(0.16,1,0.3,1) 2.4s both; }
        .music-bar         { display: inline-block; width: 3px; border-radius: 2px; background: ${GOLD}; margin: 0 1.5px; }
        .music-bar-1       { animation: musicPulse 0.6s ease-in-out 0.0s infinite; height: 10px; }
        .music-bar-2       { animation: musicPulse 0.6s ease-in-out 0.15s infinite; height: 14px; }
        .music-bar-3       { animation: musicPulse 0.6s ease-in-out 0.3s infinite; height: 10px; }
        .music-bar-4       { animation: musicPulse 0.6s ease-in-out 0.45s infinite; height: 8px; }

        /* Photo caption pill */
        .photo-caption-pill {
          position: absolute;
          bottom: 14px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 6px;
          background: rgba(22,40,32,0.72);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200,169,110,0.3);
          border-radius: 100px;
          padding: 5px 13px 5px 9px;
          white-space: nowrap;
          animation: captionSlide 0.5s ease-out 2.2s both;
        }
        .photo-caption-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${GOLD};
          flex-shrink: 0;
          opacity: 0.9;
        }
        .photo-caption-text {
          color: ${CREAM};
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          font-size: 11px;
          font-style: italic;
          letter-spacing: 0.06em;
          opacity: 0.92;
        }

        /* Section label chip */
        .section-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(42,90,63,0.55);
          border: 1px solid rgba(200,169,110,0.25);
          border-radius: 100px;
          padding: 4px 12px;
          backdrop-filter: blur(8px);
        }
        .section-label-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${GOLD}; opacity: 0.8;
        }
        .section-label-text {
          color: ${GOLD};
          font-size: 8px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          opacity: 0.85;
        }

        /* Wide story photo caption bar */
        .story-photo-caption-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 28px 18px 16px;
          background: linear-gradient(to top, ${OL_DEEP}ee 0%, transparent 100%);
          display: flex; align-items: flex-end; justify-content: space-between;
        }
      `}</style>

      <div style={{ minHeight:'100vh', background: OL_DEEP, position:'relative', overflowX:'hidden' }}>

        {/* sticky header */}
        <div style={{
          position:'sticky', top:0, zIndex:50,
          background:`${OL_DEEP}ee`, backdropFilter:'blur(16px)',
          borderBottom:`1px solid ${OL}33`,
          padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {musicOn && (
              <div style={{ display:'flex', alignItems:'flex-end', height:16, marginRight:2 }}>
                <div className="music-bar music-bar-1" />
                <div className="music-bar music-bar-2" />
                <div className="music-bar music-bar-3" />
                <div className="music-bar music-bar-4" />
              </div>
            )}
            <div>
              <p style={{ color: GOLD, fontSize:8, letterSpacing:'0.4em', textTransform:'uppercase', margin:0, opacity:0.7 }}>Our Story</p>
              {(boyName || girlName) && (
                <p style={{ color: CREAM, fontFamily:"'Playfair Display', serif", fontSize:15, fontStyle:'italic', margin:'2px 0 0', opacity:0.9 }}>
                  {boyName}{boyName && girlName ? ' & ' : ''}{girlName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSlide('details')}
            style={{
              padding:'8px 18px', borderRadius:50,
              background:`linear-gradient(135deg, ${OL}, ${OL_DARK})`,
              color: CREAM, border:`1px solid ${GOLD}44`,
              fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase',
              cursor:'pointer', fontWeight:600, flexShrink:0,
            }}
          >Details →</button>
        </div>

        {/* ══ HERO — couple photo, tall, name centered ══ */}
        <div style={{
          position:'relative', overflow:'hidden',
          height:'min(90vw, 520px)',
          width:'100%',
        }}>
          {togetherPhoto ? (
            <>
              <img
                src={togetherPhoto}
                alt="Together"
                className="story-hero-img story-hero-ken"
                style={{
                  width:'100%', height:'100%',
                  objectFit:'cover', objectPosition:'center 20%',
                  filter:'brightness(0.78) saturate(1.1)',
                  transformOrigin:'center center',
                  display:'block',
                }}
              />
              <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${OL_DEEP} 0%, transparent 50%)` }} />
              <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom, ${OL_DEEP}99 0%, transparent 28%)` }} />
            </>
          ) : (
            <div style={{
              width:'100%', height:'100%',
              background:`linear-gradient(160deg, ${OL_DARK}, ${OL_DEEP})`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontSize:80, opacity:0.2 }}>🌿</span>
            </div>
          )}

          {/* centered name overlay */}
          <div style={{
            position:'absolute', inset:0,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'flex-end',
            padding:'0 24px 32px',
          }}>
            {(boyName || girlName) && (
              <div className="story-name" style={{ textAlign:'center' }}>
                <h1 style={{
                  color: CREAM,
                  fontFamily:"'Playfair Display', serif",
                  fontSize:'clamp(30px, 8.5vw, 52px)',
                  fontWeight:400, fontStyle:'italic',
                  margin:0, lineHeight:1.2,
                  textShadow:`0 4px 24px rgba(0,0,0,0.65)`,
                }}>
                  {boyName}
                  {boyName && girlName && <span style={{ color: GOLD }}> &amp; </span>}
                  {girlName}
                </h1>
                <p style={{
                  color:`${GOLD}cc`, fontSize:9,
                  letterSpacing:'0.45em', textTransform:'uppercase',
                  margin:'10px 0 0', opacity:0.85,
                }}>Our Story</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ QUOTE ══ */}
        <div className="story-quote" style={{ padding:'30px 28px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div className="story-gold-line" style={{ height:'1px', background:GOLD, flex:1 }} />
            <span style={{ color: GOLD, fontSize:12, opacity:0.55 }}>✦</span>
            <div className="story-gold-line" style={{ height:'1px', background:GOLD, flex:1 }} />
          </div>
          <p style={{
            color:`${CREAM}bb`,
            fontSize:'clamp(14px, 4vw, 17px)',
            fontFamily:"'Cormorant Garamond', 'Playfair Display', serif",
            fontStyle:'italic', fontWeight:300,
            lineHeight:1.85, margin:0,
            textAlign:'center', letterSpacing:'0.02em',
          }}>
            "Unexpectedly met, deeply in love,<br />and ready to begin our forever."
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:18 }}>
            <div className="story-gold-line" style={{ height:'1px', background:GOLD, flex:1 }} />
            <span style={{ color: GOLD, fontSize:12, opacity:0.55 }}>✦</span>
            <div className="story-gold-line" style={{ height:'1px', background:GOLD, flex:1 }} />
          </div>
        </div>

        {/* ══ TOGETHER PHOTO (storyPhoto) — wide cinematic card ══ */}
        {storyPhoto && (
          <div style={{ padding:'0 16px 14px' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <div className="section-label">
                <div className="section-label-dot" />
                <span className="section-label-text">Together</span>
                <div className="section-label-dot" />
              </div>
            </div>
            <div
              className="story-photo-2"
              style={{
                borderRadius:22, overflow:'hidden',
                height:'min(65vw, 320px)',
                border:`1px solid rgba(200,169,110,0.2)`,
                boxShadow:`0 12px 36px rgba(0,0,0,0.5)`,
                position:'relative',
              }}
            >
              <img
                src={storyPhoto}
                alt="Together"
                style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 20%', display:'block' }}
              />
              <div className="story-photo-caption-bar">
                <div>
                  <p style={{
                    color:`${CREAM}88`, fontSize:8,
                    letterSpacing:'0.38em', textTransform:'uppercase', margin:'0 0 3px',
                  }}>A moment together</p>
                  {(boyName || girlName) && (
                    <p style={{
                      color: CREAM,
                      fontFamily:"'Cormorant Garamond', 'Playfair Display', serif",
                      fontSize:15, fontStyle:'italic', margin:0,
                      textShadow:'0 2px 8px rgba(0,0,0,0.5)',
                    }}>{boyName}{boyName && girlName ? ' & ' : ''}{girlName}</p>
                  )}
                </div>
                <div style={{
                  width:34, height:34, borderRadius:'50%',
                  background:`rgba(200,169,110,0.15)`,
                  border:`1px solid rgba(200,169,110,0.35)`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  <span style={{ fontSize:15 }}>🌿</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ BOY & GIRL portrait grid ══ */}
        {(boyPhoto || girlPhoto) && (
          <div style={{ padding:'0 16px 28px' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <div className="section-label">
                <div className="section-label-dot" />
                <span className="section-label-text">The Couple</span>
                <div className="section-label-dot" />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[boyPhoto, girlPhoto].map((src, i) => src ? (
                <div
                  key={i}
                  className={`story-photo-${i}`}
                  style={{
                    borderRadius:22, overflow:'hidden',
                    aspectRatio:'3/4',
                    border:`1px solid rgba(200,169,110,0.2)`,
                    boxShadow:`0 10px 32px rgba(0,0,0,0.45)`,
                    position:'relative',
                  }}
                >
                  <img
                    src={src}
                    alt={i === 0 ? boyName : girlName}
                    style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 10%', display:'block' }}
                  />
                  <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${OL_DEEP}dd 0%, transparent 55%)` }} />
                  {/* role tag top-left */}
                  <div style={{
                    position:'absolute', top:11, left:11,
                    background:'rgba(22,40,32,0.68)', backdropFilter:'blur(10px)',
                    border:`1px solid rgba(200,169,110,0.22)`, borderRadius:100,
                    padding:'3px 10px',
                  }}>
                    <span style={{ color: GOLD, fontSize:8, letterSpacing:'0.3em', textTransform:'uppercase', opacity:0.9 }}>
                      {i === 0 ? 'Groom' : 'Bride'}
                    </span>
                  </div>
                  {/* name pill bottom-center */}
                  <div className="photo-caption-pill">
                    <div className="photo-caption-dot" />
                    <span className="photo-caption-text">{i === 0 ? (boyName || 'Groom') : (girlName || 'Bride')}</span>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ aspectRatio:'3/4', borderRadius:22, background:`${OL}12`, border:`1px dashed ${OL}30` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── DATE CARD ── */}
        {weddingDateText && (
          <div className="story-date-card" style={{ padding:'0 16px 20px' }}>
            <div style={{
              background:`linear-gradient(135deg, ${OL_DARK}bb, ${OL_DEEP}ee)`,
              backdropFilter:'blur(20px)',
              borderRadius:24, padding:'0',
              border:`1px solid rgba(200,169,110,0.22)`,
              boxShadow:`0 14px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(200,169,110,0.12)`,
              overflow:'hidden',
            }}>
              {/* top accent bar */}
              <div style={{
                height:3,
                background:`linear-gradient(90deg, transparent, ${GOLD}88, transparent)`,
              }} />
              <div style={{ padding:'22px 22px 24px', textAlign:'center' }}>
                {/* section label */}
                <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
                  <div className="section-label">
                    <div className="section-label-dot" />
                    <span className="section-label-text">Save the Date</span>
                    <div className="section-label-dot" />
                  </div>
                </div>
                <p style={{
                  color: CREAM,
                  fontFamily:"'Playfair Display', serif",
                  fontSize:'clamp(17px, 4.5vw, 21px)',
                  fontStyle:'italic', margin:0, lineHeight:1.5,
                }}>
                  {weddingDateText}
                </p>
                {venueName && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:12 }}>
                    <span style={{ color:GOLD, fontSize:11, opacity:0.7 }}>📍</span>
                    <span style={{ color:`${GOLD}cc`, fontSize:11, letterSpacing:'0.06em' }}>{venueName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="story-cta" style={{ padding:'0 16px 44px' }}>
          <button
            onClick={() => setSlide('details')}
            style={{
              width:'100%', padding:'16px',
              borderRadius:100,
              background:`linear-gradient(135deg, ${OL_DARK}, ${OL})`,
              color: CREAM,
              border:`1px solid rgba(200,169,110,0.35)`,
              fontSize:10, letterSpacing:'0.35em', textTransform:'uppercase',
              fontWeight:700, cursor:'pointer',
              boxShadow:`0 8px 28px rgba(45,106,79,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            }}
          >
            <span>View Wedding Details</span>
            <span style={{ opacity:0.7, fontSize:13 }}>→</span>
          </button>
        </div>

      </div>
    </>
  )

  // ══════════════════════════════════════════════════════════════════════════
  //  DETAILS SLIDE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <video id="wedding-music" src="/assests/video/video1.mp4" loop={false} playsInline
        style={{ position:'fixed', width:1, height:1, opacity:0, pointerEvents:'none' }} />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />

      {/* fixed bg */}
      <div style={{ position:'fixed', inset:0, zIndex:0 }}>
        {togetherPhoto
          ? <img src={togetherPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.25) saturate(0.6)' }} />
          : <div style={{ width:'100%', height:'100%', background:`linear-gradient(170deg, ${OL_DEEP}, #0e130a)` }} />
        }
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom, ${OL_DEEP}bb, ${OL_DEEP}f5)` }} />
      </div>

      {/* sticky nav */}
      <div style={{
        position:'sticky', top:0, zIndex:50,
        background:`${OL_DEEP}ee`, backdropFilter:'blur(16px)',
        borderBottom:`1px solid ${OL}44`,
        padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <button onClick={() => setSlide('story')} style={{ background:'none', border:'none', color:`${CREAM}88`, fontSize:11, cursor:'pointer', letterSpacing:'0.1em' }}>
          ← Our Story
        </button>
        {(boyName || girlName) && (
          <p style={{ color: CREAM, fontFamily:"'Playfair Display', serif", fontSize:14, fontStyle:'italic', margin:0, opacity:0.85 }}>
            {boyName}{boyName && girlName ? ' & ' : ''}{girlName}
          </p>
        )}
        <div style={{ width:60 }} />
      </div>

      <div style={{ position:'relative', zIndex:10, maxWidth:440, margin:'0 auto', padding:'32px 20px 60px' }}>

        {/* couple photo circle */}
        {togetherPhoto && (
          <div style={{ textAlign:'center', marginBottom:28, animation:'fadeUp 0.7s ease-out both' }}>
            <div style={{
              width:120, height:120, borderRadius:'50%', overflow:'hidden',
              margin:'0 auto', padding:3,
              background:`linear-gradient(135deg, ${GOLD}, ${OL})`,
              boxShadow:`0 8px 32px rgba(0,0,0,0.4)`,
            }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden', border:`3px solid ${OL_DEEP}` }}>
                <img src={togetherPhoto} alt="Couple" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
            </div>
          </div>
        )}

        {/* names block */}
        <div style={{ textAlign:'center', marginBottom:28, animation:'fadeUp 0.7s ease-out 0.1s both' }}>
          {boyName && <h1 style={{ color: CREAM, fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:400, fontStyle:'italic', margin:0, lineHeight:1.1 }}>{boyName}</h1>}
          <p style={{ color: GOLD, fontSize:20, fontStyle:'italic', margin:'6px 0', fontFamily:"'Playfair Display', serif" }}>&amp;</p>
          {girlName && <h1 style={{ color: CREAM, fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:400, fontStyle:'italic', margin:'0 0 12px', lineHeight:1.1 }}>{girlName}</h1>}
          <p style={{ color:`${CREAM}66`, fontSize:12, lineHeight:1.6 }}>
            Together with their families,<br />request the pleasure of your company.
          </p>
        </div>

        {/* parents */}
        {(boyFather || boyMother || girlFather || girlMother) && (
          <Card delay="0.2s">
            {(boyFather || boyMother) && (
              <div style={{ marginBottom: girlFather || girlMother ? 14 : 0 }}>
                <Label>Beloved Son of</Label>
                {boyFather && <Detail>{boyFather}</Detail>}
                {boyFather && boyMother && <div style={{ color: GOLD, fontSize:11, margin:'2px 0' }}>&amp;</div>}
                {boyMother && <Detail>{boyMother}</Detail>}
              </div>
            )}
            {(boyFather || boyMother) && (girlFather || girlMother) && <Divider />}
            {(girlFather || girlMother) && (
              <div>
                <Label>Beloved Daughter of</Label>
                {girlFather && <Detail>{girlFather}</Detail>}
                {girlFather && girlMother && <div style={{ color: GOLD, fontSize:11, margin:'2px 0' }}>&amp;</div>}
                {girlMother && <Detail>{girlMother}</Detail>}
              </div>
            )}
          </Card>
        )}

        {/* countdown */}
        <Card delay="0.3s">
          <Label>Until We Say "I Do"</Label>
          <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:14 }}>
            {[
              { label:'Days',  value: countdown.days },
              { label:'Hrs',   value: countdown.hours },
              { label:'Min',   value: countdown.minutes },
              { label:'Sec',   value: countdown.seconds },
            ].map(item => (
              <div key={item.label} style={{
                background:`linear-gradient(160deg, ${OL}, ${OL_DARK})`,
                borderRadius:16, width:66, paddingTop:14, paddingBottom:14,
                textAlign:'center', border:`1px solid ${GOLD}33`,
                boxShadow:`0 4px 16px rgba(0,0,0,0.3)`,
              }}>
                <span style={{ display:'block', fontSize:24, fontWeight:700, color: CREAM, fontFamily:"'Playfair Display', serif" }}>{item.value}</span>
                <span style={{ display:'block', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color: GOLD, opacity:0.85 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* calendar + date */}
        {wDate && (
          <Card delay="0.35s">
            <Label>Save the Date</Label>
            {weddingDateText && <Detail style={{ fontSize:15, marginBottom:16 }}>{weddingDateText}</Detail>}
            {/* mini calendar */}
            <div style={{ background:`${OL_DEEP}88`, borderRadius:14, padding:'16px', border:`1px solid ${OL}44` }}>
              <p style={{ color: GOLD, fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:10, textAlign:'center', opacity:0.8 }}>{monthName}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:6 }}>
                {['S','M','T','W','T','F','S'].map((d,i) => (
                  <div key={i} style={{ color: GOLD, fontSize:9, fontWeight:600, textAlign:'center', opacity:0.7 }}>{d}</div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
                {calCells.map((day,i) => (
                  <div key={i} style={{ aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {day === weddingDay ? (
                      <span style={{
                        width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
                        background:`linear-gradient(135deg, ${OL}, ${OL_DARK})`,
                        color: GOLD, fontSize:10, fontWeight:700, borderRadius:'50%',
                        border:`1px solid ${GOLD}55`,
                      }}>♥</span>
                    ) : day ? (
                      <span style={{ color:`${CREAM}60`, fontSize:10 }}>{day}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* schedule */}
        {(ceremonyTime || receptionTime) && (
          <Card delay="0.4s">
            <Label>Schedule</Label>
            {ceremonyTime && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ color:`${CREAM}99`, fontSize:13, fontStyle:'italic', fontFamily:"'Playfair Display', serif" }}>💍 Poruwa Ceremony</span>
                <span style={{ color: CREAM, fontSize:13, fontWeight:600 }}>{fmt12(ceremonyTime)}</span>
              </div>
            )}
            {ceremonyTime && receptionTime && <Divider />}
            {receptionTime && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:`${CREAM}99`, fontSize:13, fontStyle:'italic', fontFamily:"'Playfair Display', serif" }}>🥂 Reception</span>
                <span style={{ color: CREAM, fontSize:13, fontWeight:600 }}>{fmt12(receptionTime)}</span>
              </div>
            )}
          </Card>
        )}

        {/* venue */}
        {(venueName || venueAddress) && (
          <div style={{
            borderRadius:20, overflow:'hidden', marginBottom:14,
            border:`1px solid ${OL}55`,
            animation:'fadeUp 0.7s ease-out 0.45s both',
          }}>
            {mapUrl && getMapEmbed(mapUrl) && (
              <div style={{ width:'100%', height:160 }}>
                <iframe src={getMapEmbed(mapUrl)} width="100%" height="100%" style={{ border:0 }} loading="lazy" title="Venue" />
              </div>
            )}
            <div style={{ background:`rgba(44,51,24,0.92)`, backdropFilter:'blur(12px)', padding:'20px 22px' }}>
              <Label>Venue</Label>
              {venueName    && <Detail style={{ fontSize:15, margin:'6px 0 4px' }}>{venueName}</Detail>}
              {venueAddress && <p style={{ color:`${CREAM}70`, fontSize:12, margin:'0 0 14px' }}>{venueAddress}</p>}
              {mapUrl && (
                <button
                  onClick={() => window.open(mapUrl, '_blank')}
                  style={{
                    background:`linear-gradient(135deg, ${OL}, ${OL_DARK})`,
                    color: CREAM, border:`1px solid ${GOLD}44`, borderRadius:50,
                    padding:'8px 20px', fontSize:11, cursor:'pointer', letterSpacing:'0.1em',
                  }}
                >📍 Open in Google Maps</button>
              )}
            </div>
          </div>
        )}

        {/* notes */}
        {notes && (
          <Card delay="0.5s">
            <Label>Note</Label>
            <p style={{ color:`${CREAM}bb`, fontSize:13, lineHeight:1.65, margin:'8px 0 0' }}>{notes}</p>
          </Card>
        )}

        {/* ── RSVP ───────────────────────────────────────────────────────────── */}
        <div style={{ animation:'fadeUp 0.7s ease-out 0.55s both' }}>
          <div style={{
            background:'rgba(44,51,24,0.85)', backdropFilter:'blur(16px)',
            borderRadius:24, padding:'24px',
            border:`1px solid ${GOLD}33`,
            boxShadow:`0 8px 32px rgba(0,0,0,0.3)`,
          }}>
            {guestName && (
              <p style={{ color:`${CREAM}cc`, fontSize:13, marginBottom:12, fontStyle:'italic', fontFamily:"'Playfair Display', serif" }}>
                Dear <strong style={{ color: CREAM }}>{guestName}</strong>,
              </p>
            )}
            {responded ? (
              <div style={{
                borderRadius:16, padding:'16px',
                background: rsvpStatus === 'confirmed' ? 'rgba(76,175,80,0.12)' : 'rgba(220,80,80,0.12)',
                border:`1px solid ${rsvpStatus === 'confirmed' ? 'rgba(76,175,80,0.3)' : 'rgba(220,80,80,0.3)'}`,
              }}>
                {rsvpStatus === 'confirmed' ? (
                  <>
                    <p style={{ color:'#7ec97f', fontSize:14, fontWeight:600, margin:'0 0 4px' }}>✓ You're confirmed!</p>
                    <p style={{ color:'#7ec97f', fontSize:12, opacity:0.8, margin:0 }}>We can't wait to celebrate with you{guestName ? `, ${guestName}` : ''}!</p>
                  </>
                ) : (
                  <>
                    <p style={{ color:'#e07070', fontSize:14, fontWeight:600, margin:'0 0 4px' }}>Thanks for letting us know</p>
                    <p style={{ color:'#e07070', fontSize:12, opacity:0.8, margin:0 }}>We'll miss you{guestName ? `, ${guestName}` : ''}. Sending our love! 💚</p>
                  </>
                )}
              </div>
            ) : showPicker ? (
              <div>
                {/* guest count picker — prominent */}
                <p style={{ color: GOLD, fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', textAlign:'center', marginBottom:6, opacity:0.9 }}>
                  How many guests will attend?
                </p>
                <p style={{ color:`${CREAM}77`, fontSize:11, textAlign:'center', marginBottom:18, fontStyle:'italic' }}>
                  Including yourself
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:6 }}>
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount-1))}
                    style={{
                      width:46, height:46, borderRadius:'50%',
                      border:`1.5px solid ${GOLD}66`, color: GOLD, fontSize:24,
                      background:'rgba(255,255,255,0.06)', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}
                  >−</button>
                  <div style={{ minWidth:80, textAlign:'center' }}>
                    <span style={{ fontSize:42, fontWeight:400, color: CREAM, fontFamily:"'Playfair Display', serif", lineHeight:1 }}>{guestCount}</span>
                  </div>
                  <button
                    onClick={() => setGuestCount(Math.min(10, guestCount+1))}
                    style={{
                      width:46, height:46, borderRadius:'50%',
                      border:`1.5px solid ${GOLD}66`, color: GOLD, fontSize:24,
                      background:'rgba(255,255,255,0.06)', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}
                  >+</button>
                </div>
                <p style={{ color:`${CREAM}55`, fontSize:10, textAlign:'center', marginBottom:20, letterSpacing:'0.1em' }}>
                  {guestCount === 1 ? 'Just me' : `${guestCount} guests`}
                </p>
                <button
                  onClick={async () => {
                    setSubmitting(true)
                    const res = await submitRsvpAction(token, 'confirmed', guestCount)
                    setSubmitting(false)
                    if (res.success) { setResponded(true); setRsvpStatus('confirmed'); setShowPicker(false) }
                  }}
                  disabled={submitting}
                  style={{
                    width:'100%', padding:'15px', borderRadius:50,
                    border:`1px solid ${GOLD}44`,
                    background:`linear-gradient(135deg, #2D6A4F, #1B3A2D)`,
                    color: CREAM, fontSize:13, fontWeight:600, cursor:'pointer',
                    letterSpacing:'0.12em',
                    opacity: submitting ? 0.6 : 1,
                    boxShadow:`0 6px 24px rgba(29,58,45,0.4)`,
                  }}
                >{submitting ? 'Submitting...' : 'Confirm Attendance ✓'}</button>
                <button
                  onClick={() => setShowPicker(false)}
                  style={{ width:'100%', padding:'10px', background:'transparent', border:'none', color:`${CREAM}44`, fontSize:11, cursor:'pointer', marginTop:8, letterSpacing:'0.1em' }}
                >← Back</button>
              </div>
            ) : (
              <>
                <p style={{ color:`${CREAM}88`, fontSize:13, marginBottom:4 }}>Your presence would mean the world to us.</p>
                <p style={{ color:`${CREAM}55`, fontSize:11, marginBottom:18 }}>Kindly let us know if you will be joining our celebration.</p>
                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                  <button
                    onClick={() => setShowPicker(true)}
                    style={{
                      padding:'13px 28px', borderRadius:50, border:`1px solid ${GOLD}55`,
                      background:`linear-gradient(135deg, #2D6A4F, #1B3A2D)`,
                      color: CREAM, fontSize:12, fontWeight:600, cursor:'pointer',
                      boxShadow:`0 4px 18px rgba(29,58,45,0.35)`, letterSpacing:'0.05em',
                    }}
                  >🎉 Joyfully Accept</button>
                  <button
                    onClick={() => setShowDecline(true)}
                    style={{
                      padding:'13px 28px', borderRadius:50,
                      border:`1px solid ${OL}88`, background:'rgba(255,255,255,0.05)',
                      color:`${CREAM}99`, fontSize:12, cursor:'pointer',
                    }}
                  >Regretfully Decline</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{ textAlign:'center', marginTop:36 }}>
          <div style={{ width:80, height:1, background:`linear-gradient(to right, transparent, ${GOLD}55, transparent)`, margin:'0 auto 16px' }} />
          <p style={{ color:`${CREAM}55`, fontSize:11, fontStyle:'italic' }}>Thank you for being part of our journey.</p>
          <p style={{ color: GOLD, fontSize:13, fontFamily:"'Playfair Display', serif", fontStyle:'italic', margin:'6px 0' }}>With love,</p>
          {(boyName || girlName) && (
            <p style={{ color: CREAM, fontSize:17, fontFamily:"'Playfair Display', serif", fontStyle:'italic', margin:0 }}>
              {boyName}{boyName && girlName ? ' & ' : ''}{girlName}
            </p>
          )}
          <p style={{ color:`${OL}cc`, fontSize:18, marginTop:10 }}>🌿</p>
        </div>

        <button onClick={() => setSlide('cover')} style={{ display:'block', margin:'24px auto 0', background:'none', border:'none', color:`${CREAM}33`, fontSize:10, textDecoration:'underline', cursor:'pointer' }}>
          Replay invitation
        </button>
      </div>

      {/* decline modal */}
      {showDecline && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(20,26,10,0.75)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24,
        }}>
          <div style={{
            background: OL_DARK, borderRadius:28, padding:'32px 28px',
            maxWidth:340, width:'100%', textAlign:'center',
            border:`1px solid ${GOLD}44`,
            boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🌿</div>
            <h2 style={{ color: CREAM, fontFamily:"'Playfair Display', serif", fontSize:20, fontStyle:'italic', marginBottom:8 }}>
              We'd love to have you
            </h2>
            <p style={{ color:`${CREAM}77`, fontSize:13, marginBottom:24 }}>
              Are you sure? We will truly miss you on our special day.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => setShowDecline(false)}
                style={{ flex:1, padding:'13px', borderRadius:50, border:`1px solid ${OL}88`, color:`${CREAM}99`, background:'transparent', fontSize:13, cursor:'pointer' }}
              >Go Back</button>
              <button
                onClick={async () => {
                  setShowDecline(false); setSubmitting(true)
                  const res = await submitRsvpAction(token, 'declined', 0)
                  setSubmitting(false)
                  if (res.success) { setResponded(true); setRsvpStatus('declined') }
                }}
                style={{ flex:1, padding:'13px', borderRadius:50, border:`1px solid ${GOLD}44`,
                  background:`linear-gradient(135deg, ${OL}, ${OL_DARK})`,
                  color: CREAM, fontSize:13, cursor:'pointer' }}
              >Yes, Decline</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  )
}

// ── Small reusable layout helpers (defined outside component so no re-render) ──
const OL_C  = '#5C6B2E'
const GOLD_C = '#C8A96E'
const CREAM_C = '#F5F0E6'
const OL_DARK_C = '#3A4520'
const OL_DEEP_C = '#2C3318'

function Card({ children, delay = '0s' }: { children: React.ReactNode, delay?: string }) {
  return (
    <div style={{
      background:'rgba(44,51,24,0.85)', backdropFilter:'blur(16px)',
      borderRadius:20, padding:'20px 22px', marginBottom:14,
      border:`1px solid ${OL_C}55`,
      boxShadow:'0 6px 24px rgba(0,0,0,0.25)',
      animation:`fadeUp 0.7s ease-out ${delay} both`,
    }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: GOLD_C, fontSize:9, letterSpacing:'0.35em', textTransform:'uppercase', margin:'0 0 4px', opacity:0.8 }}>
      {children}
    </p>
  )
}

function Detail({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <p style={{ color: CREAM_C, fontSize:14, fontStyle:'italic', fontFamily:"'Playfair Display', serif", margin:'2px 0', ...style }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div style={{ height:1, background:`${OL_C}44`, margin:'14px 0' }} />
}