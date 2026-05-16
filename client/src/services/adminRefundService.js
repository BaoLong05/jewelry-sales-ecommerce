import axiosClient from "../api/axiosClient";

export const getRefundRequests = (params) =>
  axiosClient.get("/admin/refund-requests", { params });

export const approveRefund = (id, admin_note) =>
  axiosClient.post(`/admin/refund-requests/${id}/approve`, { admin_note });

export const rejectRefund = (id, admin_note) =>
  axiosClient.post(`/admin/refund-requests/${id}/reject`, { admin_note });