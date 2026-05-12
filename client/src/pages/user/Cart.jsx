import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  createCart,
  updateCart,
  deleteCartOneProduct,
  deleteCartAllProduct,
} from "../../services/cartService";
import { getImageUrl } from "../../utils/image";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // State cho checkbox
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      const items = res.data?.data.items || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      toast.error("Không thể tải giỏ hàng, vui lòng thử lại sau!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingId(cartItemId);
    try {
      const res = await updateCart(cartItemId, { quantity: newQuantity });
      await fetchCart();
      toast.success(res?.data?.message || "Cập nhật số lượng thành công");
    } catch (error) {
      const message =
        error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteCartOneProduct(itemId);
      setCartItems((prev) =>
        prev.filter((item) => item.cart_item_id !== itemId)
      );
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại");
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "Xóa toàn bộ giỏ hàng?",
      text: "Bạn sẽ mất tất cả sản phẩm trong giỏ. Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Vâng, xóa hết!",
      cancelButtonText: "Hủy",
      background: "#fff",
      customClass: {
        popup: "rounded-2xl",
        title: "font-serif text-gray-800",
        confirmButton: "bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg",
        cancelButton: "bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg",
      },
    });
    if (result.isConfirmed) {
      try {
        await deleteCartAllProduct();
        setCartItems([]);
        setSelectedItems([]);
        setSelectAll(false);
        toast.success("Đã xóa toàn bộ giỏ hàng");
      } catch (error) {
        toast.error("Xóa toàn bộ thất bại");
      }
    }
  };

  const toggleSelectItem = (cartItemId) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.cart_item_id));
    }
    setSelectAll(!selectAll);
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Chưa chọn sản phẩm nào để xóa");
      return;
    }
    const result = await Swal.fire({
      title: `Xóa ${selectedItems.length} sản phẩm?`,
      text: "Các sản phẩm này sẽ bị xóa khỏi giỏ hàng. Bạn có chắc chắn?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Quay Lại",
      background: "#fff",
      customClass: {
        popup: "rounded-2xl",
        title: "font-serif text-gray-800",
      },
    });
    if (result.isConfirmed) {
      try {
        await Promise.all(selectedItems.map((id) => deleteCartOneProduct(id)));
        await fetchCart();
        setSelectedItems([]);
        setSelectAll(false);
        toast.success(`Đã xóa ${selectedItems.length} sản phẩm`);
      } catch (error) {
        toast.error("Xóa thất bại, vui lòng thử lại");
      }
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    navigate("/checkout", { state: { selectedCartIds: selectedItems } });
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      setSelectAll(false);
      return;
    }
    setSelectAll(selectedItems.length === cartItems.length);
  }, [selectedItems, cartItems]);

  const totalSelectedAmount = cartItems
    .filter((item) => selectedItems.includes(item.cart_item_id))
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-amber-100/40 p-6 sm:p-10 text-center">
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-4"
              />
            </svg>
            <p className="text-gray-500 text-base sm:text-lg">Giỏ hàng của bạn đang trống</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Hãy khám phá những bộ sưu tập tuyệt đẹp của Lumina Jewelry
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-3 mb-2 text-sm font-medium text-gray-500 bg-white/50 rounded-xl">
              <div className="w-8 flex justify-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-400 cursor-pointer"
                />
              </div>
              <div className="flex-1">Sản phẩm</div>
              <div className="w-28 lg:w-32 text-center">Đơn giá</div>
              <div className="w-28 lg:w-32 text-center">Số lượng</div>
              <div className="w-28 lg:w-32 text-center">Thành tiền</div>
              <div className="w-16"></div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => {
                const isSelected = selectedItems.includes(item.cart_item_id);
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                return (
                  <div
                    key={item.cart_item_id}
                    className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border transition-all duration-200 p-3 sm:p-4 md:p-5 ${
                      isSelected
                        ? "border-amber-300 ring-1 ring-amber-200"
                        : "border-amber-100/40 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                      {/* Checkbox + ảnh (luôn nằm cùng hàng trên mobile) */}
                      <div className="flex items-start gap-3 md:w-8 md:block md:flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.cart_item_id)}
                          className="w-5 h-5 mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-400 cursor-pointer"
                        />
                        <div className="md:hidden w-20 h-20 bg-amber-50 rounded-lg overflow-hidden border border-amber-100 flex-shrink-0">
                          {item?.product?.image_url ? (
                            <img
                              src={getImageUrl(item.product.image_url)}
                              alt={item?.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-300">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          {/* Ảnh desktop */}
                          <div className="hidden md:block w-20 lg:w-24 h-20 lg:h-24 bg-amber-50 rounded-xl overflow-hidden border border-amber-100 flex-shrink-0">
                            {item?.product?.image_url ? (
                              <img
                                src={getImageUrl(item.product.image_url)}
                                alt={item?.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-amber-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3
                              className="text-gray-800 text-base sm:text-lg font-semibold leading-6 break-words pr-2"
                              style={{ fontFamily: "'Inter', sans-serif", wordBreak: "break-word" }}
                            >
                              {item?.product?.name}
                            </h3>
                            {item?.product?.description && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                                {item.product.description.length > 50
                                  ? item.product.description.slice(0, 50) + "..."
                                  : item.product.description}
                              </p>
                            )}
                            <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-2 md:hidden">
                              <div className="text-gray-500 text-xs">Đơn giá</div>
                              <div className="text-amber-700 font-semibold text-right">
                                {formatPrice(item.price)}
                              </div>
                              <div className="text-gray-500 text-xs">Số lượng</div>
                              <div className="flex justify-end">
                                <div className="flex items-center border border-gray-200 rounded-full bg-white">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                                    disabled={updatingId === item.cart_item_id}
                                    className="px-2 py-1 text-gray-600 hover:text-amber-600 disabled:opacity-50 touch-manipulation"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                                    disabled={updatingId === item.cart_item_id}
                                    className="px-2 py-1 text-gray-600 hover:text-amber-600 disabled:opacity-50 touch-manipulation"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="text-gray-500 text-xs">Thành tiền</div>
                              <div className="text-gray-800 font-semibold text-right">
                                {formatPrice(itemTotal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-3 lg:gap-4 flex-1">
                        <div className="w-28 lg:w-32 text-center text-gray-700 font-medium">
                          {formatPrice(item.price)}
                        </div>
                        <div className="w-28 lg:w-32 flex justify-center">
                          <div className="flex items-center border border-gray-200 rounded-full bg-white">
                            <button
                              onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                              disabled={updatingId === item.cart_item_id}
                              className="px-2 lg:px-3 py-1.5 text-gray-600 hover:text-amber-600 disabled:opacity-50 touch-manipulation"
                            >
                              -
                            </button>
                            <span className="w-8 lg:w-10 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                              disabled={updatingId === item.cart_item_id}
                              className="px-2 lg:px-3 py-1.5 text-gray-600 hover:text-amber-600 disabled:opacity-50 touch-manipulation"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-28 lg:w-32 text-center font-semibold text-amber-700">
                          {formatPrice(itemTotal)}
                        </div>
                        <div className="w-16 flex justify-center">
                          <button
                            onClick={() => handleRemoveItem(item.cart_item_id)}
                            className="text-rose-400 hover:text-rose-600 transition p-1 touch-manipulation"
                            title="Xóa sản phẩm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="md:hidden flex justify-end border-t border-gray-100 pt-3 mt-2">
                        <button
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          className="text-rose-500 hover:text-rose-700 text-sm flex items-center gap-1 touch-manipulation"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa sản phẩm
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
              <button
                onClick={handleRemoveSelected}
                className="order-2 sm:order-1 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition font-medium text-sm touch-manipulation"
              >
                Xóa đã chọn ({selectedItems.length})
              </button>
              <button
                onClick={handleClearCart}
                className="order-1 sm:order-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition font-medium text-sm touch-manipulation"
              >
                Xóa toàn bộ giỏ
              </button>
            </div>
          </>
        )}
      </div>
      {cartItems.length > 0 && selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-100 shadow-2xl rounded-t-2xl z-50 animate-slide-up">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Thông tin số lượng và tổng tiền */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Đã chọn <strong className="text-amber-700">{selectedItems.length}</strong> sản phẩm
                </span>
                <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-xs sm:text-sm">Tổng tiền:</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-amber-700">
                    {formatPrice(totalSelectedAmount)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRemoveSelected}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition font-medium text-sm touch-manipulation"
                >
                  Xóa các mục
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-semibold rounded-xl shadow-md transition text-sm sm:text-base touch-manipulation"
                >
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