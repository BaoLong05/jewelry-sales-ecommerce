import axiosClient from "../api/axiosClient";

//lay danh sach danh muc
export const getCategories = (params) =>
  axiosClient.get("/v1/category", { params });

//them danh muc
export const createCategory = (data) => axiosClient.post("/v1/category", data);

//sua danh muc
export const updateCategory = (id, data) =>
  axiosClient.put(`/v1/category/${id}`, data);
//xoa danh muc
export const deleteCategory = (id) => axiosClient.delete(`/v1/category/${id}`);

//tim kiem
export const searchCategory = (keyword) =>
  axiosClient.get("/v1/category", {
    params: { search: keyword },
  });
