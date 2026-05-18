import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getDiscountInfo } from "../../utils/discount";
import { formatCurrency } from "../../utils/formatters";
import { getImageUrl } from "../../utils/image";
import { createSlug } from "../../utils/slug";

export default function OffersPage() {
  document.title = "Ưu đãi";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await getProducts({ has_discount: 1, per_page: 24 });
        setProducts(res.data?.data?.data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const offerProducts = useMemo(
    () => products.map((product) => ({ ...product, discountInfo: getDiscountInfo(product) })),
    [products],
  );

  return (
    <main className="bg-[#FEFCF3] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-amber-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">Lumina deals</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-800">Ưu đãi đang diễn ra</h1>
          <p className="text-gray-500 mt-2">Các mẫu trang sức có giảm giá hoặc freeship còn hiệu lực.</p>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : offerProducts.length === 0 ? (
          <div className="bg-white border border-amber-100 rounded-xl p-10 text-center text-gray-500">
            Hiện chưa có ưu đãi nào.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {offerProducts.map((product) => (
              <OfferCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OfferCard({ product }) {
  const image = product.images?.find((item) => item.is_main) || product.images?.[0];
  const price = product.discountInfo.discountedPrice;
  const originalPrice = product.discountInfo.originalPrice;

  return (
    <Link
      to={`/san-pham/${createSlug(product.name)}-${product.id}`}
      className="group bg-white border border-amber-100 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition"
    >
      <div className="relative aspect-square bg-amber-50 overflow-hidden">
        <img src={getImageUrl(image?.image_url)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        {product.discountInfo.badge && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.discountInfo.badge.text}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-amber-700 font-medium truncate">{product.category?.name || "Trang sức"}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mt-1">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-amber-700">{formatCurrency(price)}</span>
          {price < originalPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(originalPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white border border-amber-100 rounded-xl p-4 animate-pulse">
          <div className="aspect-square rounded-lg bg-amber-100/70 mb-3" />
          <div className="h-4 bg-amber-100 rounded w-3/4" />
          <div className="h-3 bg-amber-50 rounded w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );
}
