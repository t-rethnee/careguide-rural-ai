
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">

          <Link to="/" className="flex items-center gap-2">
            <HeartPulse size={28} className="text-teal-700" />

            <span className="text-xl font-bold text-slate-800">
              CareGuide
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-16 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
          <HeartPulse size={34} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-800">
          CareGuide Rural AI
        </h1>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          আপনার স্বাস্থ্যবিষয়ক সাধারণ প্রশ্নের উত্তর
          সহজ বাংলায় পেতে CareGuide ব্যবহার করুন।
        </p>

        {user ? (
          <div className="mt-8">
            <p className="mb-5 text-slate-700">
              স্বাগতম, <span className="font-semibold">{user.full_name}</span>!
            </p>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
            >
              <LayoutDashboard size={18} />
              Dashboard-এ যান
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link
              to="/login"
              className="rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
            >
              লগইন
            </Link>

            <Link
              to="/register"
              className="rounded-lg border border-teal-700 px-6 py-3 font-semibold text-teal-700 hover:bg-teal-50"
            >
              নিবন্ধন
            </Link>

          </div>
        )}

      </main>

    </div>
  )
}

export default Home
