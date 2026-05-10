const BASE_URL = "http://192.168.33.13:8000";

export const getImageUrl = (path) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path; 
  return `${BASE_URL}/${path}`;
};