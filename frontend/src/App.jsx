
import { useState } from 'react'
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import {
  HeartPulse,
  Activity,
  ShieldCheck,
  ArrowRight,
  Heart,
  Stethoscope,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'

import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HealthcareAssistant from './pages/HealthcareAssistant'


// Reusable Navbar
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
            <HeartPulse size={25} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Care<span className="text-red-600">Guide</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 transition hover:text-red-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}


// Home Page
function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="overflow-hidden bg-gradient-to-br from-red-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 lg:px-8 lg:py-28">

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-xs font-bold tracking-wider text-red-700">
              <HeartPulse size={16} />
              RURAL HEALTHCARE ASSISTANT
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Healthcare guidance,
              <span className="block text-red-600">
                made easier.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-gray-600 sm:text-lg">
              Access healthcare information, discover nearby
              hospitals and understand medical reports through
              a simple and accessible platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700"
                  >
                    Create Account
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/login"
                    className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:border-red-300 hover:text-red-600"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-600" />
                Accessible Healthcare
              </span>
              <span className="flex items-center gap-2">
                <Heart size={18} className="text-red-500" />
                Your Health Matters
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-red-100 blur-3xl" />

            <div className="relative mx-auto max-w-md rounded-3xl border border-red-100 bg-white p-8 shadow-2xl shadow-red-100/70 sm:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Stethoscope size={35} />
              </div>

              <h2 className="mt-7 text-2xl font-bold text-gray-900">
                Your Health Matters
              </h2>

              <p className="mt-3 leading-7 text-gray-500">
                Get healthcare guidance and discover useful
                health services with CareGuide Rural AI.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
                  <Activity className="text-red-600" size={23} />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Healthcare Information
                    </p>
                    <p className="text-xs text-gray-500">
                      Easy-to-understand guidance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
                  <HeartPulse className="text-red-600" size={23} />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Hospital Finder
                    </p>
                    <p className="text-xs text-gray-500">
                      Find healthcare services
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-8 border-t border-gray-100 pt-5 text-center text-sm font-semibold text-red-600">
                CareGuide Rural AI
              </p>
            </div>
          </div>

        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-500">
        © 2026 CareGuide Rural AI. All rights reserved.
      </footer>
    </div>
  )
}


// Login Page
function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.detail

      setError(
        typeof message === 'string'
          ? message
          : 'Login failed. Please check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">
            <HeartPulse size={26} />
          </div>
          <span className="text-2xl font-extrabold text-gray-900">
            Care<span className="text-red-600">Guide</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-red-100/50 sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <HeartPulse size={34} />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
              Welcome Back!
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Login to your CareGuide account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login to Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-red-600 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-gray-500 hover:text-red-600"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}


// Register Page
function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await register({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      })

      navigate('/login', {
        state: { registered: true },
      })
    } catch (err) {
      const message = err.response?.data?.detail

      setError(
        typeof message === 'string'
          ? message
          : 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">
            <HeartPulse size={26} />
          </div>
          <span className="text-2xl font-extrabold text-gray-900">
            Care<span className="text-red-600">Guide</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-red-100/50 sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <HeartPulse size={34} />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
              Create Your Account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Join CareGuide Rural AI today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                minLength={2}
                maxLength={100}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Enter password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-red-600 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-gray-500 hover:text-red-600"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}


// Dashboard Page
function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <HeartPulse size={35} />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
          Welcome to CareGuide!
        </h1>

        <p className="mt-2 text-gray-500">
          You are successfully logged in.
        </p>

        <div className="mt-7 rounded-xl bg-gray-50 p-5 text-left">
          <p className="mb-3 text-sm text-gray-600">
            <strong>Name:</strong> {user?.full_name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {user?.email}
          </p>
        </div>

        <Link
          to="/assistant"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700"
        >
          <Stethoscope size={18} />
          Open Healthcare Assistant
          <ArrowRight size={18} />
        </Link>

        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}


// Main App
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <HealthcareAssistant />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
