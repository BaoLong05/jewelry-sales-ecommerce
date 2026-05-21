import axios from "axios";
import { navigateTo } from "../utils/navigate";

const axiosClient = axios.create({
  baseURL: "https://jewelry-sales-ecommerce-1.onrender.com/api",
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
