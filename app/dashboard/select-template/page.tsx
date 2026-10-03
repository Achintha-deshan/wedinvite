'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import { getProfileAction, confirmTemplateUseAction } from '../../actions/auth'

// ── Sage/Emerald/Gold palette (matches invite page aesthetic) ─────────────────
const OL      = '#7A9E7E'   // sage green — mid tone
const OL_DARK = '#2D6A4F'   // emerald green — deep
const OL_DEEP = '#1B3A2D'   // forest dark — bg
const GOLD    = '#C8A96E'   // warm gold
const CREAM   = '#F5F8F2'   // green-tinted cream white
const DARK    = '#162820'   // near-black green

const SAMPLE_TEMPLATES = [
  {
    id: 'template-1',
    name: 'Garden Romance',
    description: 'Soft floral design with elegant typography',
    price_lkr: 2500,
    theme: 'garden',
    emoji: '🌸',
  },
  {
    id: 'template-2',
    name: 'Royal Elegance',
    description: 'Classic gold and white luxury design',
    price_lkr: 2500,
    theme: 'royal',
    emoji: '👑',
  },
  {
    id: 'template-3',
    name: 'Midnight Luxury',
    description: 'Dark romantic design with golden accents',
    price_lkr: 2500,
    theme: 'midnight',
    emoji: '✨',
  },
  {
    id: 'template-4',
    name: 'Emerald Garden',
    description: 'Fresh green botanical wedding invitation',
    price_lkr: 2500,
    theme: 'emerald',
    emoji: '🌿',
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [paying, setPaying] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const res = await getProfileAction()
      if (res.success && res.data) {
        setProfile(res.data)
      }
    }
    init()
  }, [])

  const handleSelect = (templateId: string) => {
    setSelected(templateId)
  }

  const handleClosePanel = () => {
    setSelected(null)
  }

  const hasPaidForThis = (templateId: string) => {
    return profile?.is_paid && profile?.template_id === templateId
  }

  const handlePayment = async () => {
    if (!selected) return
    setPaying(true)
    router.push(`/dashboard/payment?template=${selected}`)
  }

  const handleUseTemplate = async () => {
    if (!selected) return
    setConfirming(true)
    const res = await confirmTemplateUseAction(selected)
    setConfirming(false)
    if (res.success) {
      router.push(`/dashboard/preview/${selected}`)
    } else {
      alert(res.error || 'Something went wrong')
    }
  }

  const selectedTemplate = SAMPLE_TEMPLATES.find(t => t.id === selected)

  return (
    <div style={{ minHeight: '100vh', background: OL_DEEP }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .template-card {
          animation: fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* Section label chip — ● LABEL ● */
        .section-label {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(42,90,63,0.55);
          border: 1px solid rgba(200,169,110,0.25);
          border-radius: 100px;
          padding: 5px 14px;
          backdrop-filter: blur(8px);
        }
        .section-label-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${GOLD}; opacity: 0.85;
        }
        .section-label-text {
          color: ${GOLD};
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .glass-card {
          background: rgba(42,90,63,0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(200,169,110,0.2);
          border-radius: 22px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .glass-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(0,0,0,0.35);
        }
        .glass-card.selected {
          border-color: rgba(200,169,110,0.6);
          box-shadow: 0 0 0 1px rgba(200,169,110,0.4), 0 0 32px rgba(200,169,110,0.22);
        }

        .cta-button {
          background: linear-gradient(135deg, ${OL}, ${OL_DARK});
          border: 1px solid rgba(200,169,110,0.5);
          color: ${CREAM};
          transition: filter 0.2s ease, transform 0.15s ease;
        }
        .cta-button:hover:not(:disabled) { filter: brightness(1.08); }
        .cta-button:active:not(:disabled) { transform: scale(0.99); }
        .cta-button:disabled { opacity: 0.6; cursor: default; }

        .preview-link {
          color: ${GOLD};
          font-size: 11px;
          text-decoration: underline;
          text-decoration-color: rgba(200,169,110,0.4);
          text-underline-offset: 3px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .preview-link:hover { color: #ddbd85; }
      `}</style>

      {/* ── Nav bar ── */}
      <nav style={{
        background: DARK,
        borderBottom: `1px solid ${GOLD}22`,
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>💍</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', fontSize: 17,
            color: CREAM, letterSpacing: '0.02em',
          }}>WedInvite</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: `${CREAM}99`, fontSize: 12, letterSpacing: '0.05em',
          }}
        >
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 20px 60px' }}>

        {/* ── Heading ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div className="section-label">
              <div className="section-label-dot" />
              <span className="section-label-text">Templates</span>
              <div className="section-label-dot" />
            </div>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(28px, 5vw, 38px)',
            color: CREAM, margin: 0,
          }}>
            Choose Your Template
          </h1>
          <p style={{ color: `${CREAM}77`, fontSize: 13, marginTop: 10, letterSpacing: '0.03em' }}>
            Select a design for your wedding invitation
          </p>
        </div>

        {/* ── Template grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24, marginBottom: 20,
          filter: selected ? 'blur(4px)' : 'none',
          transform: selected ? 'scale(0.98)' : 'none',
          pointerEvents: selected ? 'none' : 'auto',
          transition: 'all 0.3s ease',
        }}>
          {SAMPLE_TEMPLATES.map((template, i) => {
            const isSelected = selected === template.id
            const paidBadge = hasPaidForThis(template.id)

            return (
              <div
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`glass-card template-card ${isSelected ? 'selected' : ''}`}
                style={{
                  cursor: 'pointer', overflow: 'hidden',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14, zIndex: 10,
                    background: `linear-gradient(135deg, ${GOLD}, #b08f52)`,
                    color: DARK, fontSize: 11, fontWeight: 600,
                    padding: '4px 12px', borderRadius: 100,
                    letterSpacing: '0.03em',
                  }}>
                    ✓ Selected
                  </div>
                )}
                {paidBadge && !isSelected && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14, zIndex: 10,
                    background: 'rgba(76,175,80,0.9)',
                    color: CREAM, fontSize: 11, fontWeight: 600,
                    padding: '4px 12px', borderRadius: 100,
                    letterSpacing: '0.03em',
                  }}>
                    ✓ Paid
                  </div>
                )}

                {/* couple photo overlay preview */}
                <div style={{
                  position: 'relative',
                  padding: '32px 24px',
                  minHeight: 200,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 10,
                  textAlign: 'center',
                  background: `linear-gradient(160deg, ${OL_DARK}55, ${OL_DEEP}99)`,
                }}>
                  <div style={{ fontSize: 46 }}>{template.emoji}</div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic', fontSize: 20,
                    color: CREAM,
                  }}>
                    {profile?.boy_name || 'Nuwan'} & {profile?.girl_name || 'Sanduni'}
                  </div>
                  <div style={{ color: `${CREAM}88`, fontSize: 12 }}>
                    {profile?.wedding_date ? new Date(profile.wedding_date).toLocaleDateString() : 'January 15, 2026'}
                  </div>
                  <div className="section-label" style={{ marginTop: 2 }}>
                    <div className="section-label-dot" />
                    <span className="section-label-text">{template.name}</span>
                    <div className="section-label-dot" />
                  </div>
                </div>

                {/* footer */}
                <div style={{
                  background: DARK,
                  padding: '18px 22px',
                  borderTop: `1px solid ${GOLD}1c`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: 'italic', fontSize: 15,
                      color: CREAM, margin: 0,
                    }}>{template.name}</h3>
                    <span style={{ color: GOLD, fontSize: 12, fontWeight: 600 }}>
                      LKR {template.price_lkr.toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: `${CREAM}66`, fontSize: 11.5, margin: '0 0 10px', lineHeight: 1.5 }}>
                    {template.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/preview/${template.id}`)
                    }}
                    className="preview-link"
                  >
                    Preview →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Modal ── */}
      {selected && selectedTemplate && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(22,40,32,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
            animation: 'overlayIn 0.25s ease-out both',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%', maxWidth: 400,
              background: 'rgba(22,40,32,0.92)',
              animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
              overflow: 'hidden',
            }}
          >
            <div style={{
              borderBottom: `1px solid ${GOLD}2a`,
              padding: '18px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 26 }}>{selectedTemplate.emoji}</span>
                <div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic', fontSize: 17,
                    color: CREAM, margin: 0,
                  }}>{selectedTemplate.name}</h2>
                  <p style={{ color: GOLD, fontSize: 12, margin: '2px 0 0' }}>
                    LKR {selectedTemplate.price_lkr.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClosePanel}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${GOLD}33`,
                  color: `${CREAM}aa`,
                  width: 30, height: 30, borderRadius: '50%',
                  fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 22 }}>
              {hasPaidForThis(selectedTemplate.id) ? (
                <>
                  <div style={{
                    background: 'rgba(76,175,80,0.12)',
                    border: '1px solid rgba(76,175,80,0.3)',
                    borderRadius: 16, padding: 14,
                    textAlign: 'center', marginBottom: 18,
                  }}>
                    <p style={{ color: '#7ec97f', fontSize: 13, fontWeight: 600, margin: '0 0 3px' }}>
                      ✓ Payment Completed
                    </p>
                    <p style={{ color: '#7ec97f', fontSize: 11.5, opacity: 0.85, margin: 0 }}>
                      You can now use this template
                    </p>
                  </div>
                  <button
                    onClick={handleUseTemplate}
                    disabled={confirming}
                    className="cta-button"
                    style={{
                      width: '100%', padding: '15px', borderRadius: 50,
                      fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
                      cursor: confirming ? 'default' : 'pointer',
                      boxShadow: '0 8px 28px rgba(45,106,79,0.4)',
                    }}
                  >
                    {confirming ? 'Loading...' : 'Use This Template →'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ color: `${CREAM}99`, fontSize: 13, lineHeight: 1.6, textAlign: 'center', margin: '0 0 18px' }}>
                    Pay once to unlock this template — add your photos, music, and start inviting guests.
                  </p>
                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="cta-button"
                    style={{
                      width: '100%', padding: '15px', borderRadius: 50,
                      fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
                      cursor: paying ? 'default' : 'pointer',
                      boxShadow: '0 8px 28px rgba(45,106,79,0.4)',
                    }}
                  >
                    {paying ? 'Loading...' : `Pay Here — LKR ${selectedTemplate.price_lkr.toLocaleString()}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
