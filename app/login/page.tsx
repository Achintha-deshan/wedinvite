'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInAction } from '../actions/auth'
import { checkAdminAction } from '../actions/admin'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    console.log('[LOGIN] submit clicked, identifier:', identifier)

    const result = await signInAction({ identifier, password })
    console.log('[LOGIN] signInAction result:', result)

    if (result.success) {
      const adminCheck = await checkAdminAction()
      console.log('[LOGIN] checkAdminAction result:', adminCheck)

      if (adminCheck.isAdmin) {
        console.log('[LOGIN] isAdmin true, redirecting to /admin NOW')
        window.location.href = '/admin'
      } else {
        console.log('[LOGIN] isAdmin false, redirecting to /dashboard NOW')
        window.location.href = '/dashboard'
      }
    } else {
      console.log('[LOGIN] signIn failed:', result.error)
      setError(result.error ?? 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100 via-white to-white">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💍</div>
          <h1 className="text-3xl font-serif font-medium text-gray-800">WedInvite</h1>
          <p className="text-sm text-gray-400 mt-2">Sign in to manage your wedding invitation</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">

          {error && (
            <div className="p-3 mb-6 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full p-4 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                placeholder="username or email@example.com"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-4 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-400 hover:bg-rose-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-rose-200 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In 🕊️'}
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Don't have an account?{' '}
            <Link href="/signup" className="text-rose-400 font-semibold hover:text-rose-500 transition-colors underline underline-offset-4">
              Create Wedding Account
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}