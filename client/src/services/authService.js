import axiosClient from "../api/axiosClient";

//dang nhap
export const loginApi = (data) => {
  return axiosClient.post("auth/login", data);
};
//dang ky
export const registerApi = (data) => {
  return axiosClient.post("/auth/register", data);
};
//lay user hien tai
export const getMeApi = () => {
  return axiosClient.get("/auth/me");
};
//dang nhap google
export const loginWithGoogle = (token) => {
  return axiosClient.post("/auth/google", {
    token: token,
  });
};
