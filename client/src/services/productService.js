import axiosClient from "../api/axiosClient";

export const getProducts = (params) =>
  axiosClient.get("/v1/products", { params });

export const getProductById = (id) =>
  axiosClient.get(`/v1/products/${id}`);

export const createProduct = (data) =>
  axiosClient.post("/v1/products", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (id, data) =>
  axiosClient.post(`/v1/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (id) =>
  axiosClient.delete(`/v1/products/${id}`);