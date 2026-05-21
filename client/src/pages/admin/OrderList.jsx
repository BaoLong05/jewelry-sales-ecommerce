import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ListOrder } from "../../services/orderService";
import {
    ORDER_STATUSES,
    getStatusLabel,
    getStatusColor,
    getPaymentStatusLabel,
    getPaymentStatusColor,
} from "../../utils/orderStatus";

export default function OrderList() {
    document.title = "Quản lý đơn hàng";
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

    const handleReset = () => {
        setFilters({ search: "", status: "", page: 1, per_page: 10 });
        fetchOrders();
    };

    const formatPrice = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value || 0);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Quản lý đơn hàng
                </h1>
                {/* Giữ nguyên không có nút thêm vì logic không yêu cầu */}
            </div>
            <p className="text-sm text-gray-500 mt-1 mb-5">
                Theo dõi và cập nhật trạng thái đơn hàng
            </p>

            {/* Bộ lọc - style theo Product */}
            <div className="flex flex-wrap gap-3 mb-5">
                <input
                    type="text"
                    placeholder="Tìm theo mã đơn, tên khách hàng..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                />

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
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
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                    Tìm kiếm
                </button>

                <button
                    onClick={handleReset}
                    className="border border-gray-200 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                    Reset
                </button>
            </div>

            {/* Bảng dữ liệu */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Không có đơn hàng nào</div>
            ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Mã đơn</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Khách hàng</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Tổng tiền</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Trạng thái đơn</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Thanh toán</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày tạo</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            #{order.id}
                                            <div className="text-xs text-gray-400 font-normal">
                                                {order.order_code}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{order.user?.name}</div>
                                            <div className="text-sm text-gray-500">{order.user?.email}</div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-blue-600">
                                            {formatPrice(order.total_price)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment?.status)}`}>
                                                {getPaymentStatusLabel(order.payment?.status)}
                                            </span>
                                            <div className="text-xs text-gray-400 mt-1 uppercase">
                                                {order.payment?.method}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                to={`/admin/chi-tiet-don-hang/${order.id}`}
                                                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition inline-block"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Phân trang */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        disabled={pagination.current_page === 1}
                        onClick={() => setFilters((prev) => ({ ...prev, page: pagination.current_page - 1 }))}
                        className="w-8 h-8 border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-gray-300 transition text-sm"
                    >
                        ‹
                    </button>
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setFilters((prev) => ({ ...prev, page }))}
                            className={`w-8 h-8 rounded-lg text-sm border transition ${
                                page === pagination.current_page
                                    ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        disabled={pagination.current_page === pagination.last_page}
                        onClick={() => setFilters((prev) => ({ ...prev, page: pagination.current_page + 1 }))}
                        className="w-8 h-8 border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-gray-300 transition text-sm"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}