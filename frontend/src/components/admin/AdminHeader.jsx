
import { useAuth } from "../../context/AuthContext";

const AdminHeader = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-5 md:px-8 py-5 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          {title || "অ্যাডমিন ড্যাশবোর্ড"}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          কেয়ারগাইড গ্রামীণ স্বাস্থ্যসেবা সহকারী
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
          {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            {user?.full_name || "অ্যাডমিন"}
          </p>

          <p className="text-xs text-gray-500">
            প্রশাসক
          </p>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
