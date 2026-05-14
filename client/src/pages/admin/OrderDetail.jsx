// src/pages/admin/OrderDetail.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  showOrderDetail,
  updateStatusOrder,
} from "../../services/OrderService";
import {
  ORDER_STATUSES,
  getStatusLabel,
  getStatusColor,
} from "../../utils/orderStatus";

export default function OrderDetail() {
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
      const res = await updateStatusOrder(id, {
        status: selectedStatus,
      });

      toast.success(
        res.data.message || "Cập nhật trạng thái đơn hàng thành công"
      );

      await fetchOrderDetail();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái đơn hàng"
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-10 text-center text-gray-500">
          Đang tải chi tiết đơn hàng...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-10 text-center text-gray-500">
          Không tìm thấy đơn hàng
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to="/admin/don-hang"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Quay lại danh sách đơn hàng
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mt-2">
            Chi tiết đơn hàng #{order.id}
          </h1>

          <p className="text-gray-500 mt-1">
            Tạo lúc{" "}
            {new Date(order.created_at).toLocaleString("vi-VN")}
          </p>
        </div>

        <span
          className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Thông tin chung */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Khách hàng */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
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

        {/* Giao hàng */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Địa chỉ giao hàng
          </h2>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {order.address || "Chưa có địa chỉ"}
          </p>
        </div>

        {/* Thanh toán */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Thanh toán
          </h2>

          {order.payment ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Phương thức</p>
                <p className="font-medium uppercase">
                  {order.payment.method}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Số tiền</p>
                <p className="font-medium text-green-600">
                  {formatPrice(order.payment.amount)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Ngày thanh toán</p>
                <p className="font-medium">
                  {new Date(
                    order.payment.payment_date
                  ).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Chưa có thông tin thanh toán
            </p>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Sản phẩm trong đơn hàng
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Đơn giá
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Thành tiền
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items?.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product?.name || "Sản phẩm đã bị xóa"}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {item.product_id}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center font-medium">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {formatPrice(item.price)}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-red-600">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-4 text-right font-semibold text-gray-700"
                >
                  Tổng cộng
                </td>
                <td className="px-6 py-4 text-right text-xl font-bold text-red-600">
                  {formatPrice(order.total_price)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cập nhật trạng thái */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Cập nhật trạng thái đơn hàng
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-xl px-4 py-3 flex-1"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>

          <button
            onClick={handleUpdateStatus}
            disabled={
              updating || selectedStatus === order.status
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium"
          >
            {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
          </button>
        </div>
      </div>
    </div>
  );
}