import axiosClient from "../../api/axiosClient";

export const getUserProfile = () => axiosClient.get("/v1/profile");
export const updateUserProfile = (data) => axiosClient.put("/v1/profile", data);
