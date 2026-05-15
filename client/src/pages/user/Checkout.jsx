import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../../services/cartService";
import {
  placeOrder,
  placeOrderDirect,
  checkPaymentStatus,
} from "../../services/checkoutService";
import { getImageUrl } from "../../utils/image";
import AddressForm from "./AddressForm";
import { toast } from "react-toastify";
import {
  MapPinIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  WalletIcon,
  QrCodeIcon,
  TruckIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const pollingRef = useRef(null);
  const isBuyNow = !!state?.buyNowItem;
  const [cartItemsFromAPI, setCartItemsFromAPI] = useState([]);
  
  useEffect(() => {
    if (!state?.selectedCartIds?.length && !state?.buyNowItem) {
      navigate("/gio-hang");
      return;
    }
    if (!isBuyNow) {
      loadItems(state.selectedCartIds.map(Number));
    }
    return () => clearInterval(pollingRef.current);
  }, []);
  
  const loadItems = async (ids) => {
    const res = await getCart();
    const all = res.data?.data?.items || [];
    setCartItemsFromAPI(
      all.filter((i) => ids.includes(Number(i.cart_item_id)))
    );
  };
  
  const cartItems = isBuyNow
    ? [
        {
          cart_item_id: "buynow",
          quantity: state.buyNowItem.quantity,
          price: state.buyNowItem.price,
          product: {
            name: state.buyNowItem.name,
            image_url: state.buyNowItem.image,
            original_price: state.buyNowItem.original_price,
          },
        },
      ]
    : cartItemsFromAPI;
  
  const formatPrice = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const subtotal = cartItems.reduce(
    (s, i) => s + (i.product?.original_price || i.price) * i.quantity,
    0
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
      let data;
      if (isBuyNow) {
        const res = await placeOrderDirect({
          product_id: state.buyNowItem.product_id,
          quantity: state.buyNowItem.quantity,
          address_id: selectedAddressId,
          payment_method: paymentMethod,
        });
        data = res.data.data;
      } else {
        const res = await placeOrder({
          cart_item_ids: state.selectedCartIds.map(Number),
          address_id: selectedAddressId,
          payment_method: paymentMethod,
        });
        data = res.data.data;
      }
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
        err.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại"
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
    return <QRWaiting qrData={qrData} total={total} formatPrice={formatPrice} />;

  return (
    <div className="bg-[#FEFCF3] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-gray-800 tracking-tight">
            Thanh toán
          </h1>
          <p className="text-gray-500 text-sm mt-2 border-l-2 border-amber-400 pl-3">
            Vui lòng kiểm tra lại thông tin trước khi đặt hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái - các bước */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Địa chỉ giao hàng */}
            <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F0EDE5] flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-sm font-medium">
                  1
                </span>
                <h2 className="font-serif text-xl font-semibold text-gray-800">
                  Địa chỉ giao hàng
                </h2>
              </div>
              <div className="p-6">
                <AddressForm
                  onSelect={setSelectedAddressId}
                  selectedId={selectedAddressId}
                />
              </div>
            </div>

            {/* Step 2: Phương thức thanh toán */}
            <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F0EDE5] flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-sm font-medium">
                  2
                </span>
                <h2 className="font-serif text-xl font-semibold text-gray-800">
                  Phương thức thanh toán
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {[
                  {
                    value: "cod",
                    label: "Thanh toán khi nhận hàng",
                    icon: BanknotesIcon,
                    desc: "Trả tiền mặt khi nhận hàng",
                  },
                  {
                    value: "bank_transfer",
                    label: "Chuyển khoản ngân hàng",
                    icon: BuildingLibraryIcon,
                    desc: "QR VietQR – Xác nhận tự động",
                  },
                  {
                    value: "momo",
                    label: "Ví MoMo",
                    icon: WalletIcon,
                    desc: "Chuyển hướng sang ứng dụng MoMo",
                  },
                  {
                    value: "vnpay",
                    label: "VNPay",
                    icon: CreditCardIcon,
                    desc: "Thẻ ATM / Visa / QR VNPay",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === opt.value
                        ? "border-amber-400 bg-amber-50/20"
                        : "border-[#E8E2D2] hover:border-amber-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="mt-0.5 w-4 h-4 text-amber-600 focus:ring-amber-400"
                    />
                    <div className="flex-shrink-0">
                      <opt.icon className="w-6 h-6 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.desc}</p>
                    </div>
                    {paymentMethod === opt.value && (
                      <div className="absolute right-4 top-4 text-amber-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Thông tin bảo mật (nhỏ) */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Thanh toán an toàn & bảo mật</span>
            </div>
          </div>

          {/* Cột phải - Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-amber-200 shadow-lg overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-white to-amber-50/30 border-b border-amber-100">
                <h2 className="font-serif text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-amber-600" />
                  Đơn hàng
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cartItems.length} sản phẩm
                </p>
              </div>

              <div className="p-5 max-h-80 overflow-y-auto space-y-4">
                {cartItems.map((item) => {
                  const hasDiscount =
                    item.product?.original_price &&
                    item.product.original_price > item.price;
                  return (
                    <div key={item.cart_item_id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-amber-50 border border-amber-100 overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item.product?.image_url)}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {item.product?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-amber-700 font-semibold text-sm">
                            {formatPrice(item.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-gray-400 line-through text-xs">
                              {formatPrice(item.product.original_price)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-700 font-semibold whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#F0EDE5] p-5 space-y-3 bg-gray-50/20">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">
                    {hasFreeship ? "Miễn phí" : "Miễn phí"}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="bg-green-50 rounded-lg px-3 py-2 flex justify-between text-xs text-green-700">
                    <span>✨ Bạn tiết kiệm được</span>
                    <span className="font-semibold">
                      {formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-dashed border-amber-200 flex justify-between font-semibold text-base">
                  <span className="text-gray-800">Tổng cộng</span>
                  <span className="text-amber-700 text-lg font-bold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-base transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : paymentMethod === "cod" ? (
                    "ĐẶT HÀNG NGAY"
                  ) : (
                    "TIẾN HÀNH THANH TOÁN →"
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Bằng cách đặt hàng, bạn đồng ý với{" "}
                  <a href="#" className="text-amber-600 hover:underline">
                    Điều khoản dịch vụ
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// QR Waiting component – thiết kế lại sang trọng
function QRWaiting({ qrData, total, formatPrice }) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#FEFCF3] min-h-screen flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 shadow-xl overflow-hidden">
        <div className="relative p-6 text-center border-b border-amber-100">
          <button
            onClick={() => window.location.reload()}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <QrCodeIcon className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-gray-800">
            Quét mã để thanh toán
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Hệ thống sẽ tự động xác nhận sau khi nhận được tiền
          </p>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="bg-white p-2 rounded-xl border border-amber-200 shadow-sm">
            <img
              src={qrData.qr_url}
              alt="Mã QR thanh toán"
              className="w-56 h-56 object-contain"
            />
          </div>

          <div className="mt-6 w-full bg-amber-50/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Số tiền</span>
              <span className="font-bold text-amber-700 text-lg">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nội dung chuyển khoản</span>
              <span className="font-mono text-gray-800 font-semibold bg-white px-2 py-0.5 rounded">
                {qrData.transfer_content}
              </span>
            </div>
            <div className="mt-2 p-2 bg-amber-100/40 rounded-lg text-xs text-amber-800 flex items-start gap-1">
              <span className="text-amber-500">⚠️</span> Nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận.
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Đang chờ xác nhận thanh toán...
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-6 text-xs text-amber-600 hover:underline"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}