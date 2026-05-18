import axiosClient from "../api/axiosClient";

export const getUserSupportMessages = () => axiosClient.get("/v1/support-chat");
export const sendUserSupportMessage = (message) =>
  axiosClient.post("/v1/support-chat/messages", { message });

export const getAdminConversations = () => axiosClient.get("/admin/support-conversations");
export const getAdminConversationMessages = (conversationId) =>
  axiosClient.get(`/admin/support-conversations/${conversationId}`);
export const sendAdminSupportMessage = (conversationId, message) =>
  axiosClient.post(`/admin/support-conversations/${conversationId}/messages`, { message });
