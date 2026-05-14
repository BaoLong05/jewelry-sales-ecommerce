export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "paid",
  "shipping",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
];

export const ORDER_STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  paid: "Đã thanh toán",
  shipping: "Đang giao",
  delivered: "Đã giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  paid: "bg-green-100 text-green-700",
  shipping: "bg-purple-100 text-purple-700",
  delivered: "bg-cyan-100 text-cyan-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export const getStatusLabel = (status) =>
  ORDER_STATUS_LABELS[status] || status;

export const getStatusColor = (status) =>
  ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
