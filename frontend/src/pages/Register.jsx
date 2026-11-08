
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (password.length < 8) {
      setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।')
      return
    }

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড এবং Confirm Password মিলছে না।')
      return
    }

    setLoading(true)

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      })

     navigate('/login', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(', '))
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('নিবন্ধন করা সম্ভব হয়নি। আবার চেষ্টা করুন।')
      }
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
          নতুন অ্যাকাউন্ট তৈরি করুন
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          CareGuide ব্যবহার করতে নিবন্ধন করুন।
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              আপনার নাম
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              placeholder="আপনার নাম লিখুন"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

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
              minLength={8}
              placeholder="কমপক্ষে ৮ অক্ষর"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="পাসওয়ার্ড আবার লিখুন"
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
            {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'নিবন্ধন করুন'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <Link
            to="/login"
            className="font-semibold text-teal-700"
          >
            লগইন করুন
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register
