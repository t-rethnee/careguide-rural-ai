
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Trash2,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";

import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

const KnowledgeManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    source_title: "",
    source_url: "",
    publisher: "",
    language: "English",
    document_type: "",
    file: null,
  });

  const [editingDocument, setEditingDocument] = useState(null);
  const [replacingId, setReplacingId] = useState(null);

  const replaceInputRef = useRef(null);

  // Load all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/admin/knowledge-base/"
      );

      setDocuments(response.data.documents || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "স্বাস্থ্যবিষয়ক নথি লোড করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));
  };

  // Upload PDF
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!form.file) {
      setError("অনুগ্রহ করে একটি PDF ফাইল নির্বাচন করুন।");
      return;
    }

    if (!form.file.name.toLowerCase().endsWith(".pdf")) {
      setError("শুধুমাত্র PDF ফাইল আপলোড করা যাবে।");
      return;
    }

    if (form.file.size > 10 * 1024 * 1024) {
      setError("ফাইলের আকার সর্বোচ্চ ১০ MB হতে পারবে।");
      return;
    }

    const formData = new FormData();

    formData.append("file", form.file);
    formData.append("source_title", form.source_title);
    formData.append("source_url", form.source_url);
    formData.append("publisher", form.publisher);
    formData.append("language", form.language);
    formData.append("document_type", form.document_type);

    try {
      setUploading(true);
      setError("");
      setMessage("");

      await api.post(
        "/api/admin/knowledge-base/upload",
        formData
      );

      setMessage(
        "নথিটি সফলভাবে আপলোড হয়েছে। অনুমোদনের অপেক্ষায় রয়েছে।"
      );

      setForm({
        source_title: "",
        source_url: "",
        publisher: "",
        language: "English",
        document_type: "",
        file: null,
      });

      e.target.reset();

      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "নথি আপলোড করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setUploading(false);
    }
  };

  // Approve document
  const handleApprove = async (id) => {
    if (!window.confirm("আপনি কি এই নথিটি অনুমোদন করতে চান?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.patch(
        `/api/admin/knowledge-base/${id}/approve`
      );

      setMessage("নথিটি সফলভাবে অনুমোদিত হয়েছে।");
      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "নথিটি অনুমোদন করা যায়নি।"
      );
    }
  };

  // Delete document
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "আপনি কি এই নথিটি এবং এর সংরক্ষিত তথ্য মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।"
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/api/admin/knowledge-base/${id}`
      );

      setMessage("নথিটি সফলভাবে মুছে ফেলা হয়েছে।");
      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "নথিটি মুছে ফেলা যায়নি।"
      );
    }
  };

  // Update metadata
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const {
        source_title,
        source_url,
        publisher,
        language,
        document_type,
      } = editingDocument;

      await api.patch(
        `/api/admin/knowledge-base/${editingDocument.source_id}`,
        {
          source_title,
          source_url: source_url || null,
          publisher: publisher || null,
          language,
          document_type: document_type || null,
        }
      );

      setMessage("নথির তথ্য সফলভাবে আপডেট হয়েছে।");
      setEditingDocument(null);

      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "নথির তথ্য আপডেট করা যায়নি।"
      );
    }
  };

  // Replace PDF
  const handleReplace = async (e) => {
    const file = e.target.files?.[0];

    if (!file || replacingId === null) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("শুধুমাত্র PDF ফাইল নির্বাচন করুন।");
      e.target.value = "";
      setReplacingId(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("ফাইলের আকার সর্বোচ্চ ১০ MB হতে পারবে।");
      e.target.value = "";
      setReplacingId(null);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError("");
      setMessage("");

      await api.put(
        `/api/admin/knowledge-base/${replacingId}/replace`,
        formData
      );

      setMessage(
        "নতুন PDF আপলোড হয়েছে। নথিটি আবার অনুমোদনের অপেক্ষায় রয়েছে।"
      );

      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "PDF পরিবর্তন করা যায়নি।"
      );
    } finally {
      setReplacingId(null);
      e.target.value = "";
    }
  };

  const pendingCount = documents.filter(
    (doc) => doc.status === "pending"
  ).length;

  const approvedCount = documents.filter(
    (doc) => doc.status === "approved"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        <AdminHeader title="স্বাস্থ্য তথ্য ব্যবস্থাপনা" />

        <div className="p-5 md:p-8">

          {/* Page Introduction */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-800">
              স্বাস্থ্যবিষয়ক নথি
            </h2>

            <p className="text-gray-600 mt-2 leading-6">
              AI Assistant-এর জন্য নির্ভরযোগ্য স্বাস্থ্য তথ্যের
              নথি এখানে আপলোড ও পরিচালনা করুন।
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex justify-between gap-3">
              <span>{message}</span>

              <button
                onClick={() => setMessage("")}
                aria-label="বার্তা বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex justify-between gap-3">
              <span>{error}</span>

              <button
                onClick={() => setError("")}
                aria-label="ত্রুটির বার্তা বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <FileText className="text-blue-600" size={27} />
                </div>

                <div>
                  <p className="text-gray-600 text-sm">
                    মোট নথি
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800">
                    {documents.length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-50">
                  <Clock className="text-orange-500" size={27} />
                </div>

                <div>
                  <p className="text-gray-600 text-sm">
                    অনুমোদনের অপেক্ষায়
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800">
                    {pendingCount}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="text-green-600" size={27} />
                </div>

                <div>
                  <p className="text-gray-600 text-sm">
                    অনুমোদিত নথি
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800">
                    {approvedCount}
                  </h3>
                </div>
              </div>
            </div>

          </div>

          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-7 mb-8">

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                নতুন স্বাস্থ্যবিষয়ক নথি যোগ করুন
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                নথির তথ্য পূরণ করে PDF ফাইলটি আপলোড করুন।
              </p>
            </div>

            <form onSubmit={handleUpload}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    নথির নাম *
                  </label>

                  <input
                    type="text"
                    name="source_title"
                    value={form.source_title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="নথির নাম লিখুন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    প্রকাশকারী প্রতিষ্ঠান
                  </label>

                  <input
                    type="text"
                    name="publisher"
                    value={form.publisher}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="যেমন: WHO, DGHS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    তথ্যের মূল উৎসের লিংক
                  </label>

                  <input
                    type="url"
                    name="source_url"
                    value={form.source_url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    নথির ভাষা *
                  </label>

                  <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="English">ইংরেজি</option>
                    <option value="Bangla">বাংলা</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    নথির ধরন
                  </label>

                  <input
                    type="text"
                    name="document_type"
                    value={form.document_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="যেমন: নির্দেশিকা, গবেষণা, প্রতিবেদন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PDF ফাইল নির্বাচন করুন *
                  </label>

                  <input
                    type="file"
                    name="file"
                    accept=".pdf,application/pdf"
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    শুধুমাত্র PDF ফাইল, সর্বোচ্চ ১০ MB।
                  </p>
                </div>

              </div>

              <button
                type="submit"
                disabled={uploading}
                className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Upload size={19} />

                {uploading ? "আপলোড হচ্ছে..." : "নথি আপলোড করুন"}
              </button>
            </form>
          </div>

          {/* Document List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-7">

            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  আপলোড করা নথি
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  সব নথির তালিকা ও অনুমোদনের অবস্থা দেখুন।
                </p>
              </div>

              <button
                onClick={fetchDocuments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                <RefreshCw size={17} />
                আবার দেখুন
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500 py-10 text-center">
                নথির তালিকা লোড হচ্ছে...
              </p>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText
                  size={42}
                  className="mx-auto text-gray-300 mb-3"
                />

                <p className="text-gray-600 font-medium">
                  এখনো কোনো নথি আপলোড করা হয়নি।
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  নতুন নথি যোগ করতে উপরের ফর্ম ব্যবহার করুন।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">

                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3 whitespace-nowrap">নথির নাম</th>
                      <th className="p-3 whitespace-nowrap">প্রকাশকারী</th>
                      <th className="p-3 whitespace-nowrap">ভাষা</th>
                      <th className="p-3 whitespace-nowrap">অংশসংখ্যা</th>
                      <th className="p-3 whitespace-nowrap">অবস্থা</th>
                      <th className="p-3 whitespace-nowrap">কাজ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((doc) => (
                      <tr
                        key={doc.source_id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-3 min-w-48">
                          <p className="font-semibold text-gray-800">
                            {doc.source_title}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {doc.original_filename}
                          </p>
                        </td>

                        <td className="p-3">
                          {doc.publisher || "—"}
                        </td>

                        <td className="p-3">
                          {doc.language === "Bangla"
                            ? "বাংলা"
                            : doc.language === "English"
                            ? "ইংরেজি"
                            : doc.language || "—"}
                        </td>

                        <td className="p-3">
                          {doc.total_chunks ?? 0}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              doc.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {doc.status === "approved"
                              ? "অনুমোদিত"
                              : doc.status === "pending"
                              ? "অনুমোদনের অপেক্ষায়"
                              : doc.status}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-3">

                            {doc.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleApprove(doc.source_id)
                                }
                                title="নথি অনুমোদন করুন"
                                aria-label="নথি অনুমোদন করুন"
                                className="text-green-600 hover:text-green-800"
                              >
                                <CheckCircle size={19} />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setEditingDocument({ ...doc })
                              }
                              title="নথির তথ্য পরিবর্তন করুন"
                              aria-label="নথির তথ্য পরিবর্তন করুন"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={19} />
                            </button>

                            <button
                              onClick={() => {
                                setReplacingId(doc.source_id);

                                if (replaceInputRef.current) {
                                  replaceInputRef.current.value = "";
                                  replaceInputRef.current.click();
                                }
                              }}
                              title="PDF পরিবর্তন করুন"
                              aria-label="PDF পরিবর্তন করুন"
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <RefreshCw size={19} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(doc.source_id)
                              }
                              title="নথি মুছে ফেলুন"
                              aria-label="নথি মুছে ফেলুন"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={19} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

            <input
              ref={replaceInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleReplace}
            />

          </div>
        </div>
      </main>

      {/* Edit Metadata Modal */}
      {editingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">
                নথির তথ্য পরিবর্তন করুন
              </h3>

              <button
                onClick={() => setEditingDocument(null)}
                className="text-gray-500 hover:text-gray-800"
                aria-label="বন্ধ করুন"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">

              {[
                ["source_title", "নথির নাম"],
                ["source_url", "তথ্যের মূল উৎসের লিংক"],
                ["publisher", "প্রকাশকারী প্রতিষ্ঠান"],
                ["language", "নথির ভাষা"],
                ["document_type", "নথির ধরন"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                  </label>

                  <input
                    type="text"
                    value={
                      name === "language"
                        ? editingDocument[name] === "Bangla"
                          ? "বাংলা"
                          : editingDocument[name] === "English"
                          ? "ইংরেজি"
                          : editingDocument[name] || ""
                        : editingDocument[name] || ""
                    }
                    onChange={(e) =>
                      setEditingDocument((previous) => ({
                        ...previous,
                        [name]:
                          name === "language"
                            ? e.target.value === "বাংলা"
                              ? "Bangla"
                              : e.target.value === "ইংরেজি"
                              ? "English"
                              : e.target.value
                            : e.target.value,
                      }))
                    }
                    required={
                      name === "source_title" ||
                      name === "language"
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}

              <div className="flex flex-wrap justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setEditingDocument(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default KnowledgeManagement;
