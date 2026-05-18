import axios from "axios";

const axiosChatbot = axios.create({
  baseURL: "http://192.168.33.13:8000/api",
  headers: { "Content-Type": "application/json" },
});

export const chatbotAi = (data) =>
  axiosChatbot.post("/chatbot", data).then((res) => res.data);
