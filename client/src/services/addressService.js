import axiosClient from "../api/axiosClient";

export const getAddresses  = ()     => axiosClient.get("/v1/addresses");
export const createAddress = (data) => axiosClient.post("/v1/addresses", data);
export const updateAddress = (id, data) => axiosClient.put(`/v1/addresses/${id}`, data);
export const deleteAddress = (id)   => axiosClient.delete(`/v1/addresses/${id}`);