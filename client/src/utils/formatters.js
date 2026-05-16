export const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export const ORDER_STATUS_COLOR = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipping:   "bg-cyan-100 text-cyan-700",
  delivered:  "bg-green-100 text-green-700",
  completed:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-600",
};

export const PROGRESS_STEPS = [
  { key: "pending",    label: "Chờ xác nhận" },
  { key: "confirmed",  label: "Đã xác nhận" },
  { key: "processing", label: "Đang chuẩn bị" },
  { key: "shipping",   label: "Vận chuyển" },
  { key: "delivered",  label: "Đã giao" },
  { key: "completed",  label: "Hoàn thành" },
];