import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin/thong-ke", label: "Thống kê", icon: "TK" },
  { to: "/admin/danh-muc", label: "Quản lý danh mục", icon: "DM" },
  { to: "/admin/san-pham", label: "Quản lý sản phẩm", icon: "SP" },
  { to: "/admin/don-hang", label: "Quản lý đơn hàng", icon: "DH" },
  { to: "/admin/hoan-hang", label: "Quản lý hoàn đơn", icon: "HH" },
  { to: "/admin/tin-nhan", label: "Tin nhắn khách hàng", icon: "TN" },
  { to: "/admin/nhat-ky", label: "Nhật ký hệ thống", icon: "NK" },
  { to: "/admin/giam-gia", label: "Quản lý giảm giá", icon: "GG" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-56 flex-shrink-0 h-screen sticky top-0 bg-gray-900 text-white flex flex-col">
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
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-amber-500/20 text-amber-400 border-r-2 border-amber-400"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span className="w-7 h-7 rounded bg-gray-800 text-[11px] font-bold flex items-center justify-center">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-700 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
        >
          <span className="w-7 h-7 rounded bg-rose-500/10 text-[11px] font-bold flex items-center justify-center">
            DX
          </span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
