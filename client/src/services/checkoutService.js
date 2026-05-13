import axiosClient from "../api/axiosClient";

export const placeOrder     = (data)  => axiosClient.post("/v1/checkout/place-order", data);
export const checkPaymentStatus = (id)=> axiosClient.get(`/v1/checkout/payment-status/${id}`);
export const verifyPaymentToken = (token) => axiosClient.get(`/v1/checkout/verify-token/${token}`);