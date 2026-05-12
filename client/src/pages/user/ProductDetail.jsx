import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, getProducts } from "../../services/productService";
import { createCart } from "../../services/cartService";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/image";
import { createSlug } from "../../utils/slug";

export default function ProductDetail() {
const { slugId } = useParams(); 
const id = slugId.split("-").at(-1);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("desc");
  const [quantity, setQuantity] = useState(1);
  

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const res = await getProductById(id); // id đã đúng
    const p = res.data.data;
    setProduct(p);

    const sorted = [...(p.images || [])].sort((a, b) => b.is_main - a.is_main);
    setProduct({ ...p, images: sorted });

    const rel = await getProducts({ category_id: p.category_id });
    setRelated(
      (rel.data.data.data || []).filter((x) => x.id !== p.id).slice(0, 4),
    );
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để tiến hành mua hàng!");
      navigate("/login");
      return;
    }
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }
    try {
      await createCart({
        product_id: product.id,
        quantity: quantity,
      });
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Thêm vào giỏ hàng thành công!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng!",
      );
    }
  };

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải sản phẩm...</p>
        </div>
      </div>
    );

  const mainImage = product.images?.[activeImg];

  return (
    <div className="bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-amber-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/san-pham" className="hover:text-amber-600">Sản phẩm</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cột trái: Ảnh sản phẩm */}
          <div className="lg:w-1/2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-amber-100/60 overflow-hidden p-2">
              <div className="aspect-square rounded-xl overflow-hidden bg-amber-50">
                <img
                  src={getImageUrl(mainImage?.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(i)}
                      className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImg === i
                          ? "border-amber-500 shadow-md"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(img.image_url)}
                        alt={`Ảnh ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-gray-800 tracking-wide">
                {product.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-amber-700">
                  {Number(product.price).toLocaleString("vi-VN")}₫
                </span>
                {product.old_price && (
                  <span className="text-gray-400 line-through text-sm">
                    {Number(product.old_price).toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tình trạng:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 text-sm font-medium">Còn hàng</span>
              ) : (
                <span className="text-rose-500 text-sm font-medium">Hết hàng</span>
              )}
            </div>

            {product.short_description && (
              <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-amber-200 pl-3 italic">
                {product.short_description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="text-gray-700 font-medium">Số lượng:</span>
              <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-amber-600 transition disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:text-amber-600 transition"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">
                ({product.stock} sản phẩm có sẵn)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 rounded-xl border-2 border-amber-600 text-amber-700 font-semibold hover:bg-amber-50 transition shadow-sm"
              >
                Thêm vào giỏ hàng
              </button>
              <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-white font-semibold hover:from-amber-800 hover:to-amber-900 transition shadow-md">
                Mua ngay
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-gray-500 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Giao hàng miễn phí toàn quốc</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M6 14h12m-6-4V4m0 16v-4" />
                </svg>
                <span>Đổi trả trong 30 ngày</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-amber-100/60 p-5">
          <div className="flex gap-6 border-b border-amber-100 mb-5">
            {[
              ["desc", "Mô tả sản phẩm"],
              ["reviews", "Đánh giá"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === key
                    ? "text-amber-700 border-b-2 border-amber-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="text-gray-700 leading-relaxed">
            {activeTab === "desc" && (
              <div className="prose prose-amber max-w-none">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="text-gray-400 italic">Chưa có mô tả cho sản phẩm này.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p className="mt-2 text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800">
                Có thể bạn cũng thích
              </h2>
              <Link
                to={`/products?category=${product.category_id}`}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
              >
                Xem tất cả
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => {
                const thumb = p.images?.find((i) => i.is_main) || p.images?.[0];
                return (
                  <Link
                    to={`/san-pham/${createSlug(p.name)}-${p.id}`}
                    key={p.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100/60 overflow-hidden hover:shadow-lg transition duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-amber-50">
                      <img
                        src={getImageUrl(thumb?.image_url)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-gray-800 text-base sm:text-lg font-semibold leading-6 break-words pr-2"
                              style={{ fontFamily: "'Inter', sans-serif", wordBreak: "break-word" }}>
                        {p.name}
                      </h3>
                      <p className="text-amber-700 font-semibold text-base mt-1">
                        {Number(p.price).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}