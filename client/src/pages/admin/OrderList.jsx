
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ListOrder } from "../../services/OrderService";
import {
  ORDER_STATUSES,
  getStatusLabel,
  getStatusColor,
} from "../../utils/orderStatus";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    per_page: 10,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters.page]);

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const res = await ListOrder(filters);
      const data = res.data.data;

      setOrders(data.data || []);
      setPagination(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <p className="text-gray-500 mt-1">Theo dõi và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Tìm theo mã đơn, tên khách hàng..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          className="border rounded-xl px-4 py-2"
        />

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="border rounded-xl px-4 py-2"
        >
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2"
        >
          Tìm kiếm
        </button>

        <button
          onClick={() => {
            setFilters({
              search: "",
              status: "",
              page: 1,
              per_page: 10,
            });
            fetchOrders();
          }}
          className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2"
        >
          Reset
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có đơn hàng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Tổng tiền</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">#{order.id}</td>
                    <td className="px-4 py-3">
                      <div>{order.user?.name}</div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-red-600">
                      {formatPrice(order.total_price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/admin/chi-tiet-don-hang/${order.id}`}
                        className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Phân trang */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page }))
                }
                className={`px-4 py-2 rounded-lg border ${
                  page === pagination.current_page
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}