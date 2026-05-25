import React, { useEffect, useMemo, useRef, useState } from "react";
import { chatbotAi } from "../services/chatbotaiService";
import { getImageUrl } from "../utils/image";
import { getDiscountInfo } from "../utils/discount";

const suggestedQuestions = [
  "Sản phẩm này còn hàng không?",
  "Giá và ưu đãi hiện tại thế nào?",
  "Sản phẩm này phù hợp làm quà không?",
];

const ChatBotAI = ({
  title = "Tư vấn sản phẩm",
  placeholder = "Hỏi về sản phẩm này...",
  product = null,
  onAddToCart,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const productImage = useMemo(() => {
    if (!product) return null;
    const mainImage = product.images?.find((img) => img.is_main) || product.images?.[0];
    return mainImage?.image_url ? getImageUrl(mainImage.image_url) : null;
  }, [product]);

  const priceInfo = useMemo(() => {
    if (!product) return null;
    return getDiscountInfo(product);
  }, [product]);

  useEffect(() => {
    if (!product) {
      setMessages([
        {
          id: 1,
          text: "Xin chào! Tôi có thể hỗ trợ bạn tìm hiểu sản phẩm.",
          sender: "bot",
        },
      ]);
      return;
    }

    setMessages([
      {
        id: 1,
        text: `Bạn đang xem "${product.name}". Bạn muốn hỏi về giá, tồn kho, ưu đãi hay cách chọn sản phẩm này?`,
        sender: "bot",
      },
    ]);
  }, [product?.id, product?.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (quickText) => {
    const text = (quickText || inputValue).trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { id: Date.now(), text, sender: "user" }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await chatbotAi({
        message: text,
        product_id: product?.id,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: res.reply || "Hiện chưa có phản hồi cho câu hỏi này.",
          sender: "bot",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Xin lỗi, hiện chưa thể trả lời. Bạn thử lại sau nhé.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-5 right-5 w-[70px] h-[70px] rounded-full cursor-pointer flex items-center justify-center shadow-lg z-[1000] transition-transform duration-300 hover:scale-105 bg-amber-700"
        aria-label="Mở tư vấn sản phẩm"
      >
        <img
          src="/chatbotai.png"
          alt="chatbot"
          className="w-[65px] h-[65px] rounded-full object-cover"
        />
      </button>

      {isOpen && (
        <div
          className="fixed bottom-[90px] right-5 w-[420px] max-w-[calc(100vw-40px)] h-[620px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[1001] border border-amber-100"
          style={{ animation: "fadeInUp 0.2s ease-out" }}
        >
          <div className="flex justify-between items-center px-4 py-3 text-white bg-amber-700">
            <div>
              <h3 className="m-0 text-base font-semibold">{title}</h3>
              {product && (
                <p className="text-xs text-amber-100 mt-0.5 line-clamp-1">
                  Đang tư vấn: {product.name}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-none text-white text-2xl cursor-pointer leading-none opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Đóng tư vấn"
            >
              ×
            </button>
          </div>

          {product && (
            <div className="p-3 bg-amber-50/60 border-b border-amber-100">
              <div className="flex gap-3 bg-white rounded-xl border border-amber-100 p-2">
                <div className="w-16 h-16 rounded-lg bg-amber-50 overflow-hidden shrink-0">
                  {productImage && (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </p>
                  {priceInfo && (
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-amber-700">
                        {Number(priceInfo.discountedPrice).toLocaleString("vi-VN")}đ
                      </span>
                      {priceInfo.discountedPrice < priceInfo.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {Number(priceInfo.originalPrice).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={!onAddToCart || product.stock <= 0}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-3 bg-[#f8f9fa]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[86%] ${
                  msg.sender === "user" ? "self-end" : "self-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-[18px] text-sm leading-relaxed break-words ${
                    msg.sender === "user"
                      ? "bg-amber-700 text-white rounded-br-[4px]"
                      : msg.isError
                        ? "bg-red-50 text-red-600 border border-red-100 rounded-bl-[4px]"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-[4px]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {messages.length <= 1 && product && (
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col max-w-[85%] self-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[18px] rounded-bl-[4px]">
                  <span className="flex items-center gap-[6px]">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-gray-500 rounded-full inline-block"
                        style={{
                          animation: "wave 1.2s infinite ease-in-out",
                          animationDelay: `${delay}s`,
                        }}
                      />
                    ))}
                  </span>
                  <span className="text-[0.85rem] text-gray-500 italic">
                    Đang tư vấn...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-[10px] px-4 py-3 bg-white border-t border-gray-100">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={placeholder}
              className="flex-1 px-[14px] py-[10px] border border-gray-200 rounded-[24px] text-sm bg-white outline-none transition-all duration-200 focus:border-amber-600 focus:shadow-[0_0_0_3px_rgba(217,119,6,0.12)] placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={isLoading}
              className="rounded-[40px] px-5 py-2 bg-amber-700 text-white font-semibold text-[0.85rem] border-none cursor-pointer transition-all duration-200 whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed hover:enabled:bg-amber-800"
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default ChatBotAI;
