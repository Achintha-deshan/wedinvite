'use client'

import { useState, useEffect } from 'react'
import { getProfileAction } from '../../../actions/auth'

// ── Royal Garden Theme ─────────────────────────────────────────────────────────
const BURG       = '#6B1E3A'   // deep burgundy
const BURG_DARK  = '#3D0F20'   // darker burgundy
const ROSE       = '#C2527A'   // rose pink
const GOLD       = '#D4AF6A'   // warm gold
const CREAM      = '#FDF6EE'   // warm cream
const PARCH      = '#F5E6D0'   // parchment
const DARK       = '#2A1215'   // near-black

function formatTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

// ── Falling petals cover ───────────────────────────────────────────────────────
function CoverSlide({ couple, onTap }: { couple: any; onTap: () => void }) {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const petals = Array.from({ length: 18 }, (_, i) => ({
    left: `${5 + (i * 5.5) % 90}%`,
    delay: `${(i * 0.35) % 4}s`,
    duration: `${3.5 + (i * 0.4) % 3}s`,
    size: 10 + (i * 3) % 14,
    rotate: (i * 47) % 360,
  }))

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${BURG_DARK} 0%, ${BURG} 55%, #8B2A4A 100%)` }}
      onClick={onTap}
    >
      <style>{`
        @keyframes petalFall {
          0%   { transform: translateY(-40px) rotate(var(--r)) scale(0.8); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(calc(var(--r) + 180deg)) scale(1.1); opacity: 0; }
        }
        @keyframes petalSway {
          0%,100% { margin-left: 0; }
          50%      { margin-left: 18px; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        @keyframes ringPulse {
          0%,100% { transform: scale(1); opacity: 0.4; }
          50%      { transform: scale(1.08); opacity: 0.8; }
        }
        @keyframes btnGlow {
          0%,100% { box-shadow: 0 0 18px ${GOLD}66; }
          50%      { box-shadow: 0 0 36px ${GOLD}aa, 0 0 60px ${GOLD}44; }
        }
      `}</style>

      {/* falling petals */}
      {petals.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 0,
          left: p.left,
          width: p.size,
          height: p.size * 0.8,
          borderRadius: '50% 10% 50% 10%',
          background: `linear-gradient(135deg, ${ROSE}cc, ${GOLD}88)`,
          animation: `petalFall ${p.duration} ${p.delay} infinite linear, petalSway 2.5s ${p.delay} infinite ease-in-out`,
          '--r': `${p.rotate}deg`,
          pointerEvents: 'none',
          zIndex: 1,
        } as any} />
      ))}

      {/* outer glow ring */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: 220, height: 220,
        borderRadius: '50%',
        border: `1px solid ${GOLD}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'ringPulse 3s ease-in-out infinite',
        marginBottom: 32,
      }}>
        {/* inner ring */}
        <div style={{
          width: 190, height: 190, borderRadius: '50%',
          border: `2px solid ${GOLD}88`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* photo or monogram */}
          <div style={{
            width: 160, height: 160, borderRadius: '50%', overflow: 'hidden',
            border: `3px solid ${GOLD}`,
            boxShadow: `0 0 24px ${BURG_DARK}88`,
          }}>
            {couple?.together_photo_url ? (
              <img src={couple.together_photo_url} alt="couple" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg, ${BURG}, ${ROSE})`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 28, color: GOLD, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {(couple?.boy_name?.[0] || 'K')}{(couple?.girl_name?.[0] || 'S')}
                </span>
                <span style={{ fontSize: 18, color: GOLD, marginTop: -4 }}>💍</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* names */}
      <div style={{ textAlign: 'center', zIndex: 2, animation: 'fadeUp 1s ease-out 0.3s both' }}>
        <p style={{ color: GOLD, fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 10, opacity: 0.85 }}>
          Together with their families
        </p>
        <h1 style={{
          color: CREAM,
          fontFamily: "'Playfair Display', serif",
          fontSize: 38, fontWeight: 700,
          lineHeight: 1.15, margin: 0,
        }}>
          {couple?.boy_name || 'Kavindu'}
        </h1>
        <p style={{ color: GOLD, fontSize: 26, fontStyle: 'italic', margin: '6px 0', fontFamily: "'Playfair Display', serif" }}>
          &amp;
        </p>
        <h1 style={{
          color: CREAM,
          fontFamily: "'Playfair Display', serif",
          fontSize: 38, fontWeight: 700,
          lineHeight: 1.15, margin: 0,
        }}>
          {couple?.girl_name || 'Sanduni'}
        </h1>

        {/* gold divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '18px 0 10px' }}>
          <div style={{ width: 48, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
          <span style={{ color: GOLD, fontSize: 14 }}>✦</span>
          <div style={{ width: 48, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
        </div>

        <p style={{ color: GOLD, fontSize: 11, letterSpacing: '0.2em', opacity: 0.85, animation: 'shimmer 2.5s ease-in-out infinite' }}>
          Are Getting Married
        </p>
      </div>

      {/* tap button */}
      {showButton && (
        <div style={{ marginTop: 36, zIndex: 2, animation: 'fadeUp 0.8s ease-out both' }}>
          <button style={{
            background: `linear-gradient(135deg, ${GOLD}, #B8924A)`,
            color: BURG_DARK,
            border: 'none', borderRadius: 50,
            padding: '14px 44px',
            fontSize: 13, fontWeight: 700,
            letterSpacing: '0.15em',
            fontFamily: "'Playfair Display', serif",
            cursor: 'pointer',
            animation: 'btnGlow 2.5s ease-in-out infinite',
          }}>
            ✨ Open Invitation
          </button>
          <p style={{ color: CREAM, opacity: 0.4, fontSize: 10, marginTop: 10, textAlign: 'center' }}>
            Tap anywhere to begin
          </p>
        </div>
      )}
    </div>
  )
}

// ── Calendar slide ─────────────────────────────────────────────────────────────
function CalendarSlide({ couple, onNext }: { couple: any; onNext: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const wDate = new Date(couple?.wedding_date || '2026-02-14')
  const day = wDate.getDate()
  const month = wDate.toLocaleString('en', { month: 'long' })
  const year = wDate.getFullYear()
  const weekday = wDate.toLocaleString('en', { weekday: 'long' })
  const weddingDateText = couple?.wedding_date
    ? wDate.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Saturday, 14th February 2026'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: `linear-gradient(160deg, ${BURG_DARK} 0%, ${BURG} 60%, #8B2A4A 100%)` }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />

      <p style={{ color: GOLD, fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 28, opacity: 0.8 }}>
        ✦ &nbsp; Save the Date &nbsp; ✦
      </p>

      {/* ornate calendar card */}
      <div style={{
        width: '100%', maxWidth: 320,
        transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(36px)',
      }}>
        {/* corner decorations */}
        <div style={{ position: 'relative' }}>
          {/* top-left */}
          <div style={{ position: 'absolute', top: -8, left: -8, width: 32, height: 32, borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}`, borderRadius: '6px 0 0 0', zIndex: 1 }} />
          {/* top-right */}
          <div style={{ position: 'absolute', top: -8, right: -8, width: 32, height: 32, borderTop: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}`, borderRadius: '0 6px 0 0', zIndex: 1 }} />
          {/* bottom-left */}
          <div style={{ position: 'absolute', bottom: -8, left: -8, width: 32, height: 32, borderBottom: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}`, borderRadius: '0 0 0 6px', zIndex: 1 }} />
          {/* bottom-right */}
          <div style={{ position: 'absolute', bottom: -8, right: -8, width: 32, height: 32, borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}`, borderRadius: '0 0 6px 0', zIndex: 1 }} />

          <div style={{
            background: CREAM,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: `0 24px 64px ${BURG_DARK}99`,
            border: `1px solid ${GOLD}55`,
          }}>
            {/* month header */}
            <div style={{
              background: `linear-gradient(135deg, ${BURG_DARK}, ${BURG})`,
              padding: '14px 24px',
              textAlign: 'center',
              borderBottom: `2px solid ${GOLD}`,
            }}>
              <p style={{ color: GOLD, fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>
                {month} · {year}
              </p>
            </div>

            {/* big day number */}
            <div style={{ textAlign: 'center', padding: '24px 24px 16px', borderBottom: `1px solid ${GOLD}33` }}>
              <p style={{ color: BURG, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 4px' }}>{weekday}</p>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 96, fontWeight: 700,
                color: BURG_DARK, lineHeight: 1, margin: 0,
              }}>{day}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <div style={{ width: 32, height: 1, background: GOLD }} />
                <span style={{ color: GOLD, fontSize: 12 }}>💍</span>
                <div style={{ width: 32, height: 1, background: GOLD }} />
              </div>
            </div>

            {/* schedule */}
            <div style={{ padding: '16px 24px 20px' }}>
              {couple?.ceremony_time && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ color: BURG, fontSize: 12, fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>💍 Poruwa Ceremony</span>
                  <span style={{ color: DARK, fontSize: 13, fontWeight: 600 }}>{formatTime(couple.ceremony_time)}</span>
                </div>
              )}
              {couple?.reception_time && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: BURG, fontSize: 12, fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>🥂 Reception</span>
                  <span style={{ color: DARK, fontSize: 13, fontWeight: 600 }}>{formatTime(couple.reception_time)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p style={{ color: CREAM, opacity: 0.65, fontSize: 13, textAlign: 'center', marginTop: 32, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', maxWidth: 260 }}>
        We look forward to celebrating this special day with you.
      </p>

      <button
        onClick={onNext}
        style={{
          marginTop: 28,
          background: `linear-gradient(135deg, ${GOLD}, #B8924A)`,
          color: BURG_DARK, border: 'none', borderRadius: 50,
          padding: '13px 38px', fontSize: 12, fontWeight: 700,
          letterSpacing: '0.15em',
          fontFamily: "'Playfair Display', serif",
          cursor: 'pointer',
          boxShadow: `0 4px 20px ${GOLD}66`,
        }}
      >
        View Invitation →
      </button>
    </div>
  )
}

// ── Details slide ─────────────────────────────────────────────────────────────
function DetailsSlide({ couple, guest }: { couple: any; guest?: any }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [rsvpDone, setRsvpDone] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)

  useEffect(() => {
    if (!couple?.wedding_date) return
    const target = new Date(couple.wedding_date).getTime()
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [couple])

  const weddingDateText = couple?.wedding_date
    ? new Date(couple.wedding_date).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const card = (children: React.ReactNode) => (
    <div style={{
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(12px)',
      borderRadius: 20,
      padding: '20px 22px',
      marginBottom: 14,
      border: `1px solid ${GOLD}44`,
      boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
    }}>
      {children}
    </div>
  )

  const label = (text: string) => (
    <p style={{ color: BURG, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>{text}</p>
  )

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'Playfair Display', serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />

      {/* background */}
      <div className="fixed inset-0 z-0">
        {couple?.together_photo_url ? (
          <img src={couple.together_photo_url} alt="bg" className="w-full h-full object-cover" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(160deg, ${BURG_DARK} 0%, ${BURG} 60%, #8B2A4A 100%)` }} />
        )}
        <div className="absolute inset-0" style={{ background: 'rgba(250,240,235,0.90)', backdropFilter: 'blur(3px)' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-5 py-14 text-center">

        {/* photo + names */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            width: 124, height: 124, borderRadius: '50%', overflow: 'hidden',
            margin: '0 auto 16px',
            border: `4px solid white`,
            boxShadow: `0 0 0 3px ${GOLD}, 0 8px 28px ${BURG_DARK}66`,
          }}>
            {couple?.together_photo_url
              ? <img src={couple.together_photo_url} alt="couple" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${BURG}, ${ROSE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>💑</div>
            }
          </div>
          <h1 style={{ color: BURG_DARK, fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            {couple?.boy_name}
          </h1>
          <p style={{ color: GOLD, fontSize: 22, margin: '4px 0', fontStyle: 'italic' }}>&amp;</p>
          <h1 style={{ color: BURG_DARK, fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            {couple?.girl_name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '12px 0 6px' }}>
            <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <span style={{ color: GOLD, fontSize: 12 }}>✦</span>
            <div style={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>
          <p style={{ color: BURG, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Getting Married</p>
        </div>

        {/* parents */}
        {card(
          <div>
            <div style={{ marginBottom: 12 }}>
              {label('Beloved Son of')}
              <p style={{ color: DARK, fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                {couple?.boy_father_name} &amp; {couple?.boy_mother_name}
              </p>
            </div>
            <div style={{ height: 1, background: `${GOLD}44`, margin: '12px 0' }} />
            <div>
              {label('Beloved Daughter of')}
              <p style={{ color: DARK, fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                {couple?.girl_father_name} &amp; {couple?.girl_mother_name}
              </p>
            </div>
          </div>
        )}

        {/* countdown */}
        {card(
          <>
            {label('Until We Say "I Do"')}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hrs', value: countdown.hours },
                { label: 'Min', value: countdown.minutes },
                { label: 'Sec', value: countdown.seconds },
              ].map(item => (
                <div key={item.label} style={{
                  background: `linear-gradient(160deg, ${BURG_DARK}, ${BURG})`,
                  borderRadius: 14,
                  width: 64, paddingTop: 14, paddingBottom: 14,
                  textAlign: 'center',
                  boxShadow: `0 4px 14px ${BURG_DARK}55`,
                }}>
                  <span style={{ display: 'block', fontSize: 22, fontWeight: 700, color: CREAM, fontFamily: "'Playfair Display', serif" }}>{item.value}</span>
                  <span style={{ display: 'block', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: CREAM, opacity: 0.75 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* date & schedule */}
        {card(
          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: 14 }}>
              {label('Wedding Date')}
              <p style={{ color: DARK, fontSize: 15, fontStyle: 'italic', margin: 0 }}>{weddingDateText}</p>
            </div>
            <div style={{ height: 1, background: `${GOLD}33`, marginBottom: 14 }} />
            <div>
              {label('Schedule')}
              {couple?.ceremony_time && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: BURG, fontSize: 13, fontStyle: 'italic' }}>💍 Poruwa Ceremony</span>
                  <span style={{ color: DARK, fontSize: 13 }}>{formatTime(couple.ceremony_time)}</span>
                </div>
              )}
              {couple?.reception_time && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: BURG, fontSize: 13, fontStyle: 'italic' }}>🥂 Reception</span>
                  <span style={{ color: DARK, fontSize: 13 }}>{formatTime(couple.reception_time)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* venue */}
        {(couple?.venue_name || couple?.venue_address) && card(
          <div style={{ textAlign: 'left' }}>
            {label('Venue')}
            <p style={{ color: DARK, fontSize: 15, fontStyle: 'italic', margin: '0 0 4px' }}>{couple.venue_name}</p>
            <p style={{ color: DARK, fontSize: 12, opacity: 0.7, margin: '0 0 12px' }}>{couple.venue_address}</p>
            {couple.map_url && (
              <button
                onClick={() => window.open(couple.map_url, '_blank')}
                style={{
                  background: `linear-gradient(135deg, ${BURG}, ${ROSE})`,
                  color: CREAM, border: 'none', borderRadius: 50,
                  padding: '8px 20px', fontSize: 11, cursor: 'pointer',
                  letterSpacing: '0.1em',
                }}
              >
                📍 Open in Google Maps
              </button>
            )}
          </div>
        )}

        {/* RSVP */}
        {guest && !rsvpDone && (
          <div style={{
            background: 'rgba(255,255,255,0.94)',
            borderRadius: 20, padding: '22px',
            marginBottom: 14,
            border: `1px solid ${GOLD}44`,
            boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
          }}>
            {label('RSVP')}
            <p style={{ color: DARK, fontSize: 13, fontStyle: 'italic', marginBottom: 16 }}>
              Dear <strong>{guest.name}</strong>, kindly confirm your attendance.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true)
                  try {
                    const { submitRsvpAction } = await import('../../../actions/guests')
                    await submitRsvpAction(guest.rsvp_token, 'confirmed', 1)
                    setRsvpStatus('confirmed')
                    setRsvpDone(true)
                  } catch { setSubmitting(false) }
                }}
                style={{
                  background: `linear-gradient(135deg, ${BURG}, ${ROSE})`,
                  color: CREAM, border: 'none', borderRadius: 50,
                  padding: '11px 24px', fontSize: 12, fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                }}
              >
                🎉 Joyfully Accept
              </button>
              <button
                disabled={submitting}
                onClick={() => setShowDeclineModal(true)}
                style={{
                  background: 'transparent',
                  color: BURG, border: `1px solid ${BURG}88`,
                  borderRadius: 50, padding: '11px 24px', fontSize: 12,
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                }}
              >
                Regretfully Decline
              </button>
            </div>
          </div>
        )}

        {rsvpDone && (
          <div style={{
            background: rsvpStatus === 'confirmed' ? `${BURG}11` : '#f5f5f5',
            borderRadius: 20, padding: '20px',
            marginBottom: 14,
            border: `1px solid ${rsvpStatus === 'confirmed' ? BURG : '#ccc'}44`,
          }}>
            <p style={{ fontSize: 20, marginBottom: 6 }}>{rsvpStatus === 'confirmed' ? '🎉' : '💐'}</p>
            <p style={{ color: DARK, fontSize: 14, fontStyle: 'italic', margin: 0 }}>
              {rsvpStatus === 'confirmed'
                ? 'We are delighted to have you celebrate with us!'
                : 'We will miss you, but thank you for letting us know.'}
            </p>
          </div>
        )}

        {/* footer */}
        <p style={{ marginTop: 24, fontSize: 13, fontStyle: 'italic', opacity: 0.65, color: DARK }}>
          We look forward to celebrating with you.
        </p>
        <p style={{ color: GOLD, fontSize: 20, marginTop: 8 }}>🌹 ❤ 🌹</p>
        <p style={{ color: DARK, opacity: 0.4, fontSize: 10, marginTop: 4 }}>❤ Forever Begins Here ❤</p>
      </div>

      {/* decline modal */}
      {showDeclineModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 24,
        }}>
          <div style={{
            background: CREAM, borderRadius: 24, padding: 28,
            maxWidth: 320, width: '100%',
            border: `1px solid ${GOLD}44`,
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          }}>
            <p style={{ fontSize: 24, textAlign: 'center', marginBottom: 8 }}>💐</p>
            <p style={{ color: DARK, fontSize: 15, fontStyle: 'italic', textAlign: 'center', marginBottom: 20 }}>
              We will truly miss you on our special day.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={async () => {
                  setShowDeclineModal(false)
                  setSubmitting(true)
                  try {
                    const { submitRsvpAction } = await import('../../../actions/guests')
                    await submitRsvpAction(guest!.rsvp_token, 'declined', 0)
                    setRsvpStatus('declined')
                    setRsvpDone(true)
                  } catch { setSubmitting(false) }
                }}
                style={{
                  flex: 1, background: `${BURG}22`, color: BURG,
                  border: `1px solid ${BURG}55`, borderRadius: 50,
                  padding: '11px 0', fontSize: 12, cursor: 'pointer',
                }}
              >
                Yes, Decline
              </button>
              <button
                onClick={() => setShowDeclineModal(false)}
                style={{
                  flex: 1,
                  background: `linear-gradient(135deg, ${BURG}, ${ROSE})`,
                  color: CREAM, border: 'none', borderRadius: 50,
                  padding: '11px 0', fontSize: 12, cursor: 'pointer',
                }}
              >
                Wait, I'll Come! 🎉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function Template4PreviewPage() {
  const [couple, setCouple] = useState<any>(null)
  const [slide, setSlide] = useState<'cover' | 'calendar' | 'details'>('cover')
  const [musicStarted, setMusicStarted] = useState(false)

  useEffect(() => {
    getProfileAction().then(res => {
      if (res.success) setCouple(res.data)
    })
  }, [])

  useEffect(() => {
    const el = document.getElementById('t4-music') as HTMLVideoElement | null
    if (!el) return
    if (musicStarted) {
      el.currentTime = 2
      el.muted = false
      el.play().catch(() => {
        el.muted = true
        el.play().then(() => setTimeout(() => { el.muted = false }, 300)).catch(() => {})
      })
    } else {
      el.pause()
    }
  }, [musicStarted])

  const handleCoverTap = () => {
    if (slide !== 'cover') return
    setMusicStarted(true)
    setSlide('calendar')
  }

  return (
    <>
      <video id="t4-music" src="/assests/video/video1.mp4" loop playsInline style={{ display: 'none' }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />

      {slide === 'cover'    && <CoverSlide    couple={couple} onTap={handleCoverTap} />}
      {slide === 'calendar' && <CalendarSlide couple={couple} onNext={() => setSlide('details')} />}
      {slide === 'details'  && <DetailsSlide  couple={couple} />}
    </>
  )
}