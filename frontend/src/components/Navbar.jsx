
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">

        <Link to="/dashboard" className="flex items-center gap-2">
          <HeartPulse size={27} className="text-teal-700" />

          <span className="text-xl font-bold text-slate-800">
            CareGuide
          </span>
        </Link>

        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={17} />
            লগআউট
          </button>
        )}

      </div>
    </header>
  )
}

export default Navbar
