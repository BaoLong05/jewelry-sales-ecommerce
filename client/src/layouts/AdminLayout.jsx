import AdminSidebar from "../components/admin/AdminSidebar";
import { isAdminOrStaff } from "../utils/auth";

export default function AdminLayout({ children }) {
  if (!isAdminOrStaff()) return null;

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
