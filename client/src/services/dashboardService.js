import axiosClient from "../api/axiosClient";

export const getDashboardStats = () => 
  axiosClient.get("/v1/dashboard");

