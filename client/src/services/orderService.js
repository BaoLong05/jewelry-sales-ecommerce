import axiosClient from "../api/axiosClient";

export const ListOrder = (params = {}) =>
  axiosClient.get("/v1/orders", { params });

export const showOrderDetail = (id) => axiosClient.get(`/v1/orders/${id}`);

export const updateStatusOrder = (id, data) =>
  axiosClient.patch(`/v1/orders/${id}/status`, data);
