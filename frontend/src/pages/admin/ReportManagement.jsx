
import { useEffect, useState } from "react";
import {
  MessageSquareWarning,
  Eye,
  RefreshCw,
  X,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    status: "pending",
    admin_note: "",
  });

  // সব রিপোর্ট নিয়ে আসা
  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/admin/reports/"
      );

      setReports(response.data.reports || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "রিপোর্টগুলো লোড করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // নির্দিষ্ট রিপোর্টের বিস্তারিত দেখা
  const handleViewDetails = async (reportId) => {
    try {
      setDetailsLoading(true);
      setError("");
      setMessage("");

      const response = await api.get(
        `/api/admin/reports/${reportId}`
      );

      setSelectedReport(response.data);

      setReviewForm({
        status: response.data.status || "pending",
        admin_note: response.data.admin_note || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "রিপোর্টের বিস্তারিত তথ্য পাওয়া যায়নি।"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // রিপোর্টের অবস্থা ও অ্যাডমিনের মন্তব্য সংরক্ষণ
  const handleSaveReview = async (e) => {
    e.preventDefault();

    if (!selectedReport) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.patch(
        `/api/admin/reports/${selectedReport.id}`,
        {
          status: reviewForm.status,
          admin_note: reviewForm.admin_note,
        }
      );

      setMessage("রিপোর্টের পর্যালোচনা সফলভাবে সংরক্ষণ হয়েছে।");

      await fetchReports();

      await handleViewDetails(selectedReport.id);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "রিপোর্ট আপডেট করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = reports.filter(
    (report) => report.status === "pending"
  ).length;

  const reviewedCount = reports.filter(
    (report) => report.status === "reviewed"
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "resolved"
  ).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "reviewed":
        return "bg-blue-100 text-blue-700";

      case "resolved":
        return "bg-green-100 text-green-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "reviewed":
        return "পর্যালোচনা করা হয়েছে";

      case "resolved":
        return "সমাধান করা হয়েছে";

      default:
        return "অপেক্ষমাণ";
    }
  };

  const getReportTypeLabel = (type) => {
    const types = {
      inaccurate: "ভুল তথ্য",
      outdated: "পুরোনো তথ্য",
      inappropriate: "অনুপযুক্ত উত্তর",
      other: "অন্যান্য",
    };

    return types[type] || type || "উল্লেখ নেই";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("bn-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        <AdminHeader title="ব্যবহারকারীর অভিযোগ" />

        <div className="p-6 md:p-8">

          {/* পেজের শিরোনাম */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ব্যবহারকারীর মতামত ও অভিযোগ
            </h2>

            <p className="text-gray-500 mt-2">
              AI সহকারীর দেওয়া ভুল বা পুরোনো তথ্য সম্পর্কে
              ব্যবহারকারীদের অভিযোগ দেখুন এবং পর্যালোচনা করুন।
            </p>
          </div>

          {/* সফলতা ও ত্রুটির বার্তা */}
          {message && (
            <div className="mb-5 p-4 rounded-lg bg-green-100 text-green-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-lg bg-red-100 text-red-700 flex justify-between gap-3">
              <span>{error}</span>

              <button onClick={() => setError("")}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* রিপোর্টের পরিসংখ্যান */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <MessageSquareWarning
                  className="text-blue-600"
                  size={28}
                />

                <div>
                  <p className="text-sm text-gray-500">
                    মোট অভিযোগ
                  </p>

                  <h3 className="text-2xl font-bold">
                    {reports.length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <Clock
                  className="text-orange-500"
                  size={28}
                />

                <div>
                  <p className="text-sm text-gray-500">
                    অপেক্ষমাণ
                  </p>

                  <h3 className="text-2xl font-bold">
                    {pendingCount}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle
                  className="text-blue-600"
                  size={28}
                />

                <div>
                  <p className="text-sm text-gray-500">
                    পর্যালোচনা করা হয়েছে
                  </p>

                  <h3 className="text-2xl font-bold">
                    {reviewedCount}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-green-600"
                  size={28}
                />

                <div>
                  <p className="text-sm text-gray-500">
                    সমাধান করা হয়েছে
                  </p>

                  <h3 className="text-2xl font-bold">
                    {resolvedCount}
                  </h3>
                </div>
              </div>
            </div>

          </div>

          {/* অভিযোগের তালিকা */}
          <div className="bg-white rounded-xl shadow-sm p-6">

            <div className="flex justify-between items-center gap-3 mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                জমা দেওয়া অভিযোগসমূহ
              </h3>

              <button
                onClick={fetchReports}
                className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900"
              >
                <RefreshCw size={17} />
                আবার দেখুন
              </button>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-8">
                অভিযোগগুলো লোড হচ্ছে...
              </p>
            ) : reports.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                এখনো কোনো অভিযোগ জমা পড়েনি।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">

                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3">অভিযোগ নম্বর</th>
                      <th className="p-3">ব্যবহারকারী আইডি</th>
                      <th className="p-3">অভিযোগের ধরন</th>
                      <th className="p-3">ব্যবহারকারীর প্রশ্ন</th>
                      <th className="p-3">জমা দেওয়ার তারিখ</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3">বিস্তারিত</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-3">
                          #{report.id}
                        </td>

                        <td className="p-3">
                          {report.user_id}
                        </td>

                        <td className="p-3">
                          {getReportTypeLabel(report.report_type)}
                        </td>

                        <td className="p-3 min-w-48 max-w-xs">
                          <p className="line-clamp-2">
                            {report.question}
                          </p>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {formatDate(report.created_at)}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(report.status)}`}
                          >
                            {getStatusLabel(report.status)}
                          </span>
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleViewDetails(report.id)
                            }
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={17} />
                            বিস্তারিত দেখুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* অভিযোগের বিস্তারিত দেখার উইন্ডো */}
      {(selectedReport || detailsLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">
                অভিযোগের বিস্তারিত
              </h3>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={22} />
              </button>
            </div>

            {detailsLoading || !selectedReport ? (
              <p className="text-center text-gray-500 py-8">
                তথ্য লোড হচ্ছে...
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6">

                  <div>
                    <p className="text-sm text-gray-500">
                      অভিযোগ নম্বর
                    </p>

                    <p className="font-semibold">
                      #{selectedReport.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      ব্যবহারকারী আইডি
                    </p>

                    <p className="font-semibold">
                      {selectedReport.user_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      অভিযোগের ধরন
                    </p>

                    <p className="font-semibold">
                      {getReportTypeLabel(selectedReport.report_type)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      ব্যবহারকারীর প্রশ্ন
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                      {selectedReport.question || "তথ্য পাওয়া যায়নি"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      AI সহকারীর উত্তর
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                      {selectedReport.ai_response || "তথ্য পাওয়া যায়নি"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      ব্যবহারকারীর অভিযোগের বিবরণ
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                      {selectedReport.description || "কোনো বিবরণ দেওয়া হয়নি"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      অভিযোগ জমা দেওয়ার সময়
                    </p>

                    <p className="font-medium">
                      {formatDate(selectedReport.created_at)}
                    </p>
                  </div>

                </div>

                {/* অ্যাডমিনের পর্যালোচনা ফর্ম */}
                <form
                  onSubmit={handleSaveReview}
                  className="border-t pt-5 space-y-4"
                >
                  <h4 className="font-bold text-gray-800">
                    অভিযোগ পর্যালোচনা
                  </h4>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      অভিযোগের বর্তমান অবস্থা
                    </label>

                    <select
                      value={reviewForm.status}
                      onChange={(e) =>
                        setReviewForm((previous) => ({
                          ...previous,
                          status: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg p-3"
                    >
                      <option value="pending">অপেক্ষমাণ</option>
                      <option value="reviewed">পর্যালোচনা করা হয়েছে</option>
                      <option value="resolved">সমাধান করা হয়েছে</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      অ্যাডমিনের মন্তব্য
                    </label>

                    <textarea
                      value={reviewForm.admin_note}
                      onChange={(e) =>
                        setReviewForm((previous) => ({
                          ...previous,
                          admin_note: e.target.value,
                        }))
                      }
                      rows={4}
                      maxLength={3000}
                      className="w-full border rounded-lg p-3"
                      placeholder="এখানে আপনার পর্যালোচনার মন্তব্য লিখুন..."
                    />

                    <p className="text-xs text-gray-500 mt-1">
                      সর্বোচ্চ ৩০০০ অক্ষর লেখা যাবে।
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      বন্ধ করুন
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Save size={17} />

                      {saving ? "সংরক্ষণ হচ্ছে..." : "পর্যালোচনা সংরক্ষণ করুন"}
                    </button>

                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ReportManagement;
