import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileOrderDetail } from "../../../services/profileService/orderService";
import { formatCurrency, ORDER_STATUS_COLOR, PROGRESS_STEPS } from "../../../utils/formatters";
import { getImageUrl } from "../../../utils/image";
import ReviewModal from "./ReviewModal";
import RefundModal from "./RefundModal";

const parseAddress = (address) => {
  if (!address) return null;
  if (typeof address === "object") return address;

  try {
    const parsed = JSON.parse(address);
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    return null;
  }
};

const formatAddress = (address) =>
  [address?.street, address?.ward, address?.district, address?.province]
    .filter(Boolean)
    .join(", ");

export default function OrderDetailPage() {
  document.title = "Chi tiết đơn hàng của bạn";
  const { orderCode } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState(null);
  const [refundItem, setRefundItem] = useState(null);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProfileOrderDetail(orderCode);
      setOrder(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderCode]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-24 text-gray-400">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-sm">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const isNormalFlow = !["cancelled", "refunded"].includes(order.status);
  const address = parseAddress(order.address);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/thong-tin-ca-nhan/don-hang")}
          className="text-sm text-gray-500 hover:text-amber-600 transition-colors flex items-center gap-1"
        >
          ← Quay lại
        </button>
        <h1 className="text-xl font-serif font-semibold text-gray-800">
          Chi tiết đơn hàng
        </h1>
      </div>

      {/* Status card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Mã đơn hàng</span>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{order.order_code}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${ORDER_STATUS_COLOR[order.status]}`}>
            {order.status_label}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{order.created_at}</p>

        {/* Stepper */}
        {isNormalFlow && (
          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex items-center min-w-max gap-1">
              {PROGRESS_STEPS.map((step, index) => {
                const isDone = index < order.progress_step;
                const isCurrent = index === order.progress_step;
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                          ${
                            isDone
                              ? "bg-emerald-500 text-white shadow-sm"
                              : isCurrent
                              ? "bg-amber-500 text-white ring-4 ring-amber-100"
                              : "bg-gray-100 text-gray-400"
                          }
                        `}
                      >
                        {isDone ? "✓" : index + 1}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium whitespace-nowrap ${
                          isCurrent ? "text-amber-600" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < PROGRESS_STEPS.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-1 mb-6 ${
                          index < order.progress_step ? "bg-emerald-400" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm p-6">
        <h2 className="text-base font-serif font-semibold text-gray-800 mb-5">Sản phẩm</h2>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-start gap-4 py-5 first:pt-0 last:pb-0">
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(item.product?.thumbnail)}
                  alt={item.product?.name}
                  className="w-20 h-20 rounded-xl object-cover border border-amber-100 bg-amber-50"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.product?.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>

                {/* Review badge */}
                {item.is_reviewed && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="flex text-yellow-400 text-xs">
                      {"★".repeat(item.review?.rating)}
                      {"☆".repeat(5 - (item.review?.rating || 0))}
                    </div>
                    <span className="text-xs text-gray-400">Đã đánh giá</span>
                  </div>
                )}

                {/* Refund badge */}
                {item.has_refund_request && (
                  <span className="mt-2 inline-block text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                    Hoàn hàng: {item.refund_request?.status_label}
                  </span>
                )}
              </div>

              {/* Subtotal + Buttons */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {formatCurrency(item.subtotal)}
                </span>
                <div className="flex gap-2">
                  {order.actions?.can_review && !item.is_reviewed && (
                    <button
                      onClick={() => setReviewItem(item)}
                      className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-sm"
                    >
                      Đánh giá
                    </button>
                  )}
                  {order.actions?.can_request_refund && !item.has_refund_request && (
                    <button
                      onClick={() => setRefundItem(item)}
                      className="text-xs px-3 py-1.5 border border-rose-300 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      Hoàn hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm p-6">
        <h2 className="text-base font-serif font-semibold text-gray-800 mb-4">Thanh toán</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Phương thức</span>
            <span className="font-medium text-gray-800 uppercase">{order.payment_method}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-gray-50">
            <span className="text-gray-500">Tạm tính</span>
            <span>{formatCurrency(order.total_price)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between py-1 text-emerald-600">
              <span>Giảm giá</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 mt-1 border-t border-dashed border-amber-200 font-semibold text-gray-800">
            <span>Tổng cộng</span>
            <span className="text-amber-700 text-base">{formatCurrency(order.amount_due ?? order.final_price)}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm p-6">
        <h2 className="text-base font-serif font-semibold text-gray-800 mb-2">Địa chỉ giao hàng</h2>
        {address ? (
          <div className="text-sm text-gray-600 leading-relaxed space-y-1">
            {address.receiver_name && (
              <p>
                <span className="text-gray-500">Người nhận: </span>
                <span className="font-medium text-gray-800">
                  {address.receiver_name}
                </span>
              </p>
            )}
            {address.phone && (
              <p>
                <span className="text-gray-500">SĐT: </span>
                <span className="font-medium text-gray-800">{address.phone}</span>
              </p>
            )}
            <p>{formatAddress(address) || "Chưa có địa chỉ giao hàng"}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">
            {order.address || "Chưa có địa chỉ giao hàng"}
          </p>
        )}
      </div>

      {/* Modals */}
      {reviewItem && (
        <ReviewModal
          orderCode={orderCode}
          item={reviewItem}
          onClose={() => setReviewItem(null)}
          onSuccess={fetchOrder}
        />
      )}
      {refundItem && (
        <RefundModal
          orderCode={orderCode}
          item={refundItem}
          onClose={() => setRefundItem(null)}
          onSuccess={fetchOrder}
        />
      )}
    </div>
  );
}
