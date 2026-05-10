import axios from "axios";
import { navigateTo } from "../utils/navigate";

const axiosClient = axios.create({
  baseURL: "http://192.168.33.13:8000/api",
});

// attach token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// global error
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/login");
    }
    return Promise.reject(err);
  },
);

export default axiosClient;
