import axiosClient from "../api/axiosClient";

export const getProductReviews = (productId, params) =>
  axiosClient.get(`/products/${productId}/reviews`, { params });
