import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileOrders } from "../../../services/profileService/orderService";
import { formatCurrency, ORDER_STATUS_COLOR } from "../../../utils/formatters";

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "processing", label: "Đang chuẩn bị" },
  { key: "shipping", label: "Vận chuyển" },
  { key: "delivered", label: "Đã giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã huỷ" },
  { key: "refunded", label: "Đã hoàn tiền" },
];

export default function OrderListPage() {
  document.title = "Danh sách đơn hàng của bạn";
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProfileOrders({
        status: activeTab || undefined,
        search: search || undefined,
        page,
        per_page: 10,
      });
      setOrders(res.data.data ?? []);
      setMeta(res.data.meta ?? null);
    } catch (err) {
      if (err.response?.status === 422) {
        console.error("Validation error:", err.response.data.errors);
      } else {
        console.error(err);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  // Hàm tạo mảng trang để hiển thị phân trang dạng số
  const getPageNumbers = () => {
    if (!meta) return [];
    const total = meta.last_page;
    const current = meta.current_page;
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift("...");
    if (current + delta < total - 1) range.push("...");
    range.unshift(1);
    if (total !== 1) range.push(total);
    return range;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F0EDE5]">
          <h1 className="text-xl font-serif font-semibold text-gray-800">
            Đơn hàng của tôi
          </h1>
        </div>

        {/* Search */}
        <div className="px-6 pt-5">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo mã đơn hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 px-6 pt-4 pb-2 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${
                  activeTab === tab.key
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-3 opacity-50">📦</p>
              <p className="text-sm">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() =>
                    navigate(`/thong-tin-ca-nhan/don-hang/${order.order_code}`)
                  }
                  className="border border-[#E8E2D2] rounded-xl hover:shadow-md transition-all cursor-pointer overflow-hidden bg-white"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-amber-50/30 border-b border-[#F0EDE5]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Mã đơn:</span>
                      <span className="text-xs font-mono font-semibold text-gray-700">
                        {order.order_code}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_COLOR[order.status]}`}
                    >
                      {order.status_label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-amber-50/30 border-b border-[#F0EDE5]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Mã đơn:</span>
                      <span className="text-xs font-mono font-semibold text-gray-700">
                        {order.order_code}
                      </span>
                      {/* Badge trạng thái refund */}
                      {order.refund_status === "rejected" && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                          ❌ Từ chối
                        </span>
                      )}
                      {order.refund_status === "pending" && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-600">
                          ⏳ Đang chờ duyệt hoàn hàng
                        </span>
                      )}
                      {order.refund_status === "approved" && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-600">
                          ✅ Chấp nhận
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_COLOR[order.status]}`}
                    >
                      {order.status_label}
                    </span>
                  </div>

                  {/* Items preview */}
                  <div className="px-4 py-3">
                    {order.items?.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <img
                          src={item.product?.thumbnail || "/placeholder.png"}
                          alt={item.product?.name}
                          className="w-12 h-12 rounded-lg object-cover border border-amber-100 bg-amber-50 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            x{item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-400 mt-2 pl-14">
                        + {order.items.length - 2} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Order footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-dashed border-[#F0EDE5] bg-gray-50/20">
                    <span className="text-xs text-gray-500">
                      {order.created_at}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Tổng:</span>
                      <span className="text-base font-bold text-amber-700">
                        {formatCurrency(order.final_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center items-center gap-2 px-6 py-4 border-t border-[#F0EDE5] bg-gray-50/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              ‹
            </button>
            {getPageNumbers().map((p, idx) => (
              <button
                key={idx}
                onClick={() => typeof p === "number" && setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm transition ${
                  p === page
                    ? "bg-amber-500 text-white font-medium shadow-sm"
                    : typeof p === "number"
                      ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      : "cursor-default text-gray-400"
                }`}
                disabled={typeof p !== "number"}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
