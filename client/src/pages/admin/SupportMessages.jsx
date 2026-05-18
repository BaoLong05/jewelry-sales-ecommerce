import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getAdminConversationMessages,
  getAdminConversations,
  sendAdminSupportMessage,
} from "../../services/supportChatService";

export default function SupportMessages() {
  document.title = "Tin nhắn khách hàng";
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = async (silent = false) => {
    try {
      const res = await getAdminConversations();
      const list = res.data?.data || [];
      setConversations(list);
      if (!selectedId && list.length > 0) setSelectedId(list[0].id);
    } catch {
      if (!silent) toast.error("Không thể tải danh sách tin nhắn");
    }
  };

  const loadMessages = async (id, silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const res = await getAdminConversationMessages(id);
      setSelectedConversation(res.data?.data?.conversation || null);
      setMessages(res.data?.data?.messages || []);
    } catch {
      if (!silent) toast.error("Không thể tải cuộc trò chuyện");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const timer = setInterval(() => loadConversations(true), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadMessages(selectedId);
    if (!selectedId) return;
    const timer = setInterval(() => loadMessages(selectedId, true), 3000);
    return () => clearInterval(timer);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async (event) => {
    event.preventDefault();
    const content = reply.trim();
    if (!content || !selectedId) return;

    setSending(true);
    try {
      await sendAdminSupportMessage(selectedId, content);
      setReply("");
      await Promise.all([loadMessages(selectedId, true), loadConversations(true)]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi phản hồi thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-32px)] bg-white border border-gray-200 rounded-xl overflow-hidden grid grid-cols-[320px_1fr]">
      <aside className="border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
          <h1 className="text-lg font-semibold text-gray-800">Tin nhắn khách hàng</h1>
          <p className="text-xs text-gray-500 mt-1">Tự động cập nhật mỗi vài giây</p>
        </div>

        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Chưa có cuộc trò chuyện nào.</p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={`w-full text-left p-4 border-b border-gray-200 hover:bg-amber-50 transition ${
                selectedId === conversation.id ? "bg-amber-50" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-800 truncate">{conversation.user?.name || "Khách hàng"}</p>
                {conversation.unread_count > 0 && (
                  <span className="bg-rose-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-1">{conversation.latest_message?.message || "Chưa có tin nhắn"}</p>
            </button>
          ))
        )}
      </aside>

      <section className="flex flex-col min-w-0">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">{selectedConversation.user?.name}</h2>
              <p className="text-xs text-gray-500">
                {selectedConversation.user?.email} {selectedConversation.user?.phone ? `- ${selectedConversation.user.phone}` : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto bg-stone-50 p-4 space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Đang tải...</p>
              ) : (
                messages.map((item) => (
                  <MessageBubble key={item.id} message={item} mine={item.sender_type === "admin"} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleReply} className="p-4 border-t border-gray-200 flex gap-2">
              <input
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Nhập phản hồi..."
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <button disabled={sending} className="px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-60">
                {sending ? "Đang gửi..." : "Gửi"}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chọn một cuộc trò chuyện để bắt đầu phản hồi.
          </div>
        )}
      </section>
    </div>
  );
}

function MessageBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-amber-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
        <p>{message.message}</p>
        <p className={`text-[11px] mt-1 ${mine ? "text-amber-100" : "text-gray-400"}`}>
          {new Date(message.created_at).toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
}
