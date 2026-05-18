import AdminSidebar from "../components/admin/AdminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Lumina Admin</h1>
            <p className="text-xs text-gray-500">Quản trị cửa hàng</p>
          </div>
          <span className="text-sm text-gray-500">Khu vực quản trị</span>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
