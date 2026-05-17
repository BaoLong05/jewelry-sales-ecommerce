import axiosClient from "../api/axiosClient";

export const getDiscounts     = (params) => axiosClient.get("/v1/discounts", { params });
export const getDiscountById  = (id)     => axiosClient.get(`/v1/discounts/${id}`);
export const createDiscount   = (data)   => axiosClient.post("/v1/discounts", data);
export const updateDiscount   = (id, data) => axiosClient.put(`/v1/discounts/${id}`, data);
export const deleteDiscount   = (id)     => axiosClient.delete(`/v1/discounts/${id}`);

export const getProductsForDiscount = (params) =>
  axiosClient.get("/v1/products", { params });