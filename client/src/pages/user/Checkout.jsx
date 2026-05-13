import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../../services/cartService";
import { placeOrder, checkPaymentStatus } from "../../services/checkoutService";
import { getImageUrl } from "../../utils/image";
import AddressForm from "./AddressForm";
import { toast } from "react-toastify";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!state?.selectedCartIds?.length) {
      navigate("/gio-hang");
      return;
    }
    loadItems();
    return () => clearInterval(pollingRef.current);
  }, []);

  const loadItems = async () => {
    const res = await getCart();
    const all = res.data?.data?.items || [];
    setCartItems(
      all.filter((i) => state.selectedCartIds.includes(Number(i.cart_item_id))),
    );
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  // Tính toán giá có discount
  const subtotal = cartItems.reduce(
    (s, i) => s + (i.product?.original_price || i.price) * i.quantity,
    0,
  );
  const discountAmount = cartItems.reduce((s, i) => {
    const orig = i.product?.original_price || i.price;
    return s + (orig - i.price) * i.quantity;
  }, 0);
  const hasFreeship = cartItems.some((i) => i.product?.has_freeship);
  const total = subtotal - discountAmount;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId)
      return toast.warning("Vui lòng chọn địa chỉ giao hàng!");
    setLoading(true);
    try {
      const res = await placeOrder({
        cart_item_ids: state.selectedCartIds.map((id) => Number(id)),
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      });
      const data = res.data.data;

      if (paymentMethod === "cod") {
        navigate("/thanh-toan-thanh-cong", {
          state: {
            payment_token: data.payment_token,
            order_code: data.order_code,
          },
        });
        return;
      }
      if (paymentMethod === "bank_transfer") {
        setQrData(data);
        startPolling(data.payment_id);
        return;
      }
      window.location.href = data.redirect_url;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại",
      );
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentId) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(paymentId);
        if (res.data.data.status === "paid") {
          clearInterval(pollingRef.current);
          navigate("/thanh-toan-thanh-cong", {
            state: {
              payment_token: res.data.data.payment_token,
              order_code: res.data.data.order_code,
            },
          });
        }
      } catch {}
    }, 5000);
  };

  if (qrData)
    return (
      <QRWaiting qrData={qrData} total={total} formatPrice={formatPrice} />
    );

  return (
    <div className="bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-serif font-semibold text-gray-800 border-l-4 border-amber-500 pl-4 mb-8">
          Thanh toán
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white/80 rounded-2xl border border-amber-100/60 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">
                  1
                </span>
                Địa chỉ giao hàng
              </h2>
              <AddressForm
                onSelect={setSelectedAddressId}
                selectedId={selectedAddressId}
              />
            </section>

            <section className="bg-white/80 rounded-2xl border border-amber-100/60 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">
                  2
                </span>
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "cod",
                    label: "Thanh toán khi nhận hàng (COD)",
                    icon: "🚚",
                    desc: "Trả tiền mặt khi nhận hàng",
                  },
                  {
                    value: "bank_transfer",
                    label: "Chuyển khoản ngân hàng",
                    icon: "🏦",
                    desc: "QR VietQR — xác nhận tự động",
                  },
                  {
                    value: "momo",
                    label: "Ví MoMo",
                    icon: "💜",
                    desc: "Chuyển hướng sang MoMo",
                  },
                  {
                    value: "vnpay",
                    label: "VNPay",
                    icon: "💳",
                    desc: "Thẻ ATM / Visa / QR VNPay",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === opt.value
                        ? "border-amber-400 bg-amber-50/40"
                        : "border-gray-200 hover:border-amber-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-amber-600"
                    />
                    <span className="text-xl">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Cột phải: tóm tắt */}
          <div>
            <div className="bg-white/80 rounded-2xl border border-amber-100/60 p-5 sticky top-24">
              <h2 className="font-semibold text-gray-800 mb-4">
                Đơn hàng ({cartItems.length} sản phẩm)
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const hasDiscount =
                    item.product?.original_price &&
                    item.product.original_price > item.price;
                  return (
                    <div key={item.cart_item_id} className="flex gap-3 text-sm">
                      <img
                        src={getImageUrl(item.product?.image_url)}
                        alt={item.product?.name}
                        className="w-14 h-14 rounded-lg object-cover bg-amber-50 border border-amber-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium line-clamp-2">
                          {item.product?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-amber-700 font-semibold">
                            {formatPrice(item.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-gray-400 line-through text-xs">
                              {formatPrice(item.product.original_price)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">
                          x{item.quantity}
                        </p>
                      </div>
                      <p className="text-amber-700 font-semibold whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Tổng tiền */}
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">
                    {hasFreeship ? "Miễn phí 🚚" : "Miễn phí"}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs bg-green-50 rounded-lg px-3 py-2">
                    <span>Bạn tiết kiệm được</span>
                    <span className="font-semibold">
                      {formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-base text-gray-800 pt-2 border-t border-gray-100">
                  <span>Tổng cộng</span>
                  <span className="text-amber-700">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold transition disabled:opacity-60"
              >
                {loading
                  ? "Đang xử lý..."
                  : paymentMethod === "cod"
                    ? "Đặt hàng"
                    : "Tiến hành thanh toán →"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản dịch vụ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QRWaiting({ qrData, total, formatPrice }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20 flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-2xl border border-amber-100 p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Quét mã để thanh toán
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Trang sẽ tự động chuyển sau khi nhận được tiền
        </p>

        <img
          src={qrData.qr_url}
          alt="QR thanh toán"
          className="w-56 h-56 mx-auto rounded-xl border-2 border-gray-100 mb-5"
        />

        <div className="bg-amber-50 rounded-xl p-4 text-left text-sm space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Số tiền</span>
            <span className="font-bold text-amber-700">
              {formatPrice(total)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nội dung CK</span>
            <span className="font-mono font-semibold text-gray-800">
              {qrData.transfer_content}
            </span>
          </div>
          <p className="text-xs text-rose-500 font-medium pt-1">
            ⚠️ Nhập đúng nội dung chuyển khoản để hệ thống tự xác nhận
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          Đang chờ xác nhận thanh toán...
        </div>
      </div>
    </div>
  );
}
