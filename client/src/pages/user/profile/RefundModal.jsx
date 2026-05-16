import { useState } from "react";
import { submitRefundRequest } from "../../../services/profileService/orderService";

export default function RefundModal({ orderCode, item, onClose, onSuccess }) {
  const [reason, setReason]   = useState("");
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

const handleSubmit = async () => {
  if (reason.trim().length < 20) {
    setError("Lý do phải có ít nhất 20 ký tự.");
    return;
  }
  setLoading(true);
  setError("");
  try {
    await submitRefundRequest(orderCode, item.id, { reason, images });
    onSuccess?.();
    onClose();
  } catch (err) {
   const msg = err.response?.data?.message         
    || Object.values(err.response?.data?.errors ?? {})[0]?.[0]  
    || "Có lỗi xảy ra, vui lòng thử lại.";       
  setError(msg);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-gray-800 mb-1">Yêu cầu hoàn hàng</h2>
        <p className="text-sm text-gray-400 mb-5 truncate">{item.product?.name}</p>

        {/* Reason */}
        <label className="text-xs text-gray-500 mb-1.5 block">
          Lý do hoàn hàng <span className="text-red-400">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Mô tả chi tiết vấn đề của sản phẩm (ít nhất 20 ký tự)..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
        />
        <p className={`text-xs mt-1 ${reason.length >= 20 ? "text-emerald-500" : "text-gray-400"}`}>
          {reason.length}/1000 ký tự {reason.length >= 20 ? "✓" : `(còn ${20 - reason.length} ký tự)`}
        </p>

        {/* Images */}
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-1.5">Ảnh minh chứng (tối đa 5)</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-red-50 file:text-red-500 hover:file:bg-red-100"
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

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
}