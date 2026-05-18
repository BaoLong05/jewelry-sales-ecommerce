import { useNavigate, NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "tai-khoan", label: "Thông tin tài khoản", icon: "U" },
  { to: "don-hang", label: "Đơn hàng của tôi", icon: "O" },
];

export default function ProfilePage() {
  document.title = "Thông tin cá nhân";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="bg-[#FEFCF3] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-5 border-b border-[#F0EDE5]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-base shadow-sm">
                    U
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tài khoản</p>
                    <p className="text-xs text-gray-500">Thành viên</p>
                  </div>
                </div>
              </div>

              <nav className="py-2">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-amber-50 text-amber-700 font-medium border-r-2 border-amber-500"
                          : "text-gray-600 hover:bg-amber-50/30 hover:text-amber-600"
                      }`
                    }
                  >
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-[#F0EDE5] mt-2"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 text-xs font-semibold flex items-center justify-center">
                    X
                  </span>
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-[#E8E2D2] shadow-sm p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
