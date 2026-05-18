import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart } from "../../services/cartService";
import { getProducts } from "../../services/productService";
import { formatCurrency } from "../../utils/formatters";
import { getImageUrl } from "../../utils/image";
import { createSlug } from "../../utils/slug";

export default function Header() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const token = localStorage.getItem("token");

  const handleSearch = (event) => {
    event.preventDefault();
    const search = keyword.trim();

    navigate(search ? `/san-pham?search=${encodeURIComponent(search)}` : "/san-pham");
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

  const handleSelectSuggestion = (product) => {
    setKeyword(product.name || "");
    setShowSuggestions(false);
    setMobileMenuOpen(false);
    navigate(`/san-pham/${createSlug(product.name)}-${product.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const getMainImage = (product) =>
    product.images?.find((image) => image.is_main) || product.images?.[0];

  useEffect(() => {
    const loadCart = async () => {
      if (!token) {
        try {
          setCart(JSON.parse(localStorage.getItem("gio-hang")) || []);
        } catch {
          setCart([]);
        }
        return;
      }

      try {
        const res = await getCart();
        setCart(res.data?.data?.items || []);
      } catch {
        setCart([]);
      }
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    return () => window.removeEventListener("cartUpdated", loadCart);
  }, [token]);

  useEffect(() => {
    const search = keyword.trim();

    if (search.length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestionLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await getProducts({ search, page: 1 });
        if (!cancelled) {
          setSuggestions(res.data?.data?.data || []);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSuggestionLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

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
            <Link to="/" className="text-gray-700 hover:text-amber-600 transition font-medium">
              Trang chủ
            </Link>
            <Link to="/san-pham" className="text-gray-700 hover:text-amber-600 transition font-medium">
              Sản phẩm
            </Link>
          </div>

          <form onSubmit={handleSearch} className="relative hidden sm:flex flex-1 max-w-md mx-4 lg:mx-6">
            <input
              type="text"
              placeholder="Tìm kiếm trang sức..."
              className="w-full px-4 py-2 border border-gray-200 rounded-l-full focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 bg-gray-50/50 text-gray-800 placeholder:text-gray-400"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-5 rounded-r-full transition shadow-sm"
              aria-label="Tìm kiếm"
            >
              <SearchIcon />
            </button>

            {showSuggestions && keyword.trim().length >= 2 && (
              <SearchSuggestions
                keyword={keyword}
                products={suggestions}
                loading={suggestionLoading}
                onSelect={handleSelectSuggestion}
                getMainImage={getMainImage}
              />
            )}
          </form>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/gio-hang")}
              className="relative p-2 text-gray-700 hover:text-amber-600 transition"
              aria-label="Giỏ hàng"
            >
              <CartIcon />
              {totalQuantityCart > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-semibold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full shadow-md">
                  {displayTotal}
                </span>
              )}
            </button>

            {token ? (
              <button
                onClick={() => navigate("/thong-tin-ca-nhan")}
                className="hidden md:flex w-9 h-9 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full cursor-pointer shadow-inner items-center justify-center text-amber-800 font-semibold"
                aria-label="Thông tin cá nhân"
              >
                <UserIcon />
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden md:block text-amber-700 hover:text-amber-800 font-medium transition"
              >
                Đăng nhập
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-amber-50 transition"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-100 mt-2 space-y-3 pb-4">
            <div className="relative mb-3">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-l-full focus:outline-none focus:ring-2 focus:ring-amber-200 bg-gray-50/50 text-sm"
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                <button type="submit" className="bg-amber-700 text-white px-4 rounded-r-full text-sm">
                  Tìm
                </button>
              </form>

              {showSuggestions && keyword.trim().length >= 2 && (
                <SearchSuggestions
                  keyword={keyword}
                  products={suggestions}
                  loading={suggestionLoading}
                  onSelect={handleSelectSuggestion}
                  getMainImage={getMainImage}
                  mobile
                />
              )}
            </div>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
            >
              Trang chủ
            </Link>
            <Link
              to="/san-pham"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
            >
              Sản phẩm
            </Link>

            {token ? (
              <>
                <button
                  onClick={() => {
                    navigate("/thong-tin-ca-nhan");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                >
                  Cá nhân
                </button>
                <button
                  onClick={() => {
                    navigate("/thong-tin-ca-nhan/don-hang");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                >
                  Đơn hàng
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-amber-700 font-medium hover:bg-amber-50 rounded-lg transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function SearchSuggestions({ keyword, products, loading, onSelect, getMainImage, mobile = false }) {
  return (
    <div
      className={`absolute left-0 right-0 z-50 bg-white border border-amber-100 shadow-xl overflow-hidden ${
        mobile ? "top-11 rounded-xl" : "top-12 rounded-2xl"
      }`}
    >
      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
        Gợi ý cho "{keyword.trim()}"
      </div>

      {loading ? (
        <div className="px-4 py-4 text-sm text-gray-500">Đang tìm sản phẩm...</div>
      ) : products.length === 0 ? (
        <div className="px-4 py-4 text-sm text-gray-500">
          Không có sản phẩm phù hợp. Nhấn Enter để xem kết quả tìm kiếm.
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {products.slice(0, 6).map((product) => (
            <button
              key={product.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(product)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition"
            >
              <img
                src={getImageUrl(getMainImage(product)?.image_url)}
                alt={product.name}
                className="w-11 h-11 rounded-lg object-cover bg-amber-50 border border-amber-100 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {product.category?.name || "Trang sức"}
                </p>
              </div>
              <span className="text-sm font-semibold text-amber-700 whitespace-nowrap">
                {formatCurrency(product.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 5h14M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
