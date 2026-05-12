import axiosClient from "../api/axiosClient";

// API lấy danh sách sản phẩm trong giỏ hàng
export const getCart = (params = {}) => {
  return axiosClient.get("/v1/cart", { params });
};

// API thêm sản phẩm vào giỏ hàng
export const createCart = (data) => {
  return axiosClient.post("/v1/cart", data);
};

// API cập nhật sản phẩm trong giỏ hàng (số lượng, ...)
export const updateCart = (id, data) => {
  return axiosClient.put(`/v1/cart/${id}`, data);
};

// API xóa 1 sản phẩm khỏi giỏ hàng
export const deleteCartOneProduct = (id) => {
  return axiosClient.delete(`/v1/cart/${id}`);
};

// API xóa toàn bộ sản phẩm khỏi giỏ hàng
export const deleteCartAllProduct = () => {
  return axiosClient.delete("/v1/cart");
};