import { useState } from "react";
import { submitReiew } from "../../../services/profileService/orderService";

export default function ReviewModal({ orderCode, item, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    document.title = "Đánh giá sản phẩm";
    setLoading(true);
    setError("");
    try {
      await submitReiew(orderCode, item.id, { rating, comment, images });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-gray-800 mb-1">
          Đánh giá sản phẩm
        </h2>
        <p className="text-sm text-gray-400 mb-5 truncate">
          {item.product?.name}
        </p>

        <div className="mb-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Chọn ${star} sao`}
                className={`text-3xl transition-transform hover:scale-110 ${
                  star <= rating ? "text-yellow-400" : "text-gray-200"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm font-medium text-amber-600">
            Bạn đã chọn {rating}/5 sao
          </p>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          maxLength={255}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1.5">
            Ảnh minh chứng (tối đa 5)
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
          />
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                />
              ))}
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
