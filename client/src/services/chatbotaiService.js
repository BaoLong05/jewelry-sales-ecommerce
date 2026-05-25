import axiosClient from "../api/axiosClient";

export const chatbotAi = (data) =>
  axiosClient.post("/chatbot", data).then((res) => res.data);
