
import { useState, useRef, useEffect } from "react";

import {
  Send,
  Stethoscope,
  Bot,
  User,
  LoaderCircle,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function HealthcareAssistant() {
  const { user } = useAuth();

  // Separate chat history for each logged-in user
  const storageKey = `careguide_chat_history_${user?.id ?? user?.email ?? "guest"}`;

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  const [loadedForKey, setLoadedForKey] = useState(null);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);


  // =====================================
  // Load Chat History from LocalStorage
  // =====================================

  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(storageKey);

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);

        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Chat History Load Error:", error);
      setMessages([]);
    }

    setLoadedForKey(storageKey);
  }, [storageKey]);


  // =====================================
  // Save Chat History to LocalStorage
  // =====================================

  useEffect(() => {
    // Wait until history for this user is loaded
    if (loadedForKey !== storageKey) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error("Chat History Save Error:", error);
    }
  }, [messages, storageKey, loadedForKey]);


  // =====================================
  // Automatically Scroll to Latest Message
  // =====================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, transcribing]);


  // =====================================
  // Cleanup Microphone and Audio Resources
  // =====================================

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);


  // =====================================
  // Display API Errors
  // =====================================

  const handleApiError = (err) => {
    console.error("Healthcare Assistant Error:", err);

    const status = err.response?.status;

    if (status === 401) {
      setError(
        "আপনার লগইন সেশন শেষ হয়েছে। অনুগ্রহ করে আবার Login করুন।"
      );
    } else if (status === 422) {
      setError("আপনার প্রশ্ন বা অডিও সঠিকভাবে পাঠানো হয়নি।");
    } else if (status === 502) {
      setError(
        "AI Assistant এই মুহূর্তে উত্তর দিতে পারছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।"
      );
    } else {
      setError(
        "সার্ভারের সঙ্গে যোগাযোগ করা যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
    }
  };


  // =====================================
  // Reusable Chat Function
  // Text and Voice Questions
  // =====================================

  const sendQuestion = async (userQuestion) => {
    const trimmedQuestion = userQuestion.trim();

    if (!trimmedQuestion || loading) return;

    setError("");
    setQuestion("");

    const userMessageId = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        text: trimmedQuestion,
        sender: "user",
      },
    ]);

    setLoading(true);

    try {
      const response = await api.post(
        "/api/assistant/chat",
        {
          question: trimmedQuestion,
        }
      );

      const assistantMessageId = Date.now() + 1;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          text: response.data.answer,
          sender: "assistant",
        },
      ]);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };


  // =====================================
  // Handle Normal Text Chat
  // =====================================

  const handleSend = async (e) => {
    e.preventDefault();

    if (loading || recording || transcribing) return;

    await sendQuestion(question);
  };


  // =====================================
  // Start Voice Recording
  // =====================================

  const startRecording = async () => {
    if (loading || transcribing || recording) return;

    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "আপনার browser microphone recording support করে না।"
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const mimeType = supportedTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: recorder.mimeType || "audio/webm",
          }
        );

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        mediaRecorderRef.current = null;
        setRecording(false);

        if (!audioBlob.size) {
          setError("কোনো অডিও রেকর্ড করা যায়নি। আবার চেষ্টা করুন।");
          return;
        }

        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;

      recorder.start();

      setRecording(true);
    } catch (err) {
      console.error("Microphone Error:", err);

      setRecording(false);

      if (err.name === "NotAllowedError") {
        setError(
          "Microphone permission দেওয়া হয়নি। Browser settings থেকে microphone permission দিন।"
        );
      } else if (err.name === "NotFoundError") {
        setError("কোনো microphone পাওয়া যায়নি।");
      } else {
        setError(
          err.message || "Microphone চালু করা যায়নি।"
        );
      }
    }
  };


  // =====================================
  // Stop Recording
  // =====================================

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };


  // =====================================
  // Send Recorded Audio to Gemini STT
  // =====================================

  const transcribeAudio = async (audioBlob) => {
    setError("");
    setTranscribing(true);

    try {
      const extension = audioBlob.type.includes("mp4")
        ? "mp4"
        : "webm";

      const formData = new FormData();

      formData.append(
        "audio",
        audioBlob,
        `recording.${extension}`
      );

      const response = await api.post(
        "/api/assistant/transcribe",
        formData
      );

      const transcript = response.data.transcript?.trim();

      if (!transcript) {
        throw new Error("কথা থেকে কোনো text পাওয়া যায়নি।");
      }

      setQuestion(transcript);

      setTranscribing(false);

      // Send transcript to existing chat API
      await sendQuestion(transcript);

    } catch (err) {
      console.error("STT Error:", err);

      if (err.response) {
        handleApiError(err);
      } else {
        setError(
          err.message || "Voice থেকে text তৈরি করা যায়নি। আবার চেষ্টা করুন।"
        );
      }

      setTranscribing(false);
    }
  };


  // =====================================
  // Play AI Response Using Gemini TTS
  // =====================================

  const playSpeech = async (text, messageId) => {
    // Stop currently playing audio
    if (
      speakingId === messageId &&
      audioRef.current
    ) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSpeakingId(null);
      return;
    }

    setError("");

    try {
      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      setSpeakingId(messageId);

      const response = await api.post(
        "/api/assistant/speech",
        {
          text: text,
        },
        {
          responseType: "blob",
        }
      );

      const audioBlob = response.data;

      if (!audioBlob || audioBlob.size === 0) {
        throw new Error("Audio তৈরি করা যায়নি।");
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);

      audioRef.current = audio;

      audio.onended = () => {
        setSpeakingId(null);

        URL.revokeObjectURL(audioUrl);

        audioUrlRef.current = null;
        audioRef.current = null;
      };

      audio.onerror = () => {
        setSpeakingId(null);
        setError("Audio play করা যাচ্ছে না।");
      };

      await audio.play();

    } catch (err) {
      console.error("TTS Error:", err);

      setSpeakingId(null);

      if (err.response) {
        handleApiError(err);
      } else {
        setError(
          err.message || "Voice response তৈরি করা যায়নি।"
        );
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      audioRef.current = null;
    }
  };


  // =====================================
  // UI
  // =====================================

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
                  দিতে সাহায্য করতে পারি। আপনার প্রশ্ন লিখুন অথবা
                  microphone button চেপে বাংলায় কথা বলুন।
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

                <div className="max-w-[85%]">

                  <div
                    className={`rounded-2xl p-4 whitespace-pre-wrap leading-relaxed ${
                      message.sender === "user"
                        ? "bg-teal-600 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-700 rounded-tl-none"
                    }`}
                  >
                    {message.text}
                  </div>


                  {/* TTS Button */}
                  {message.sender === "assistant" && (
                    <button
                      type="button"
                      onClick={() =>
                        playSpeech(message.text, message.id)
                      }
                      disabled={
                        speakingId !== null &&
                        speakingId !== message.id
                      }
                      className="mt-2 flex items-center gap-2 text-sm text-teal-700 hover:text-teal-900 disabled:opacity-50"
                      aria-label="Play voice response"
                    >
                      {speakingId === message.id ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                          Audio চলছে / বন্ধ করুন
                        </>
                      ) : (
                        <>
                          <Volume2 size={17} />
                          শুনুন
                        </>
                      )}
                    </button>
                  )}

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


            {/* Transcription Indicator */}
            {transcribing && (
              <div className="flex items-center gap-2 text-sm text-teal-700">
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                আপনার কথা থেকে text তৈরি হচ্ছে...
              </div>
            )}


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

            {recording && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm mb-3">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Recording চলছে... কথা শেষ হলে Stop চাপুন।
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="flex items-center gap-3"
            >

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="আপনার স্বাস্থ্যবিষয়ক প্রশ্ন লিখুন..."
                disabled={loading || recording || transcribing}
                className="flex-1 min-w-0 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100"
              />


              {/* Microphone / Stop Button */}
              <button
                type="button"
                onClick={
                  recording
                    ? stopRecording
                    : startRecording
                }
                disabled={loading || transcribing}
                className={`p-3 rounded-xl transition text-white disabled:bg-slate-300 ${
                  recording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
                aria-label={
                  recording
                    ? "Stop recording"
                    : "Start recording"
                }
              >
                {recording ? (
                  <MicOff size={21} />
                ) : (
                  <Mic size={21} />
                )}
              </button>


              {/* Send Button */}
              <button
                type="submit"
                disabled={
                  !question.trim() ||
                  loading ||
                  recording ||
                  transcribing
                }
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
