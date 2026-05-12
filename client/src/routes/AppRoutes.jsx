import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// USER
import ProductList from "../pages/user/ProductList";
import ProductDetail from "../pages/user/ProductDetail";
import Cart from "../pages/user/Cart";

// ADMIN
import Category from "../pages/admin/Category";
import Product from "../pages/admin/Product";

// LAYOUT
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

// AUTH
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= AUTH ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= USER ================= */}
      <Route element={<UserLayout />}>
        {/* danh sach san pham */}
        <Route path="/san-pham" element={<ProductList />} />

        {/* detail có slug + id */}
        <Route path="/san-pham/:slugId" element={<ProductDetail />} />

        <Route path="/gio-hang" element={<Cart />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="categories" element={<Category />} />
        <Route path="products" element={<Product />} />
      </Route>
    </Routes>
  );
}