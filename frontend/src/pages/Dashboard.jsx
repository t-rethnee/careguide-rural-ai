
import { Link } from 'react-router-dom'
import { Stethoscope, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-10">

        {/* Welcome Section */}
        <section>
          <p className="text-sm font-semibold text-teal-700">
            CareGuide Rural AI
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            স্বাগতম, {user?.full_name || 'ব্যবহারকারী'}!
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            আপনার স্বাস্থ্যবিষয়ক সাধারণ প্রশ্নের উত্তর পেতে
            স্বাস্থ্য সহকারী ব্যবহার করুন।
          </p>
        </section>

        {/* Healthcare Assistant */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <Stethoscope size={26} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            স্বাস্থ্য সহকারী
          </h2>

          <p className="mt-2 leading-7 text-slate-600">
            জ্বর, সর্দি, কাশি বা অন্যান্য সাধারণ স্বাস্থ্যবিষয়ক
            প্রশ্ন সহজ বাংলায় লিখুন এবং উত্তর জানুন।
          </p>

          <Link
            to="/assistant"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 sm:w-auto"
          >
            স্বাস্থ্য সহকারীর সাথে কথা বলুন
            <ArrowRight size={19} />
          </Link>

        </section>

        {/* Account Information */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-bold text-slate-800">
            অ্যাকাউন্টের তথ্য
          </h2>

          <div className="mt-4 space-y-4">

            <div>
              <p className="text-sm text-slate-500">
                আপনার নাম
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {user?.full_name || 'তথ্য পাওয়া যায়নি'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                ইমেইল ঠিকানা
              </p>

              <p className="mt-1 break-all font-medium text-slate-800">
                {user?.email || 'তথ্য পাওয়া যায়নি'}
              </p>
            </div>

          </div>

        </section>

        <footer className="mt-8 text-center text-sm text-slate-500">
          CareGuide Rural AI
        </footer>

      </main>

    </div>
  )
}

export default Dashboard
