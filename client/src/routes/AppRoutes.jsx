import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout.jsx";
import CategoryPage from "../pages/admin/Category";

export default function AppRoutes() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* admin staff */}
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <AdminLayout>
              <CategoryPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}