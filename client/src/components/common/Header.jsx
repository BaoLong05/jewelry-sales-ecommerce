import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart } from "../../services/cartService";

export default function Header() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/san-pham?search=${keyword}`);
    setMobileMenuOpen(false);
  };

  // load cart
  const loadCart = () => {
    try {
      const data = JSON.parse(localStorage.getItem("gio-hang")) || [];
      setCart(data);
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    const loadCart = async () => {
      const res = await getCart();
      setCart(res.data?.data.items || []);
    };

    loadCart();

    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  const totalQuantityCart = cart.length;
  const displayTotal = totalQuantityCart > 99 ? "99+" : totalQuantityCart;

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-serif font-bold text-amber-700 tracking-wide transition hover:text-amber-800"
          >
            LUMINA
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-amber-600 transition font-medium"
            >
              Trang chủ
            </Link>
            <Link
              to="/san-pham"
              className="text-gray-700 hover:text-amber-600 transition font-medium"
            >
              Sản phẩm
            </Link>
          </div>
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-md mx-4 lg:mx-6"
          >
            <input
              type="text"
              placeholder="Tìm kiếm trang sức..."
              className="w-full px-4 py-2 border border-gray-200 rounded-l-full focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 bg-gray-50/50 text-gray-800 placeholder:text-gray-400"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-5 rounded-r-full transition shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart icon */}
            <button
              onClick={() => navigate("/gio-hang")}
              className="relative text-2xl p-1 hover:text-amber-600 transition"
            >
              🛒
              {totalQuantityCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[11px] font-semibold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full shadow-md">
                  {displayTotal}
                </span>
              )}
            </button>

            {token ? (
              <div className="relative hidden md:block">
                <div
                  onClick={() => navigate("/thong-tin-ca-nhan")}
                  className="w-9 h-9 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full cursor-pointer shadow-inner flex items-center justify-center text-amber-800 font-semibold"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-amber-100 hidden group-hover:block hover:block transition-all duration-200 z-50">
                  <button
                    onClick={() => navigate("/profile")}
                    className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-amber-50 rounded-t-xl transition"
                  >
                    👤 Cá nhân
                  </button>
                  <button
                    onClick={() => navigate("/orders")}
                    className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-amber-50 transition"
                  >
                    📦 Đơn hàng
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      navigate("/login");
                    }}
                    className="block w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-b-xl transition"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block text-amber-700 hover:text-amber-800 font-medium transition"
              >
                Đăng nhập
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-amber-50 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-100 mt-2 space-y-3 pb-4">
            {/* Search form trên mobile */}
            <form onSubmit={handleSearch} className="flex mb-3">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-l-full focus:outline-none focus:ring-2 focus:ring-amber-200 bg-gray-50/50 text-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button
                type="submit"
                className="bg-amber-700 text-white px-4 rounded-r-full text-sm"
              >
                Tìm
              </button>
            </form>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
            >
              🏠 Trang chủ
            </Link>
            <Link
              to="/san-pham"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
            >
              ✨ Sản phẩm
            </Link>

            {token ? (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                >
                  👤 Cá nhân
                </button>
                <button
                  onClick={() => {
                    navigate("/orders");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                >
                  📦 Đơn hàng
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  🚪 Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-amber-700 font-medium hover:bg-amber-50 rounded-lg transition"
              >
                🔐 Đăng nhập
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
