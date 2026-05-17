import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin/thong-ke",  label: "Thống kê",          icon: "📊" },
  { to: "/admin/danh-muc",  label: "Quản lý danh mục",   icon: "🗂️" },
  { to: "/admin/san-pham",  label: "Quản lý sản phẩm",   icon: "📦" },
  { to: "/admin/don-hang",  label: "Quản lý đơn hàng",   icon: "🛍️" },
  { to: "/admin/hoan-hang", label: "Quản lý hoàn đơn",   icon: "↩️" },
  { to: "/admin/nhat-ky",   label: "Nhật ký hệ thống",   icon: "📋" },
  { to: "/admin/giam-gia", label: "Quản lý giảm giá", icon: "🎫" },
];

export default function AdminSidebar() {
  return (
    <div className="w-56 flex-shrink-0 h-screen sticky top-0 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <h2 className="text-lg font-bold text-amber-400">Admin</h2>
        <p className="text-xs text-gray-400 mt-0.5">Quản trị hệ thống</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
              ${isActive
                ? "bg-amber-500/20 text-amber-400 border-r-2 border-amber-400"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}