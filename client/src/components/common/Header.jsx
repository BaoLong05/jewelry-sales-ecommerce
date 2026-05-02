import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${keyword}`);
  };

  const token = localStorage.getItem("token");

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-amber-700">
          LUMINA
        </Link>

        <form onSubmit={handleSearch} className="flex w-1/2">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="w-full px-4 py-2 border rounded-l-lg focus:outline-none"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="bg-amber-600 text-white px-4 rounded-r-lg">
            Tìm
          </button>
        </form>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-700 hover:text-amber-600">
            Trang chủ
          </Link>

          <Link to="/products" className="text-gray-700 hover:text-amber-600">
            Sản phẩm
          </Link>
          <button onClick={() => navigate("/cart")} className="relative">
            🛒
          </button>

          {token ? (
            <div className="relative group">
              <div className="w-8 h-8 bg-gray-300 rounded-full cursor-pointer" />

              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded hidden group-hover:block">
                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Cá nhân
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Đơn hàng
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-amber-600">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
