
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'লগইন করা সম্ভব হয়নি। আবার চেষ্টা করুন।'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

        <Link to="/" className="flex items-center gap-2">
          <HeartPulse className="text-teal-700" size={28} />

          <span className="text-xl font-bold text-slate-800">
            CareGuide
          </span>
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-slate-800">
          লগইন করুন
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          আপনার অ্যাকাউন্টে প্রবেশ করুন।
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ইমেইল ঠিকানা
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="আপনার ইমেইল লিখুন"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              পাসওয়ার্ড
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="আপনার পাসওয়ার্ড লিখুন"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          অ্যাকাউন্ট নেই?{' '}
          <Link
            to="/register"
            className="font-semibold text-teal-700"
          >
            নিবন্ধন করুন
          </Link>
        </p>

      </div>

    </div>
  )
}

export default Login
