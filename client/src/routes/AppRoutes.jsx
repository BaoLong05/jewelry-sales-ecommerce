import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";

// USER
import ProductList   from "../pages/user/ProductList";
import ProductDetail from "../pages/user/ProductDetail";
import Cart          from "../pages/user/Cart";
import Checkout      from "../pages/user/Checkout";
import OrderSuccess  from "../pages/user/OrderSuccess";

// PROFILE
import ProfilePage     from "../pages/user/profile/ProfilePage";
import OrderDetailPage from "../pages/user/profile/OrderDetailPage";
import OrderListPage   from "../pages/user/profile/OrderListPage";

// ADMIN
import Category           from "../pages/admin/Category";
import Product            from "../pages/admin/Product";
import OrderList          from "../pages/admin/OrderList";
import AdminOrderDetail   from "../pages/admin/OrderDetail";
import RefundManagement   from "../pages/admin/RefundManagement";
import ManageActivity     from "../pages/admin/ManageActivity";
import Dashboard          from "../pages/admin/Dashboard";
import DiscountManagement from "../pages/admin/DiscountManagement";

// LAYOUT
import AdminLayout from "../layouts/AdminLayout";
import UserLayout  from "../layouts/UserLayout";

// GUARDS
import ProtectedRoute, { CheckoutGuard } from "./ProtectedRoute";

// CHATBOT — chỉ dùng ở trang sản phẩm
import ChatBotAI from "../pages/ChatBotAI ";

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* USER */}
      <Route element={<UserLayout />}>
        <Route index element={<Navigate to="/san-pham" replace />} />
        <Route path="/" element={<Navigate to="/san-pham" replace />} />
        <Route
          path="/san-pham"
          element={
            <>
              <ProductList />
              <ChatBotAI title="Trợ lý AI" placeholder="Nhập tin nhắn..." />
            </>
          }
        />
        <Route
          path="/san-pham/:slugId"
          element={
            <>
              <ProductDetail />
              <ChatBotAI title="Trợ lý AI" placeholder="Nhập tin nhắn..." />
            </>
          }
        />

        <Route path="/gio-hang" element={<Cart />} />

        <Route
          path="/dia-chi"
          element={<CheckoutGuard><Checkout /></CheckoutGuard>}
        />
        <Route
          path="/thanh-toan"
          element={<CheckoutGuard><Checkout /></CheckoutGuard>}
        />

        <Route path="/thanh-toan-thanh-cong" element={<OrderSuccess />} />

        <Route
          path="/thong-tin-ca-nhan"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        >
          <Route index                      element={<OrderListPage />} />
          <Route path="don-hang"            element={<OrderListPage />} />
          <Route path="don-hang/:orderCode" element={<OrderDetailPage />} />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index             element={<Dashboard />} />
        <Route path="thong-ke"   element={<Dashboard />} />
        <Route path="don-hang"   element={<OrderList />} />
        <Route path="danh-muc"   element={<Category />} />
        <Route path="san-pham"   element={<Product />} />
        <Route path="chi-tiet-don-hang/:id" element={<AdminOrderDetail />} />
        <Route path="hoan-hang"  element={<RefundManagement />} />
        <Route path="nhat-ky"    element={<ManageActivity />} />
        <Route path="giam-gia"   element={<DiscountManagement />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}