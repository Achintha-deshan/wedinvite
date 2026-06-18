'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getInvitationByTokenAction, submitRsvpAction } from '../../actions/guests'

const PLACEHOLDER_BOY = 'https://api.dicebear.com/7.x/avataaars/svg?seed=groom&backgroundColor=fde68a'
const PLACEHOLDER_GIRL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=bride&backgroundColor=fbcfe8'

// Template 1 — pink/floral
const PINK = '#D88A9A'
const PINK_DARK = '#A85C70'
const CREAM = '#FBF3EE'
const GOLD = '#C99A4B'
const DARK_T1 = '#4A3B36'

// Template 2 — sage green
const SAGE = '#7C9070'
const SAGE_DARK = '#3F4D38'
const CREAM2 = '#F7F6F1'
const DARK_T2 = '#1F231D'

export default function GuestInvitePage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [guest, setGuest] = useState<any>(null)
  const [couple, setCouple] = useState<any>(null)
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

  const handleAccept = () => {
    setShowCountPicker(true)
  }

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

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return ''
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0` : ''
  }

  const templateId = couple?.template_id || 'template-1'
  const isSage = templateId === 'template-2'

  const ACCENT = isSage ? SAGE_DARK : PINK_DARK
  const ACCENT_SOFT = isSage ? SAGE : PINK
  const TEXT_DARK = isSage ? DARK_T2 : DARK_T1
  const GOLD_TONE = isSage ? SAGE_DARK : GOLD

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isSage ? CREAM2 : CREAM }}>
        <div className="text-2xl animate-pulse" style={{ color: ACCENT }}>{isSage ? '🍃' : '♥'}</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" style={{ background: CREAM }}>
        <div>
          <div className="text-4xl mb-4">😔</div>
          <h1 className="font-serif text-xl mb-2" style={{ color: PINK_DARK }}>Invitation not found</h1>
          <p className="text-sm" style={{ color: GOLD }}>This link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  const boyName = couple?.boy_name || 'Nuwan'
  const girlName = couple?.girl_name || 'Sanduni'
  const venueName = couple?.venue_name || 'Hilton Colombo'
  const venueAddress = couple?.venue_address || 'Colombo, Sri Lanka'
  const weddingDateText = couple?.wedding_date ? formatDate(couple.wedding_date) : 'Saturday, January 15, 2026'
  const boyParents = couple?.boy_father_name && couple?.boy_mother_name
    ? couple.boy_father_name + ' & ' + couple.boy_mother_name
    : 'Mr. & Mrs. Perera'
  const girlParents = couple?.girl_father_name && couple?.girl_mother_name
    ? couple.girl_father_name + ' & ' + couple.girl_mother_name
    : 'Mr. & Mrs. Silva'
  const mapUrl = couple?.map_url || ''
  const togetherPhoto = couple?.together_photo_url || ''
  const storyPhoto = couple?.story_photo_url || ''
  const boyPhoto = couple?.boy_photo_url || ''
  const girlPhoto = couple?.girl_photo_url || ''
  const ceremonyTime = couple?.ceremony_time || ''
  const receptionTime = couple?.reception_time || ''
  const dinnerTime = couple?.dinner_time || ''
  const notes = couple?.additional_notes || ''
  const musicUrl = couple?.music_youtube_url || ''
  const guestName = guest?.name || 'Guest'

  const RsvpSection = () => (
    <div className="mb-8">
      <p className="text-xs tracking-widest uppercase mb-4" style={{ color: GOLD_TONE }}>RSVP</p>

      {responded ? (
        <div
          className="rounded-2xl p-5"
          style={{
            background: responseStatus === 'confirmed' ? 'rgba(76,175,80,0.08)' : 'rgba(220,80,80,0.08)',
            border: `1px solid ${responseStatus === 'confirmed' ? 'rgba(76,175,80,0.4)' : 'rgba(220,80,80,0.4)'}`,
          }}
        >
          {responseStatus === 'confirmed' ? (
            <>
              <p className="text-sm font-medium mb-1" style={{ color: '#3a8a3e' }}>✓ You're confirmed!</p>
              <p className="text-xs" style={{ color: '#3a8a3e', opacity: 0.75 }}>We can't wait to celebrate with you, {guestName}!</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium mb-1" style={{ color: '#b94545' }}>Thanks for letting us know</p>
              <p className="text-xs" style={{ color: '#b94545', opacity: 0.75 }}>We'll miss you, {guestName}. Sending our love!</p>
            </>
          )}
        </div>
      ) : showCountPicker ? (
        <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#fff', border: `1px solid ${ACCENT_SOFT}50` }}>
          <p className="text-sm mb-3" style={{ color: TEXT_DARK }}>How many will be attending?</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${ACCENT_SOFT}`, color: ACCENT }}
            >
              -
            </button>
            <span className="text-lg font-medium w-8" style={{ color: TEXT_DARK }}>{guestCount}</span>
            <button
              onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${ACCENT_SOFT}`, color: ACCENT }}
            >
              +
            </button>
          </div>
          <button
            onClick={handleConfirmAccept}
            disabled={submitting}
            className="w-full py-3 font-medium rounded-full text-sm disabled:opacity-50"
            style={{ background: ACCENT_SOFT, color: '#fff' }}
          >
            {submitting ? 'Submitting...' : 'Confirm Attendance'}
          </button>
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleAccept}
            disabled={submitting}
            className="px-8 py-3 font-medium rounded-full text-sm disabled:opacity-50 shadow-sm"
            style={{ background: ACCENT_SOFT, color: '#fff' }}
          >
            Joyfully Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={submitting}
            className="px-8 py-3 rounded-full text-sm disabled:opacity-50"
            style={{ border: `1px solid ${ACCENT_SOFT}`, color: ACCENT }}
          >
            {submitting ? '...' : 'Decline'}
          </button>
        </div>
      )}
    </div>
  )

  if (isSage) {
    return (
      <div className="min-h-screen" style={{ background: CREAM2, color: DARK_T2 }}>
        <div className="max-w-lg mx-auto px-6 py-12 text-center">

          <div className="mb-6 rounded-2xl py-3 px-4" style={{ background: '#fff', border: `1px solid ${SAGE}40` }}>
            <p className="text-sm font-serif italic" style={{ color: SAGE_DARK }}>Dear {guestName},</p>
            <p className="text-xs mt-1" style={{ color: SAGE_DARK, opacity: 0.7 }}>You are warmly invited</p>
          </div>

          <div className="relative max-w-xs mx-auto mb-8">
            <div className="rounded-t-full overflow-hidden shadow-lg" style={{ border: `1px solid ${SAGE}40` }}>
              <img src={togetherPhoto || PLACEHOLDER_BOY} alt="Couple" className="w-full h-72 object-cover" />
            </div>
          </div>

          <h1 className="font-serif italic text-4xl mb-2" style={{ color: SAGE_DARK }}>{boyName} & {girlName}</h1>
          <p className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: SAGE_DARK, opacity: 0.6 }}>Are getting married</p>

          <div className="mb-8">
            <p className="text-sm">{boyParents}</p>
            <p className="text-xs my-1" style={{ opacity: 0.6 }}>and</p>
            <p className="text-sm">{girlParents}</p>
          </div>

          <div className="mb-6">
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: SAGE_DARK }}>Date</p>
            <p className="text-lg font-serif">{weddingDateText}</p>
          </div>

          <div className="rounded-2xl p-5 mb-6 shadow-sm" style={{ background: '#fff', border: `1px solid ${SAGE}30` }}>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: SAGE_DARK }}>Schedule</p>
            <div className="space-y-3">
              {ceremonyTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: SAGE_DARK }}>Ceremony</span>
                  <span>{formatTime(ceremonyTime)}</span>
                </div>
              )}
              {receptionTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: SAGE_DARK }}>Reception</span>
                  <span>{formatTime(receptionTime)}</span>
                </div>
              )}
              {dinnerTime && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: SAGE_DARK }}>The Party</span>
                  <span>{formatTime(dinnerTime)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: SAGE_DARK }}>Venue</p>
            <p className="text-lg font-serif">{venueName}</p>
            <p className="text-sm mt-1" style={{ opacity: 0.7 }}>{venueAddress}</p>
            {mapUrl && (
              <button
                onClick={() => window.open(mapUrl, '_blank')}
                className="inline-block mt-3 text-xs px-4 py-2 rounded-full"
                style={{ background: SAGE_DARK, color: '#fff' }}
              >
                Get directions
              </button>
            )}
          </div>

          {musicUrl && getYoutubeEmbedUrl(musicUrl) && (
            <div className="mb-8">
              <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: SAGE_DARK }}>🎵 Music</p>
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${SAGE}30` }}>
                <iframe width="100%" height="180" src={getYoutubeEmbedUrl(musicUrl)} title="Wedding music" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
            </div>
          )}

          <RsvpSection />

          {notes && (
            <div className="rounded-2xl p-4 mb-8 shadow-sm" style={{ background: '#fff', border: `1px solid ${SAGE}30` }}>
              <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: SAGE_DARK }}>Note</p>
              <p className="text-sm">{notes}</p>
            </div>
          )}

          <p className="font-serif italic text-lg" style={{ color: SAGE_DARK }}>{boyName} & {girlName}</p>
          <p className="text-[10px] mt-1" style={{ opacity: 0.5 }}>With love and gratitude</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: CREAM, color: DARK_T1 }}>
      <div className="h-1" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }}></div>

      <div className="max-w-lg mx-auto px-6 py-12 text-center">

        <div className="mb-6 rounded-2xl py-3 px-4 shadow-sm" style={{ background: '#fff', border: `1px solid ${PINK}30` }}>
          <p className="text-sm font-serif" style={{ color: PINK_DARK }}>Dear {guestName},</p>
          <p className="text-xs mt-1" style={{ color: GOLD }}>You are warmly invited</p>
        </div>

        <div className="text-2xl mb-6" style={{ color: PINK }}>❀ ❀ ❀</div>

        {(togetherPhoto || storyPhoto) ? (
          <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-lg" style={{ border: `4px solid ${PINK}` }}>
            <img src={togetherPhoto || storyPhoto} alt="Couple" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex justify-center mb-6 gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: `2px solid ${PINK}` }}>
              <img src={boyPhoto || PLACEHOLDER_BOY} alt="Groom" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: `2px solid ${PINK}` }}>
              <img src={girlPhoto || PLACEHOLDER_GIRL} alt="Bride" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <p className="text-xs tracking-widest uppercase mb-6" style={{ color: GOLD }}>
          Together with their families
        </p>

        <div className="mb-8">
          <p className="text-sm">{boyParents}</p>
          <p className="text-xs my-1" style={{ opacity: 0.6 }}>and</p>
          <p className="text-sm">{girlParents}</p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px" style={{ background: `${PINK}40` }}></div>
          <span className="text-lg">💍</span>
          <div className="flex-1 h-px" style={{ background: `${PINK}40` }}></div>
        </div>

        <p className="text-xs tracking-widest uppercase mb-6" style={{ color: GOLD }}>
          Request the pleasure of your company at the marriage of their children
        </p>

        <div className="mb-8">
          <h1 className="font-serif text-5xl mb-2" style={{ color: PINK_DARK }}>{boyName}</h1>
          <p className="text-2xl font-serif italic mb-2" style={{ color: PINK }}>&amp;</p>
          <h1 className="font-serif text-5xl" style={{ color: PINK_DARK }}>{girlName}</h1>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px" style={{ background: `${PINK}40` }}></div>
          <span className="text-sm" style={{ color: PINK }}>❀</span>
          <div className="flex-1 h-px" style={{ background: `${PINK}40` }}></div>
        </div>

        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: GOLD }}>Date</p>
          <p className="text-lg font-serif">{weddingDateText}</p>
        </div>

        <div className="rounded-2xl p-5 mb-6 shadow-sm" style={{ background: '#fff', border: `1px solid ${PINK}30` }}>
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: GOLD }}>Schedule</p>
          <div className="space-y-3">
            {ceremonyTime && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: PINK_DARK }}>Ceremony</span>
                <span>{formatTime(ceremonyTime)}</span>
              </div>
            )}
            {receptionTime && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: PINK_DARK }}>Reception</span>
                <span>{formatTime(receptionTime)}</span>
              </div>
            )}
            {dinnerTime && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: PINK_DARK }}>Dinner</span>
                <span>{formatTime(dinnerTime)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: GOLD }}>Venue</p>
          <p className="text-lg font-serif">{venueName}</p>
          <p className="text-sm mt-1" style={{ opacity: 0.75 }}>{venueAddress}</p>
          {mapUrl && (
            <button
              onClick={() => window.open(mapUrl, '_blank')}
              className="inline-block mt-3 text-xs px-4 py-2 rounded-full"
              style={{ color: '#fff', background: PINK }}
            >
              Open in Google Maps
            </button>
          )}
        </div>

        {musicUrl && getYoutubeEmbedUrl(musicUrl) && (
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase mb-4" style={{ color: GOLD }}>🎵 Music</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${PINK}30` }}>
              <iframe width="100%" height="180" src={getYoutubeEmbedUrl(musicUrl)} title="Wedding music" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
          </div>
        )}

        <RsvpSection />

        {notes && (
          <div className="rounded-2xl p-4 mb-8 shadow-sm" style={{ background: '#fff', border: `1px solid ${PINK}30` }}>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: GOLD }}>Note</p>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        <div className="text-2xl mb-4" style={{ color: PINK }}>❀ ❀ ❀</div>
        <p className="text-xs tracking-widest" style={{ color: GOLD }}>WedInvite.lk</p>

      </div>

      <div className="h-1" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }}></div>
    </div>
  )
}