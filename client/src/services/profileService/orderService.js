import axiosClient from "../../api/axiosClient";

//lay ra danh sach don hang cua user
// Lấy danh sách đơn hàng
export const getProfileOrders = (params) =>
  axiosClient.get("/user/orders", { params });  // ✅ arrow function không có {} tự return

// Chi tiết đơn hàng
export const getProfileOrderDetail = (orderCode) =>
  axiosClient.get(`/user/orders/${orderCode}`); // ✅

//danh gia san pham
export const submitReiew = (orderCode, orderItemId, data) => {
  const formData = new FormData();
  formData.append("rating", data.rating);
  if (data.comment) formData.append("comment", data.comment);
  if (data.images?.length) {
    data.images.forEach((img) => formData.append("images[]", img));
  }
  return axiosClient.post(
    `/user/orders/${orderCode}/items/${orderItemId}/review`,
    formData,
  );
};

//gui request hoan hang
export const submitRefundRequest = (orderCode, orderItemId, data) => {
  const formData = new FormData();
  formData.append("reason", data.reason);
  if (data.images?.length) {
    data.images.forEach((img) => formData.append("images[]", img));
  }
  return axiosClient.post(
    `/user/orders/${orderCode}/items/${orderItemId}/refund`,
    formData,
  );
};
