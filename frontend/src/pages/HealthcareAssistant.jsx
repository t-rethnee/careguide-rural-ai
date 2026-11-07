
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Stethoscope,
  Bot,
  User,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function HealthcareAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Send question to backend
  const handleSend = async (e) => {
    e.preventDefault();

    const userQuestion = question.trim();

    if (!userQuestion || loading) return;

    setError("");
    setQuestion("");

    // Display user's message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userQuestion,
        sender: "user",
      },
    ]);

    setLoading(true);

    try {
      // Call authenticated backend API
      const response = await api.post(
        "/api/assistant/chat",
        {
          question: userQuestion,
        }
      );

      // Display Gemini response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: response.data.answer,
          sender: "assistant",
        },
      ]);
    } catch (err) {
      console.error("Assistant API Error:", err);

      const status = err.response?.status;

      if (status === 401) {
        setError(
          "আপনার লগইন সেশন শেষ হয়েছে। অনুগ্রহ করে আবার Login করুন।"
        );
      } else if (status === 422) {
        setError(
          "আপনার প্রশ্নটি সঠিকভাবে লিখুন।"
        );
      } else if (status === 502) {
        setError(
          "এই মুহূর্তে AI Assistant উত্তর দিতে পারছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।"
        );
      } else {
        setError(
          "সার্ভারের সঙ্গে যোগাযোগ করা যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">

          <div className="bg-teal-100 p-3 rounded-xl">
            <Stethoscope
              className="text-teal-700"
              size={25}
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              CareGuide Healthcare Assistant
            </h1>

            <p className="text-sm text-slate-500">
              আপনার স্বাস্থ্যবিষয়ক প্রশ্ন করুন
            </p>
          </div>

        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-5">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[65vh] flex flex-col">

          <div className="flex-1 p-5 sm:p-8 space-y-6">

            {/* Welcome Message */}
            <div className="flex items-start gap-3">

              <div className="bg-teal-100 p-2 rounded-full shrink-0">
                <Bot
                  className="text-teal-700"
                  size={22}
                />
              </div>

              <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 max-w-[85%]">

                <p className="font-semibold text-slate-800 mb-2">
                  স্বাগতম CareGuide-এ!
                </p>

                <p className="text-slate-700 leading-relaxed">
                  আমি আপনার স্বাস্থ্যবিষয়ক সাধারণ প্রশ্নের উত্তর
                  দিতে সাহায্য করতে পারি। আপনার প্রশ্নটি লিখে পাঠান।
                </p>

              </div>
            </div>

            {/* Chat Messages */}
            {messages.map((message) => (

              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {message.sender === "assistant" && (
                  <div className="bg-teal-100 p-2 rounded-full shrink-0">
                    <Bot
                      className="text-teal-700"
                      size={22}
                    />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                    message.sender === "user"
                      ? "bg-teal-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-700 rounded-tl-none"
                  }`}
                >
                  {message.text}
                </div>

                {message.sender === "user" && (
                  <div className="bg-slate-200 p-2 rounded-full shrink-0">
                    <User
                      className="text-slate-600"
                      size={20}
                    />
                  </div>
                )}

              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-3">

                <div className="bg-teal-100 p-2 rounded-full">
                  <Bot
                    className="text-teal-700"
                    size={22}
                  />
                </div>

                <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-slate-500">

                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  <span className="text-sm">
                    CareGuide উত্তর তৈরি করছে...
                  </span>

                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                <AlertCircle
                  size={19}
                  className="shrink-0 mt-0.5"
                />

                <p>{error}</p>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Message Input */}
          <div className="border-t border-slate-200 p-4 sm:p-5">

            <form
              onSubmit={handleSend}
              className="flex items-center gap-3"
            >

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="আপনার স্বাস্থ্যবিষয়ক প্রশ্ন লিখুন..."
                disabled={loading}
                className="flex-1 min-w-0 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100"
              />

              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition"
                aria-label="Send message"
              >
                <Send size={21} />
              </button>

            </form>

            <p className="text-xs text-slate-400 text-center mt-3">
              CareGuide provides general healthcare information.
            </p>

          </div>

        </div>

      </main>
    </div>
  );
}

export default HealthcareAssistant;
