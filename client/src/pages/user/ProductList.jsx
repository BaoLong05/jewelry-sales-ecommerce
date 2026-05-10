import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page, activeCategory, sort]);

  const fetchData = async () => {
    const res = await getProducts({
      search: keyword,
      category_id: activeCategory,
      sort,
      page,
    });
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-3 mb-5">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
          placeholder="Tìm kiếm trang sức..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Tìm Kiếm
        </button>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="latest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => {
            setActiveCategory("");
            setPage(1);
          }}
          className={`px-4 py-1.5 rounded-lg text-sm border transition ${
            activeCategory === ""
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveCategory(c.id);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg text-sm border transition ${
              activeCategory === c.id
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          Không tìm thấy sản phẩm.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const mainImage = p.images?.find((i) => i.is_main) || p.images?.[0];
            return (
              <Link to={`/products/${p.id}`} key={p.id} className="group">
                <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition bg-white">
                  <div className="relative overflow-hidden h-48 bg-gray-50">
                    <img
                      src={getImageUrl(mainImage?.image_url)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-gray-400 mb-1">
                      {p.category?.name || ""}
                    </p>
                    <p className="text-sm font-medium text-gray-800 truncate mb-2">
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-semibold text-sm">
                        {Number(p.price).toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-xs text-gray-400">
                        Còn {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center disabled:opacity-40 hover:border-gray-300 transition"
          >
            ‹
          </button>

          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm border transition ${
                page === p
                  ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={page === lastPage}
            onClick={() => setPage(page + 1)}
            className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center disabled:opacity-40 hover:border-gray-300 transition"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
