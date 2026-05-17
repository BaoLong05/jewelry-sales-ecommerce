import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart, updateCart,
  deleteCartOneProduct, deleteCartAllProduct,
} from "../../services/cartService";
import { getImageUrl } from "../../utils/image";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function Cart() {
  document.title = "Giỏ hàng";
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      const items = res.data?.data?.items || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch {
      toast.error("Không thể tải giỏ hàng, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    if (cartItems.length === 0) { setSelectAll(false); return; }
    setSelectAll(selectedItems.length === cartItems.length);
  }, [selectedItems, cartItems]);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingId(cartItemId);
    try {
      const res = await updateCart(cartItemId, { quantity: newQuantity });
      await fetchCart();
      toast.success(res?.data?.message || "Cập nhật số lượng thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteCartOneProduct(itemId);
      setCartItems(prev => prev.filter(item => item.cart_item_id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch {
      toast.error("Xóa sản phẩm thất bại");
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "Xóa toàn bộ giỏ hàng?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Vâng, xóa hết!",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      try {
        await deleteCartAllProduct();
        setCartItems([]);
        setSelectedItems([]);
        setSelectAll(false);
        toast.success("Đã xóa toàn bộ giỏ hàng");
      } catch {
        toast.error("Xóa toàn bộ thất bại");
      }
    }
  };

  const toggleSelectItem = (cartItemId) => {
    setSelectedItems(prev =>
      prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) setSelectedItems([]);
    else setSelectedItems(cartItems.map(item => item.cart_item_id));
    setSelectAll(!selectAll);
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Chưa chọn sản phẩm nào để xóa");
      return;
    }
    const result = await Swal.fire({
      title: `Xóa ${selectedItems.length} sản phẩm?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Quay lại",
    });
    if (result.isConfirmed) {
      try {
        await Promise.all(selectedItems.map(id => deleteCartOneProduct(id)));
        await fetchCart();
        setSelectedItems([]);
        setSelectAll(false);
        toast.success(`Đã xóa ${selectedItems.length} sản phẩm`);
      } catch {
        toast.error("Xóa thất bại, vui lòng thử lại");
      }
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
     const selectedCartIds = cartItems.map(item => item.cart_item_id); 
    navigate("/thanh-toan", { state: { selectedCartIds: selectedItems } });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  // Tổng tiền sau giảm giá của các item được chọn
  const totalSelectedAmount = cartItems
    .filter(item => selectedItems.includes(item.cart_item_id))
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"/>
        <p className="mt-4 text-gray-500">Đang tải giỏ hàng...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 min-h-screen pb-28">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold text-gray-800 border-l-4 border-amber-500 pl-3 sm:pl-4">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 ml-4 sm:ml-5">
            Những món trang sức bạn đã chọn
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white/80 rounded-2xl shadow-md border border-amber-100/40 p-10 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-4"/>
            </svg>
            <p className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống</p>
            <p className="text-gray-400 text-sm mt-1">Hãy khám phá những bộ sưu tập tuyệt đẹp của Lumina Jewelry</p>
          </div>
        ) : (
          <>
            {/* Header desktop */}
            <div className="hidden md:flex items-center gap-4 px-4 py-3 mb-2 text-sm font-medium text-gray-500 bg-white/50 rounded-xl">
              <div className="w-8 flex justify-center">
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-400 cursor-pointer"/>
              </div>
              <div className="flex-1">Sản phẩm</div>
              <div className="w-32 text-center">Đơn giá</div>
              <div className="w-32 text-center">Số lượng</div>
              <div className="w-32 text-center">Thành tiền</div>
              <div className="w-16"/>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => {
                const isSelected = selectedItems.includes(item.cart_item_id);
                // ✅ hasDiscount đặt TRONG map, đúng scope
                const hasDiscount = item.product?.original_price &&
                                    item.product.original_price > item.price;
                const itemTotal = (item.price || 0) * (item.quantity || 0);

                return (
                  <div key={item.cart_item_id}
                    className={`bg-white/80 rounded-2xl shadow-sm border transition-all duration-200 p-4 md:p-5 ${
                      isSelected ? "border-amber-300 ring-1 ring-amber-200" : "border-amber-100/40 hover:shadow-md"
                    }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">

                      {/* Checkbox + ảnh mobile */}
                      <div className="flex items-start gap-3 md:w-8 md:block md:flex-shrink-0">
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleSelectItem(item.cart_item_id)}
                          className="w-5 h-5 mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-400 cursor-pointer"/>
                        <div className="md:hidden w-20 h-20 bg-amber-50 rounded-lg overflow-hidden border border-amber-100 flex-shrink-0">
                          {item?.product?.image_url
                            ? <img src={getImageUrl(item.product.image_url)} alt={item.product.name} className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-amber-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                              </div>
                          }
                        </div>
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="flex-1">
                        <div className="flex gap-3">
                          {/* Ảnh desktop */}
                          <div className="hidden md:block w-20 h-20 bg-amber-50 rounded-xl overflow-hidden border border-amber-100 flex-shrink-0">
                            {item?.product?.image_url
                              ? <img src={getImageUrl(item.product.image_url)} alt={item.product.name} className="w-full h-full object-cover"/>
                              : <div className="w-full h-full flex items-center justify-center text-amber-300">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                  </svg>
                                </div>
                            }
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-800 font-semibold leading-6 break-words">
                              {item?.product?.name}
                            </h3>
                            {/* Mobile: giá + số lượng */}
                            <div className="mt-2 grid grid-cols-2 gap-y-2 md:hidden">
                              <span className="text-gray-500 text-xs">Đơn giá</span>
                              <div className="text-right">
                                <span className="text-amber-700 font-semibold text-sm">{formatPrice(item.price)}</span>
                                {hasDiscount && (
                                  <span className="block text-gray-400 line-through text-xs">
                                    {formatPrice(item.product.original_price)}
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-500 text-xs">Số lượng</span>
                              <div className="flex justify-end">
                                <div className="flex items-center border border-gray-200 rounded-full bg-white">
                                  <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                                    disabled={updatingId === item.cart_item_id}
                                    className="px-2 py-1 text-gray-600 hover:text-amber-600 disabled:opacity-50">−</button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                                  <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                                    disabled={updatingId === item.cart_item_id}
                                    className="px-2 py-1 text-gray-600 hover:text-amber-600 disabled:opacity-50">+</button>
                                </div>
                              </div>
                              <span className="text-gray-500 text-xs">Thành tiền</span>
                              <span className="text-gray-800 font-semibold text-right">{formatPrice(itemTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop: đơn giá + số lượng + thành tiền + xóa */}
                      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                        <div className="w-32 text-center">
                          <p className="text-gray-700 font-medium">{formatPrice(item.price)}</p>
                          {hasDiscount && (
                            <p className="text-gray-400 line-through text-xs mt-0.5">
                              {formatPrice(item.product.original_price)}
                            </p>
                          )}
                        </div>
                        <div className="w-32 flex justify-center">
                          <div className="flex items-center border border-gray-200 rounded-full bg-white">
                            <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                              disabled={updatingId === item.cart_item_id}
                              className="px-3 py-1.5 text-gray-600 hover:text-amber-600 disabled:opacity-50">−</button>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                              disabled={updatingId === item.cart_item_id}
                              className="px-3 py-1.5 text-gray-600 hover:text-amber-600 disabled:opacity-50">+</button>
                          </div>
                        </div>
                        <div className="w-32 text-center font-semibold text-amber-700">
                          {formatPrice(itemTotal)}
                        </div>
                        <div className="w-16 flex justify-center">
                          <button onClick={() => handleRemoveItem(item.cart_item_id)}
                            className="text-rose-400 hover:text-rose-600 transition p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Mobile: nút xóa */}
                      <div className="md:hidden flex justify-end border-t border-gray-100 pt-3">
                        <button onClick={() => handleRemoveItem(item.cart_item_id)}
                          className="text-rose-500 hover:text-rose-700 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Xóa sản phẩm
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button onClick={handleRemoveSelected}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition text-sm">
                Xóa đã chọn ({selectedItems.length})
              </button>
              <button onClick={handleClearCart}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm">
                Xóa toàn bộ giỏ
              </button>
            </div>
          </>
        )}
      </div>

      {/* Thanh bottom cố định */}
      {cartItems.length > 0 && selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-100 shadow-2xl rounded-t-2xl z-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-gray-600 text-sm">
                  Đã chọn <strong className="text-amber-700">{selectedItems.length}</strong> sản phẩm
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Tổng tiền:</span>
                  <span className="text-xl md:text-2xl font-bold text-amber-700">
                    {formatPrice(totalSelectedAmount)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={handleRemoveSelected}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition text-sm">
                  Xóa các mục
                </button>
                <button onClick={handleCheckout}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition text-sm sm:text-base">
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}