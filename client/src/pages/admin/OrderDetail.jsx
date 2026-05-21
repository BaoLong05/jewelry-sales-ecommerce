import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { showOrderDetail, updateStatusOrder } from "../../services/orderService";
import {
    ORDER_STATUSES,
    getStatusLabel,
    getStatusColor,
    getPaymentStatusLabel,
    getPaymentStatusColor,
} from "../../utils/orderStatus";

const parseAddress = (address) => {
    try {
        return typeof address === "string" ? JSON.parse(address) : address;
    } catch {
        return null;
    }
};

export default function OrderDetail() {
    document.title = "Chi tiết đơn hàng";
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const res = await showOrderDetail(id);
            const orderData = res.data.data;
            setOrder(orderData);
            setSelectedStatus(orderData.status);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Không thể tải chi tiết đơn hàng"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus || selectedStatus === order.status) return;
        setUpdating(true);
        try {
            const res = await updateStatusOrder(id, { status: selectedStatus });
            toast.success(res.data.message || "Cập nhật trạng thái thành công");
            await fetchOrderDetail();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Không thể cập nhật trạng thái"
            );
        } finally {
            setUpdating(false);
        }
    };

    const formatPrice = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value || 0);

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="text-center py-20 text-gray-400">
                    Đang tải chi tiết đơn hàng...
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="text-center py-20 text-gray-400">
                    Không tìm thấy đơn hàng
                </div>
            </div>
        );
    }

    const addr = parseAddress(order.address);
    const amountDue =
        order.payment?.status === "paid" && order.payment?.method !== "cod"
            ? 0
            : order.total_price;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header + nút quay lại */}
            <div className="mb-6">
                <Link
                    to="/admin/don-hang"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    ← Quay lại danh sách đơn hàng
                </Link>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Chi tiết đơn hàng #{order.id}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">{order.order_code}</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Tạo lúc {new Date(order.created_at).toLocaleString("vi-VN")}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                        </span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment?.status)}`}>
                            {getPaymentStatusLabel(order.payment?.status)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Thông tin chung - 3 card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Khách hàng */}
                <div className="border border-gray-100 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Thông tin khách hàng
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-500">Họ tên</p>
                            <p className="font-medium text-gray-800">
                                {order.user?.name || "Không có dữ liệu"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium text-gray-800">
                                {order.user?.email || "Không có dữ liệu"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Địa chỉ giao hàng */}
                <div className="border border-gray-100 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Địa chỉ giao hàng
                    </h2>
                    {addr ? (
                        <div className="space-y-2 text-sm text-gray-700">
                            <div>
                                <span className="text-gray-500">Người nhận: </span>
                                <span className="font-medium">{addr.receiver_name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">SĐT: </span>
                                <span className="font-medium">{addr.phone}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Địa chỉ: </span>
                                <span className="font-medium">
                                    {[addr.street, addr.ward, addr.district, addr.province]
                                        .filter(Boolean)
                                        .join(", ")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Chưa có địa chỉ</p>
                    )}
                </div>

                {/* Thanh toán */}
                <div className="border border-gray-100 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Thanh toán
                    </h2>
                    {order.payment ? (
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Phương thức</p>
                                <p className="font-medium uppercase">{order.payment.method}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Trạng thái</p>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                                    {getPaymentStatusLabel(order.payment.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-500">Số tiền</p>
                                <p className="font-medium text-green-600">
                                    {formatPrice(amountDue)}
                                </p>
                            </div>
                            {order.payment.paid_at && (
                                <div>
                                    <p className="text-gray-500">Thanh toán lúc</p>
                                    <p className="font-medium">
                                        {new Date(order.payment.paid_at).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Chưa có thông tin thanh toán</p>
                    )}
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Sản phẩm trong đơn hàng
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3 text-gray-500 font-medium">Sản phẩm</th>
                                <th className="text-center px-5 py-3 text-gray-500 font-medium">Số lượng</th>
                                <th className="text-right px-5 py-3 text-gray-500 font-medium">Đơn giá gốc</th>
                                <th className="text-right px-5 py-3 text-gray-500 font-medium">Đơn giá sau giảm</th>
                                <th className="text-right px-5 py-3 text-gray-500 font-medium">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {order.items?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-gray-800">
                                            {item.product?.name || "Sản phẩm đã bị xóa"}
                                        </p>
                                        <p className="text-xs text-gray-400">ID: {item.product_id}</p>
                                    </td>
                                    <td className="px-5 py-4 text-center font-medium">
                                        {item.quantity}
                                    </td>
                                    <td className="px-5 py-4 text-right text-gray-400 line-through">
                                        {formatPrice(item.original_price)}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {formatPrice(item.price)}
                                    </td>
                                    <td className="px-5 py-4 text-right font-semibold text-red-600">
                                        {formatPrice(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-100">
                            {order.discount_amount > 0 && (
                                <tr>
                                    <td colSpan="4" className="px-5 py-2 text-right text-sm text-gray-500">
                                        Giảm giá
                                    </td>
                                    <td className="px-5 py-2 text-right text-sm text-green-600 font-medium">
                                        -{formatPrice(order.discount_amount)}
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan="4" className="px-5 py-4 text-right font-semibold text-gray-700">
                                    Tổng cộng
                                </td>
                                <td className="px-5 py-4 text-right text-lg font-bold text-red-600">
                                    {formatPrice(amountDue)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Cập nhật trạng thái */}
            <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Cập nhật trạng thái đơn hàng
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    Chỉ cập nhật tiến độ giao hàng. Trạng thái thanh toán được xử lý tự động.
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {getStatusLabel(status)}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleUpdateStatus}
                        disabled={updating || selectedStatus === order.status}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                    >
                        {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                    </button>
                </div>
            </div>
        </div>
    );
}
