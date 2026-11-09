import { Link, useNavigate } from 'react-router-dom'
import {
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Mic,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f5faf8]">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100">
              <HeartPulse size={28} className="text-teal-700" />
            </div>

            <span className="text-2xl font-bold text-slate-800">
              CareGuide
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
              >
                <LayoutDashboard size={19} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <LogOut size={19} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">

        <section className="grid items-center gap-10 md:grid-cols-2">

          {/* Left Content */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-800">
              <HeartPulse size={17} />
              সবার জন্য স্বাস্থ্য সহায়তা
            </div>

            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
              আপনার স্বাস্থ্যবিষয়ক
              <span className="mt-2 block text-teal-700">
                প্রশ্নের সহজ সমাধান
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              স্বাস্থ্য সম্পর্কে জানতে বা বুঝতে এখন আর দ্বিধা নয়।
              CareGuide-এর মাধ্যমে বাংলায় আপনার স্বাস্থ্যবিষয়ক
              সাধারণ প্রশ্ন করতে পারবেন সহজেই।
            </p>

            {user ? (
              <div className="mt-8">

                <p className="mb-5 text-lg text-slate-700">
                  স্বাগতম,{' '}
                  <span className="font-bold text-teal-800">
                    {user.full_name}
                  </span>
                </p>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-3 rounded-xl bg-teal-700 px-7 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-teal-800"
                >
                  Dashboard-এ যান
                  <ArrowRight size={21} />
                </Link>

              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-8 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-teal-800"
                >
                  শুরু করুন
                  <ArrowRight size={21} />
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-teal-700 bg-white px-8 py-4 text-lg font-bold text-teal-700 transition hover:bg-teal-50"
                >
                  নতুন অ্যাকাউন্ট তৈরি করুন
                </Link>

              </div>
            )}

          </div>

          {/* Right Content */}
          <div className="flex justify-center">

            <div className="w-full max-w-md rounded-3xl border border-teal-100 bg-white p-7 shadow-sm sm:p-10">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-100">
                <HeartPulse size={58} className="text-teal-700" />
              </div>

              <h2 className="mt-7 text-center text-2xl font-bold text-slate-800">
                CareGuide Rural AI
              </h2>

              <p className="mt-3 text-center leading-7 text-slate-600">
                আপনার স্বাস্থ্যবিষয়ক সাধারণ তথ্য ও সহায়তা
                এখন সহজ বাংলায়।
              </p>

              <div className="mt-7 space-y-4">

                <div className="flex items-center gap-4 rounded-xl bg-teal-50 p-4">
                  <MessageCircle className="shrink-0 text-teal-700" size={27} />
                  <p className="font-semibold text-slate-700">
                    বাংলায় লিখে প্রশ্ন করুন
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-teal-50 p-4">
                  <Mic className="shrink-0 text-teal-700" size={27} />
                  <p className="font-semibold text-slate-700">
                    কথা বলেও প্রশ্ন করতে পারবেন
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-teal-50 p-4">
                  <ShieldCheck className="shrink-0 text-teal-700" size={27} />
                  <p className="font-semibold text-slate-700">
                    স্বাস্থ্যবিষয়ক তথ্য ও সচেতনতা
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Information Section */}
        <section className="mt-16 rounded-2xl border border-teal-100 bg-white p-6 sm:p-8">

          <h2 className="text-center text-2xl font-bold text-slate-800">
            স্বাস্থ্য বিষয়ে সচেতন থাকুন
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-center leading-7 text-slate-600">
            CareGuide আপনাকে স্বাস্থ্যবিষয়ক সাধারণ তথ্য বুঝতে
            সাহায্য করে। তবে জরুরি অবস্থা বা চিকিৎসার প্রয়োজনে
            অবশ্যই চিকিৎসকের পরামর্শ নিন।
          </p>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="px-5 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CareGuide Rural AI.
          স্বাস্থ্য সচেতনতায় আপনার পাশে।
        </p>
      </footer>

    </div>
  )
}

export default Home