import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getUserSupportMessages,
  sendUserSupportMessage,
} from "../../services/supportChatService";

const STORE_INFO = [
  { label: "Tên website", value: "Lumina Jewelry" },
  { label: "Số điện thoại", value: "0901 234 567" },
  { label: "Email", value: "support@lumina.vn" },
  { label: "Địa chỉ", value: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh" },
  { label: "Thời gian hỗ trợ", value: "08:00 - 21:00, Thứ 2 - Chủ nhật" },
];

export default function ContactPage() {
  document.title = "Liên hệ";
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("info");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadMessages = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const res = await getUserSupportMessages();
      setMessages(res.data?.data?.messages || []);
    } catch {
      if (!silent) toast.error("Không thể tải tin nhắn hỗ trợ");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "chat" || !token) return;
    loadMessages();
    const timer = setInterval(() => loadMessages(true), 3000);
    return () => clearInterval(timer);
  }, [activeTab, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;

    setSending(true);
    try {
      await sendUserSupportMessage(content);
      setMessage("");
      await loadMessages(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="bg-[#FEFCF3] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-amber-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">Support</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-800">Liên hệ Lumina</h1>
          <p className="text-gray-500 mt-2">Thông tin cửa hàng và kênh chat chăm sóc khách hàng.</p>
        </div>

        <div className="bg-white border border-amber-100 rounded-xl overflow-hidden">
          <div className="flex border-b border-amber-100">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 px-4 py-3 text-sm font-semibold ${activeTab === "info" ? "bg-amber-50 text-amber-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Thông tin website
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 px-4 py-3 text-sm font-semibold ${activeTab === "chat" ? "bg-amber-50 text-amber-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Chat với admin
            </button>
          </div>

          {activeTab === "info" ? (
            <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-6 p-6">
              <div>
                <h2 className="text-xl font-serif font-semibold text-gray-800">Lumina Jewelry</h2>
                <p className="text-gray-500 mt-2 leading-7">
                  Chúng tôi hỗ trợ tư vấn chọn trang sức, kiểm tra đơn hàng và giải đáp các thắc mắc khi mua sắm.
                </p>
              </div>
              <div className="space-y-3">
                {STORE_INFO.map((item) => (
                  <div key={item.label} className="flex gap-4 border-b border-gray-100 pb-3 last:border-0">
                    <span className="w-36 text-sm font-semibold text-gray-700">{item.label}</span>
                    <span className="flex-1 text-sm text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {!token ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Bạn cần đăng nhập để chat với admin.</p>
                  <Link to="/login" className="inline-flex px-5 py-2.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800">
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <>
                  <div className="h-[420px] overflow-y-auto rounded-xl bg-stone-50 border border-stone-100 p-4 space-y-3">
                    {loading ? (
                      <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-16">Bắt đầu cuộc trò chuyện với Lumina.</p>
                    ) : (
                      messages.map((item) => (
                        <MessageBubble key={item.id} message={item} mine={item.sender_type === "user"} />
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <form onSubmit={handleSend} className="flex gap-2 mt-4">
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    />
                    <button disabled={sending} className="px-5 py-2.5 rounded-lg bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 disabled:opacity-60">
                      {sending ? "Đang gửi..." : "Gửi"}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MessageBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-amber-700 text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
        <p>{message.message}</p>
        <p className={`text-[11px] mt-1 ${mine ? "text-amber-100" : "text-gray-400"}`}>
          {new Date(message.created_at).toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
}
