import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../services/categoryService";
import { getProducts } from "../../services/productService";
import { getDiscountInfo } from "../../utils/discount";
import { formatCurrency } from "../../utils/formatters";
import { getImageUrl } from "../../utils/image";
import { createSlug } from "../../utils/slug";

export default function Home() {
  document.title = "Lumina - Trang chủ";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountProducts, setDiscountProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [categoryRes, productRes, discountRes] = await Promise.all([
          getCategories(),
          getProducts({ page: 1, sort: "latest", per_page: 8 }),
          getProducts({ page: 1, sort: "latest", has_discount: 1, per_page: 4 }),
        ]);

        setCategories(categoryRes.data?.data?.data || categoryRes.data?.data || []);
        setProducts(productRes.data?.data?.data || []);
        setDiscountProducts(discountRes.data?.data?.data || []);
      } catch {
        setCategories([]);
        setProducts([]);
        setDiscountProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const discountedProducts = useMemo(
    () =>
      discountProducts
        .map((product) => ({ ...product, discountInfo: getDiscountInfo(product) }))
        .filter((product) => product.discountInfo?.badge)
        .slice(0, 4),
    [discountProducts],
  );

  const featuredProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
        .slice(0, 8),
    [products],
  );

  return (
    <main className="bg-[#FEFCF3] min-h-screen">
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80"
            alt="Trang sức Lumina"
            className="w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-stone-950/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 min-h-[520px] flex items-center">
          <div className="max-w-2xl py-20">
            <p className="text-amber-200 text-sm font-semibold tracking-[0.25em] uppercase mb-4">
              Lumina Jewelry
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold leading-tight">
              Trang sức tinh tế cho từng khoảnh khắc
            </h1>
            <p className="text-stone-200 mt-5 text-base sm:text-lg leading-7">
              Khám phá danh mục nổi bật, sản phẩm mới và các ưu đãi đang diễn ra tại Lumina.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/san-pham"
                className="px-6 py-3 rounded-full bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition shadow-lg"
              >
                Xem sản phẩm
              </Link>
              <a
                href="#uu-dai"
                className="px-6 py-3 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition"
              >
                Xem ưu đãi
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoTile title="Miễn phí tư vấn" text="Gợi ý theo phong cách" />
          <InfoTile title="Thanh toán linh hoạt" text="Hỗ trợ nhiều phương thức" />
          <InfoTile title="Sản phẩm chọn lọc" text="Cập nhật mẫu mới liên tục" />
          <InfoTile title="Ưu đãi định kỳ" text="Giảm giá và freeship" />
        </div>
      </section>

      <section id="bo-suu-tap" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <SectionTitle
          eyebrow="Danh mục"
          title="Mua sắm theo phong cách"
          action={{ to: "/san-pham", label: "Tất cả sản phẩm" }}
        />

        {loading ? (
          <HomeSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                to={`/san-pham?category_id=${category.id}`}
                className="group bg-white border border-amber-100 rounded-xl p-5 hover:border-amber-300 hover:shadow-md transition"
              >
                <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-serif text-xl mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
                  {category.name?.charAt(0) || "L"}
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-amber-700 transition">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Xem bộ sưu tập</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section id="uu-dai" className="bg-white border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionTitle
            eyebrow="Ưu đãi"
            title="Sản phẩm đang giảm giá"
            action={{ to: "/san-pham", label: "Xem thêm" }}
          />

          {discountedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {discountedProducts.map((product) => (
                <ProductCard key={product.id} product={product} highlight />
              ))}
            </div>
          ) : (
            <EmptyState text="Hiện chưa có chương trình giảm giá. Bạn có thể xem các sản phẩm nổi bật bên dưới." />
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <SectionTitle
          eyebrow="Nổi bật"
          title="Sản phẩm được quan tâm"
          action={{ to: "/san-pham", label: "Khám phá tất cả" }}
        />

        {loading ? (
          <HomeSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section id="lien-he" className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="bg-stone-900 rounded-2xl overflow-hidden grid md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-7 sm:p-10 text-white">
            <p className="text-amber-300 text-sm font-semibold uppercase tracking-[0.2em]">
              Lumina care
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold mt-3">
              Chọn món quà đúng gu chưa bao giờ dễ hơn
            </h2>
            <p className="text-stone-300 mt-3 leading-7">
              Lọc theo danh mục, tìm nhanh sản phẩm yêu thích và theo dõi các mẫu đang có ưu đãi ngay trên trang chủ.
            </p>
            <Link
              to="/san-pham"
              className="inline-flex mt-6 px-5 py-2.5 rounded-full bg-white text-stone-900 font-semibold hover:bg-amber-100 transition"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80"
            alt="Nhẫn trang sức"
            className="w-full h-72 md:h-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <p className="text-amber-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">
          {eyebrow}
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-gray-800">
          {title}
        </h2>
      </div>
      {action && (
        <Link to={action.to} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
          {action.label}
        </Link>
      )}
    </div>
  );
}

function InfoTile({ title, text }) {
  return (
    <div className="bg-white border border-amber-100 rounded-xl px-4 py-4">
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{text}</p>
    </div>
  );
}

function ProductCard({ product, highlight = false }) {
  const image = product.images?.find((item) => item.is_main) || product.images?.[0];
  const discountInfo = product.discountInfo || getDiscountInfo(product);
  const price = discountInfo.discountedPrice ?? Number(product.price || 0);
  const originalPrice = discountInfo.originalPrice ?? Number(product.price || 0);

  return (
    <Link
      to={`/san-pham/${createSlug(product.name)}-${product.id}`}
      className="group bg-white border border-amber-100 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition"
    >
      <div className="relative aspect-square bg-amber-50 overflow-hidden">
        <img
          src={getImageUrl(image?.image_url)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {discountInfo.badge && (
          <span
            className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full shadow ${
              discountInfo.badge.color === "green" ? "bg-green-500 text-white" : "bg-rose-500 text-white"
            }`}
          >
            {discountInfo.badge.text}
          </span>
        )}
        {highlight && (
          <span className="absolute bottom-2 left-2 bg-stone-950/85 text-white text-xs px-2 py-1 rounded-full">
            Ưu đãi
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-amber-700 font-medium truncate">
          {product.category?.name || "Trang sức"}
        </p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mt-1 group-hover:text-amber-700 transition">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-amber-700">{formatCurrency(price)}</span>
          {price < originalPrice && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white border border-amber-100 rounded-xl p-4 animate-pulse">
          <div className="aspect-square rounded-lg bg-amber-100/70 mb-3" />
          <div className="h-4 bg-amber-100 rounded w-3/4" />
          <div className="h-3 bg-amber-50 rounded w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-8 text-center text-gray-600">
      {text}
    </div>
  );
}
