'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import { getProfileAction, confirmTemplateUseAction } from '../../actions/auth'

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

const THEME_STYLES: Record<string, any> = {
  garden: {
    bg: 'from-pink-100 to-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-600',
  },
  royal: {
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-600',
  },
  midnight: {
    bg: 'from-purple-950 to-slate-900',
    border: 'border-purple-800',
    badge: 'bg-purple-900 text-purple-300',
  },
  emerald: {
    bg: 'from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-600',
  },
}

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100 via-white to-white">

      <nav className="bg-white/80 backdrop-blur-xl border-b border-rose-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💍</span>
          <span className="font-serif text-lg font-medium text-gray-800">WedInvite</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs text-gray-400 hover:text-gray-600 transition-all"
        >
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-medium text-gray-800 mb-2">
            Choose Your Template
          </h1>
          <p className="text-sm text-gray-400">
            Select a design for your wedding invitation
          </p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 transition-all duration-300 ${selected ? 'blur-sm scale-[0.98] pointer-events-none' : ''}`}>
          {SAMPLE_TEMPLATES.map((template) => {
            const style = THEME_STYLES[template.theme]
            const isSelected = selected === template.id
            const paidBadge = hasPaidForThis(template.id)

            return (
              <div
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`relative cursor-pointer rounded-3xl border-2 transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-rose-400 shadow-xl shadow-rose-100'
                    : `${style.border} hover:shadow-lg hover:scale-[1.01]`
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10 bg-rose-400 text-white text-xs px-3 py-1 rounded-full font-medium">
                    ✓ Selected
                  </div>
                )}
                {paidBadge && !isSelected && (
                  <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    ✓ Paid
                  </div>
                )}

                <div className={`bg-gradient-to-br ${style.bg} p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-3`}>
                  <div className="text-5xl mb-2">{template.emoji}</div>
                  <div className={`text-xl font-serif font-medium ${template.theme === 'midnight' ? 'text-white' : 'text-gray-800'}`}>
                    {profile?.boy_name || 'Nuwan'} & {profile?.girl_name || 'Sanduni'}
                  </div>
                  <div className={`text-xs ${template.theme === 'midnight' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {profile?.wedding_date ? new Date(profile.wedding_date).toLocaleDateString() : 'January 15, 2026'}
                  </div>
                  <div className={`text-xs px-3 py-1 rounded-full mt-1 ${style.badge}`}>
                    {template.name}
                  </div>
                </div>

                <div className="bg-white p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-800 text-sm">{template.name}</h3>
                    <span className="text-xs font-bold text-rose-500">LKR {template.price_lkr.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400">{template.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/preview/${template.id}`)
                    }}
                    className="mt-3 text-xs text-rose-400 hover:text-rose-500 underline underline-offset-2"
                  >
                    Preview →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {selected && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">

            <div className="border-b border-rose-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTemplate.emoji}</span>
                <div>
                  <h2 className="font-serif text-lg text-gray-800">{selectedTemplate.name}</h2>
                  <p className="text-xs text-gray-400">LKR {selectedTemplate.price_lkr.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={handleClosePanel}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {hasPaidForThis(selectedTemplate.id) ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 text-center">
                    <p className="text-green-600 text-sm font-medium">✓ Payment Completed</p>
                    <p className="text-green-500 text-xs mt-1">You can now use this template</p>
                  </div>
                  <button
                    onClick={handleUseTemplate}
                    disabled={confirming}
                    className="w-full py-4 bg-rose-400 hover:bg-rose-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-rose-200 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {confirming ? 'Loading...' : 'Use This Template →'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Pay once to unlock this template — add your photos, music, and start inviting guests.
                  </p>
                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full py-4 bg-rose-400 hover:bg-rose-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-rose-200 transition-all active:scale-[0.99] disabled:opacity-50"
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