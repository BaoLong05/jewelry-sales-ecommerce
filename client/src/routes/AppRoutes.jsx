import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// USER
import ProductList from "../pages/user/ProductList";
import ProductDetail from "../pages/user/ProductDetail";
import Cart from "../pages/user/Cart";
import AddressForm from "../pages/user/AddressForm";
import Checkout from "../pages/user/Checkout";
import OrderSuccess from "../pages/user/OrderSuccess";

// ADMIN
import Category from "../pages/admin/Category";
import Product from "../pages/admin/Product";
import OrderList from "../pages/admin/OrderList";
import OrderDetail from "../pages/admin/OrderDetail";

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

        <Route path="/dia-chi" element={<AddressForm />} />
        <Route path="/thanh-toan-thanh-cong" element={<OrderSuccess />} />
        <Route path="/thanh-toan" element={<Checkout />} />

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
        <Route path="don-hang" element={<OrderList />} />
        <Route path="danh-muc" element={<Category />} />
        <Route path="san-pham" element={<Product />} />
        <Route path="chi-tiet-don-hang/:id" element={<OrderDetail />} />
      </Route>
    </Routes>
  );
}