import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";
import { createSlug } from "../../utils/slug";
import { getDiscountInfo } from "../../utils/discount";

export default function ProductList() {
  document.title = "Sản phẩm";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);


  useEffect(() => { fetchData(); }, [page, activeCategory, sort]);

  const fetchData = async () => {
    const res = await getProducts({ search: keyword, category_id: activeCategory, sort, page });
    const d = res.data.data;
    setProducts(d.data || []);
    setLastPage(d.last_page || 1);
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data.data || res.data || []);
    } catch {}
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSearch = () => { setPage(1); fetchData(); };

  return (
    <div className="bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-gray-800 border-l-4 border-amber-500 pl-4">
            Bộ sưu tập
          </h1>
          <p className="text-gray-500 text-sm mt-2 ml-5">Những viên ngọc quý dành riêng cho bạn</p>
        </div>

        {/* Tìm kiếm + sắp xếp */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <input
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition text-gray-800 placeholder:text-gray-400 text-sm"
              placeholder="Tìm kiếm trang sức..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-medium transition shadow-sm">
              Tìm kiếm
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600 text-sm whitespace-nowrap">Sắp xếp:</label>
            <select
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white/50 focus:ring-2 focus:ring-amber-200 outline-none transition"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              <option value="latest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Filter danh mục */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setActiveCategory(""); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === ""
                ? "bg-amber-600 text-white shadow-md"
                : "bg-white/60 text-gray-600 hover:bg-amber-100 border border-gray-200"
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button key={c.id}
              onClick={() => { setActiveCategory(c.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === c.id
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-white/60 text-gray-600 hover:bg-amber-100 border border-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Danh sách sản phẩm */}
        {products.length === 0 ? (
          <div className="bg-white/80 rounded-2xl shadow-sm border border-amber-100/40 p-10 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
            <p className="text-gray-400 text-sm mt-1">Hãy thử từ khóa khác hoặc xem tất cả sản phẩm.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((p) => {
               const mainImage = p.images?.find((i) => i.is_main) || p.images?.[0];

              // ✅ Đặt TRONG map — p đã tồn tại ở đây
              const { discountedPrice, originalPrice, badge } = getDiscountInfo(p);

              return (
                <Link
                  to={`/san-pham/${createSlug(p.name)}-${p.id}`}
                  key={p.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100/60 overflow-hidden hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden aspect-square bg-amber-50">
                    <img
                      src={getImageUrl(mainImage?.image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* ✅ Badge giảm giá */}
                    {badge && (
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ${
                        badge.color === "rose"  ? "bg-rose-500 text-white" :
                        badge.color === "green" ? "bg-green-500 text-white" : ""
                      }`}>
                        {badge.text}
                      </span>
                    )}

                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white/90 text-rose-600 px-2 py-1 rounded-full text-xs font-bold">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-amber-600 mb-0.5 font-medium">
                      {p.category?.name || "Trang sức"}
                    </p>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-amber-700 transition">
                      {p.name}
                    </h3>

                    {/* ✅ Giá sau giảm + giá gốc gạch ngang */}
                    <div className="mt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-amber-700 font-bold text-sm">
                          {Number(discountedPrice).toLocaleString("vi-VN")}₫
                        </span>
                        {discountedPrice < originalPrice && (
                          <span className="text-gray-400 line-through text-xs">
                            {Number(originalPrice).toLocaleString("vi-VN")}₫
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        {/* Freeship tag */}
                        {badge?.color === "green" ? (
                          <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                            🚚 Freeship
                          </span>
                        ) : <span/>}

                        {p.stock > 0 && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            còn {p.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Phân trang */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-amber-300 hover:text-amber-600 transition bg-white/60">
              ‹
            </button>
            {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
              let pageNum;
              if (lastPage <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= lastPage - 2) pageNum = lastPage - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-full text-sm transition ${
                    page === pageNum
                      ? "bg-amber-600 text-white shadow-md"
                      : "border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600 bg-white/60"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            <button disabled={page === lastPage} onClick={() => setPage(page + 1)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-amber-300 hover:text-amber-600 transition bg-white/60">
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}