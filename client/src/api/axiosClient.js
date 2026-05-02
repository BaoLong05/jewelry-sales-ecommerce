import axios from "axios";
import { navigateTo } from "../utils/navigate";

const axiosClient = axios.create({
  baseURL: "http://192.168.33.13:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

//tu dong gan token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//xu ly global
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/login");
    }
    return Promise.reject(error);
  },
);
export default axiosClient;
