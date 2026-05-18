import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../services/categoryService";

export default function CollectionsPage() {
  document.title = "Bộ sưu tập";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const res = await getCategories();
        setCategories(res.data?.data?.data || res.data?.data || []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <main className="bg-[#FEFCF3] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-amber-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">Collections</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-800">Bộ sưu tập Lumina</h1>
          <p className="text-gray-500 mt-2">Chọn danh mục để xem các sản phẩm phù hợp với phong cách của bạn.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-32 bg-white border border-amber-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/san-pham?category_id=${category.id}`}
                className="group bg-white border border-amber-100 rounded-xl p-6 hover:border-amber-300 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-serif text-xl group-hover:bg-amber-600 group-hover:text-white transition">
                  {category.name?.charAt(0) || "L"}
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mt-4 group-hover:text-amber-700 transition">{category.name}</h2>
                <p className="text-sm text-gray-500 mt-2">Xem sản phẩm trong danh mục này</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
