import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyPaymentToken } from "../../services/checkoutService";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [valid, setValid] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || state?.payment_token;

  if (!token) { navigate("/"); return; }

  verifyPaymentToken(token)
    .then(res => { setValid(true); setOrder(res.data.data); })
    .catch(() => setValid(false));
}, []);

  const formatPrice = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  if (valid === null) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"/>
    </div>
  );

  if (!valid) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Liên kết không hợp lệ hoặc đã hết hạn.</p>
      <Link to="/" className="text-amber-600 hover:underline text-sm mt-3 block">Về trang chủ</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20 flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-2xl border border-amber-100 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-gray-800 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 text-sm mb-6">Cảm ơn bạn đã mua hàng tại Lumina Jewelry</p>

        {order && (
          <div className="bg-amber-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-mono font-semibold text-gray-800">{order.order_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng tiền</span>
              <span className="font-semibold text-amber-700">
                {formatPrice(order.total_amount)}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Đã giảm</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Phương thức</span>
              <span className="text-gray-800 capitalize">{order.payment_method}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/don-hang"
            className="flex-1 py-2.5 rounded-xl border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 transition text-center">
            Xem đơn hàng
          </Link>
          <Link to="/san-pham"
            className="flex-1 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition text-center">
            Tiếp tục mua
          </Link>
        </div>
      </div>
    </div>
  );
}