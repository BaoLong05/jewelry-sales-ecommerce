import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Admin</h2>

      <ul className="space-y-3">
        <li>
          <Link to="/admin" className="hover:text-amber-400">
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/admin/categories" className="hover:text-amber-400">
            Quản lý danh mục
          </Link>
        </li>

        <li>
          <Link to="/admin/products" className="hover:text-amber-400">
            Quản lý sản phẩm
          </Link>
        </li>

        <li>
          <Link to="/admin/orders" className="hover:text-amber-400">
            Quản lý đơn hàng
          </Link>
        </li>
      </ul>
    </div>
  );
}