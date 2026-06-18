'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUpAction } from '../actions/auth'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await signUpAction({
        email: formData.email,
        password: formData.password,
        username: formData.username
      })

      if (res.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(res.error || 'Sign up failed')
      }
    } catch (err) {
      setError('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100 via-white to-white p-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💍</div>
          <h1 className="text-3xl font-serif font-medium text-gray-800">WedInvite</h1>
          <p className="text-sm text-gray-400 mt-2">Create your wedding invitation account</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">

          {error && (
            <div className="mb-5 p-3 bg-red-50 text-red-500 text-xs text-center rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Username */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">
                Username
              </label>
              <input
                required
                type="text"
                placeholder="e.g. nuwan_sanduni"
                className="w-full p-4 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">
                This will be used to login
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                className="w-full p-4 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="Min. 6 characters"
                className="w-full p-4 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5 ml-1">
                Confirm Password
              </label>
              <input
                required
                type="password"
                placeholder="Re-enter password"
                className="w-full p-4 bg-white border border-rose-100 rounded-2xl text-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all"
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-400 hover:bg-rose-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-rose-200 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account 💍'}
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-rose-400 font-semibold hover:text-rose-500 transition-colors underline underline-offset-4">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}