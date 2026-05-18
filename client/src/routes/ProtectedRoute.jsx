import { Navigate, useLocation } from "react-router-dom";

function CheckoutGuard({ children }) {
  const location = useLocation();

  const hasValidState =
    location.state?.selectedCartIds?.length > 0 || location.state?.buyNowItem;

  if (!hasValidState) {
    return <Navigate to="/gio-hang" replace />;
  }

  return children;
}
function OrderSuccessGuard({ children }) {
  const location = useLocation();

  const hasOrderCode = !!location.state?.orderCode;

  if (!hasOrderCode) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles) {
    const userRoles = user.roles?.map((r) => r.name) ?? [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export { CheckoutGuard, OrderSuccessGuard };
export default ProtectedRoute;
