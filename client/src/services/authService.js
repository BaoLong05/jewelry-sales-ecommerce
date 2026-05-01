import axiosClient from "../api/axiosClient";

export const loginApi = (data) => {
  return axiosClient.post("auth/login",data);
};
export const registerApi = (data) => {
  return axiosClient.post("/auth/register", data);
};
export const getMeApi = () => {
  return axiosClient.get("/auth/me");
};
