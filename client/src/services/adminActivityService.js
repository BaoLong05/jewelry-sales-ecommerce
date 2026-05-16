import axiosClient from "../api/axiosClient";
 
export const getActivityLogs = (params) =>
  axiosClient.get("/admin/activity-logs", { params });
 
export const getLoginLogs = (params) =>
  axiosClient.get("/admin/login-logs", { params });