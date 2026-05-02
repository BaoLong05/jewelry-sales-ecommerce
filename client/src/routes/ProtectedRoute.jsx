import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // chua login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // kiem tra url
  if (roles && !roles.includes(user.roles[0].name)) {
    return <Navigate to="/" />;
  }

  return children;
}