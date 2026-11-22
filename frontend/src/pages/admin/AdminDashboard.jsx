
import { Link } from "react-router-dom";
import {
  FileText,
  MessageSquareWarning,
  Upload,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

const AdminDashboard = () => {
  const sections = [
    {
      title: "স্বাস্থ্য তথ্য ব্যবস্থাপনা",
      description:
        "AI Assistant-এর জন্য স্বাস্থ্যবিষয়ক নথি আপলোড, যাচাই, অনুমোদন ও পরিচালনা করুন।",
      icon: FileText,
      path: "/admin/knowledge",
      action: "নথি পরিচালনা করুন",
    },
    {
      title: "ব্যবহারকারীর অভিযোগ",
      description:
        "AI-এর দেওয়া ভুল বা পুরোনো স্বাস্থ্য তথ্য সম্পর্কে ব্যবহারকারীদের অভিযোগ পর্যালোচনা করুন।",
      icon: MessageSquareWarning,
      path: "/admin/reports",
      action: "অভিযোগ পর্যালোচনা করুন",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        <AdminHeader title="অ্যাডমিন ড্যাশবোর্ড" />

        <div className="p-5 md:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              স্বাগতম, অ্যাডমিন!
            </h2>

            <p className="text-gray-600 mt-2">
              এখান থেকে স্বাস্থ্য তথ্য এবং ব্যবহারকারীদের
              অভিযোগ পরিচালনা করতে পারবেন।
            </p>
          </div>

          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-emerald-100 text-emerald-700">
                  <Upload size={25} />
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                  স্বাস্থ্য তথ্য
                </h3>
              </div>

              <p className="text-gray-600 text-sm leading-6">
                AI Assistant-কে নির্ভরযোগ্য স্বাস্থ্য তথ্য
                দিতে প্রয়োজনীয় নথি পরিচালনা করুন।
              </p>

              <Link
                to="/admin/knowledge"
                className="inline-flex items-center gap-2 mt-5 text-emerald-700 font-semibold hover:text-emerald-900"
              >
                নথি পরিচালনা করুন
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-orange-100 text-orange-700">
                  <ClipboardList size={25} />
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                  ব্যবহারকারীর অভিযোগ
                </h3>
              </div>

              <p className="text-gray-600 text-sm leading-6">
                ব্যবহারকারীদের জমা দেওয়া অভিযোগ দেখুন এবং
                প্রয়োজনীয় ব্যবস্থা নিন।
              </p>

              <Link
                to="/admin/reports"
                className="inline-flex items-center gap-2 mt-5 text-orange-700 font-semibold hover:text-orange-900"
              >
                অভিযোগ দেখুন
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          {/* Administration Sections */}
          <h3 className="text-xl font-bold text-gray-800 mb-5">
            পরিচালনা বিভাগ
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <div
                  key={section.path}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Icon size={24} />
                    </div>

                    <h4 className="font-semibold text-gray-800">
                      {section.title}
                    </h4>
                  </div>

                  <p className="text-sm text-gray-600 leading-6 mb-5">
                    {section.description}
                  </p>

                  <Link
                    to={section.path}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    {section.action}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
