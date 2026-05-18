import React, { useState, useEffect, useRef } from 'react';
import { chatbotAi } from '../services/chatbotaiService';

const ChatBotAI = ({ title = "Trợ lý AI", placeholder = "Nhập tin nhắn..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user' }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await chatbotAi({ message: text });
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: res.reply || "Không có phản hồi", sender: 'bot' }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: "Lỗi server", sender: 'bot', isError: true }
      ]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Nút nổi */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-[70px] h-[70px] rounded-full cursor-pointer flex items-center justify-center shadow-lg z-[1000] transition-transform duration-300 hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #667eea, #00c6ff, #781852)' }}
      >
        <img
          src="/chatbotai.png"
          alt="chatbot"
          className="w-[65px] h-[65px] rounded-full object-cover"
        />
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed bottom-[90px] right-5 w-[700px] max-w-[calc(100vw-40px)] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[1001]"
          style={{ animation: 'fadeInUp 0.2s ease-out' }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center px-4 py-3 text-white border-b border-white/20"
            style={{ background: 'linear-gradient(135deg, #0078ff, #00c6ff)' }}
          >
            <h3 className="m-0 text-[1.1rem] font-semibold">{title}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-none text-white text-2xl cursor-pointer leading-none opacity-80 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-3 bg-[#f8f9fa]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-[18px] text-sm leading-relaxed break-words
                    ${msg.sender === 'user'
                      ? 'bg-[#0078ff] text-white rounded-br-[4px]'
                      : msg.isError
                        ? 'bg-[#ffe6e6] text-[#d32f2f] border border-[#ffcdd2] rounded-bl-[4px]'
                        : 'bg-white text-[#1a1a1a] border border-[#e0e0e0] rounded-bl-[4px]'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex flex-col max-w-[85%] self-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0e0e0] rounded-[18px] rounded-bl-[4px]">
                  {/* 3 chấm nhảy */}
                  <span className="flex items-center gap-[6px]">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-[#888] rounded-full inline-block"
                        style={{
                          animation: `wave 1.2s infinite ease-in-out`,
                          animationDelay: `${delay}s`
                        }}
                      />
                    ))}
                  </span>
                  {/* Chữ nhảy */}
                  <span
                    className="text-[0.85rem] text-[#6c757d] italic"
                    style={{ animation: 'bounceText 0.8s infinite ease-in-out' }}
                  >
                    Đang trả lời...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex items-center gap-[10px] px-4 py-3 bg-white border-t border-[#e9ecef] shadow-[0_-2px_8px_rgba(0,0,0,0.02)]">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={placeholder}
              className="flex-1 px-[14px] py-[10px] border border-[#dee2e6] rounded-[24px] text-sm bg-white outline-none transition-all duration-200
                focus:border-[#0078ff] focus:shadow-[0_0_0_3px_rgba(0,120,255,0.1)]
                placeholder:text-[#adb5bd] placeholder:text-[0.85rem]"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="rounded-[40px] px-5 py-2 text-white font-semibold text-[0.85rem] border-none cursor-pointer transition-all duration-200 whitespace-nowrap
                disabled:bg-[#c0c4c8] disabled:cursor-not-allowed disabled:opacity-70
                hover:enabled:-translate-y-[1px] hover:enabled:shadow-[0_2px_6px_rgba(0,120,255,0.3)]
                active:enabled:translate-y-[1px]"
              style={{ background: 'linear-gradient(135deg, #0078ff, #00a6ff)' }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {/* Keyframes nhúng inline qua style tag */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes bounceText {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-3px); }
        }
      `}</style>
    </>
  );
};

export default ChatBotAI;