
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquareWarning,
  Home,
  LogOut,
  HeartPulse,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      name: "ড্যাশবোর্ড",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "স্বাস্থ্য তথ্য ব্যবস্থাপনা",
      path: "/admin/knowledge",
      icon: FileText,
    },
    {
      name: "ব্যবহারকারীর অভিযোগ",
      path: "/admin/reports",
      icon: MessageSquareWarning,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <HeartPulse size={30} className="text-emerald-400" />

          <div>
            <h2 className="text-xl font-bold">CareGuide</h2>
            <p className="text-sm text-slate-400 mt-1">
              প্রশাসন বিভাগ
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-sm font-medium">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition"
        >
          <Home size={20} />
          <span className="text-sm">ব্যবহারকারী ড্যাশবোর্ড</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="text-sm">লগ আউট</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
