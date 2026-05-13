import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, getProducts } from "../../services/productService";
import { createCart } from "../../services/cartService";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/image";
import { createSlug } from "../../utils/slug";
import { getDiscountInfo } from "../../utils/discount";

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
    try {
      const res = await getProductById(id);

      const p = res.data.data;

      const sorted = [...(p.images || [])].sort(
        (a, b) => b.is_main - a.is_main,
      );

      setProduct({
        ...p,
        images: sorted,
      });

      const rel = await getProducts({
        category_id: p.category_id,
      });

      setRelated(
        (rel.data.data.data || []).filter((x) => x.id !== p.id).slice(0, 4),
      );
    } catch (error) {
      toast.error("Không tải được sản phẩm!");
      navigate("/san-pham");
    }
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
        quantity,
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

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }

    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    try {
      const res = await createCart({
        product_id: product.id,
        quantity,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      const cartItemId = res.data?.data?.cart_item_id || res.data?.data?.id;
      if (!cartItemId)
        throw new Error("Không lấy được ID sản phẩm trong giỏ hàng");

      navigate("/thanh-toan", {
        state: { selectedCartIds: [Number(cartItemId)] },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể mua ngay, thử lại!",
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

  // DISCOUNT
  const { discountedPrice, originalPrice, badge, hasFreeship, discountAmount } =
    getDiscountInfo(product);

  return (
    <div className="bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* BREADCRUMB */}
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-amber-600">
            Trang chủ
          </Link>

          <span className="mx-2">/</span>

          <Link to="/san-pham" className="hover:text-amber-600">
            Sản phẩm
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* LEFT */}
          <div className="lg:w-1/2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-amber-100/60 overflow-hidden p-2">
              <div className="aspect-square rounded-xl overflow-hidden bg-amber-50 relative">
                {badge && (
                  <div
                    className={`absolute top-3 left-3 z-10 text-xs font-bold px-3 py-1 rounded-full shadow ${
                      badge.color === "rose"
                        ? "bg-rose-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {badge.text}
                  </div>
                )}

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

          {/* RIGHT */}
          <div className="lg:w-1/2 space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-gray-800 tracking-wide">
                {product.name}
              </h1>

              {/* PRICE */}
              <div className="mt-3 space-y-1">
                {badge && (
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                      badge.color === "rose"
                        ? "bg-rose-500 text-white"
                        : badge.color === "green"
                          ? "bg-green-500 text-white"
                          : ""
                    }`}
                  >
                    {badge.text}
                  </span>
                )}

                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-amber-700">
                    {Number(discountedPrice).toLocaleString("vi-VN")}₫
                  </span>

                  {discountedPrice < originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      {Number(originalPrice).toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>

                {discountAmount > 0 && (
                  <p className="text-xs text-green-600">
                    Tiết kiệm {Number(discountAmount).toLocaleString("vi-VN")}₫
                  </p>
                )}

                {hasFreeship && (
                  <span className="inline-block text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                    🚚 Miễn phí vận chuyển
                  </span>
                )}
              </div>
            </div>

            {/* STOCK */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tình trạng:</span>

              {product.stock > 0 ? (
                <span className="text-green-600 text-sm font-medium">
                  Còn hàng
                </span>
              ) : (
                <span className="text-rose-500 text-sm font-medium">
                  Hết hàng
                </span>
              )}
            </div>

            {/* SHORT DESC */}
            {product.short_description && (
              <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-amber-200 pl-3 italic">
                {product.short_description}
              </p>
            )}

            {/* QUANTITY */}
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
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
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

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 rounded-xl border-2 border-amber-600 text-amber-700 font-semibold hover:bg-amber-50 transition"
              >
                Thêm vào giỏ hàng
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-3 rounded-xl bg-amber-700 text-white font-semibold hover:bg-amber-800 transition disabled:opacity-50"
              >
                Mua ngay
              </button>
            </div>

            {/* FEATURES */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-gray-500 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                <span>Giao hàng miễn phí toàn quốc</span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M6 14h12m-6-4V4m0 16v-4"
                  />
                </svg>

                <span>Đổi trả trong 30 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
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
                  <p className="text-gray-400 italic">
                    Chưa có mô tả cho sản phẩm này.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có đánh giá nào.</p>
              </div>
            )}
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800">
                Có thể bạn cũng thích
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => {
                const thumb = p.images?.find((i) => i.is_main) || p.images?.[0];

                const { discountedPrice, originalPrice, badge } =
                  getDiscountInfo(p);

                return (
                  <Link
                    to={`/san-pham/${createSlug(p.name)}-${p.id}`}
                    key={p.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100/60 overflow-hidden hover:shadow-lg transition duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-amber-50 relative">
                      {badge && (
                        <div
                          className={`absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-1 rounded-full ${
                            badge.color === "rose"
                              ? "bg-rose-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {badge.text}
                        </div>
                      )}

                      <img
                        src={getImageUrl(thumb?.image_url)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    <div className="p-3">
                      <h3
                        className="text-gray-800 text-base sm:text-lg font-semibold leading-6 break-words pr-2"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          wordBreak: "break-word",
                        }}
                      >
                        {p.name}
                      </h3>

                      <div className="mt-1">
                        <p className="text-amber-700 font-semibold text-base">
                          {Number(discountedPrice).toLocaleString("vi-VN")}₫
                        </p>

                        {discountedPrice < originalPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            {Number(originalPrice).toLocaleString("vi-VN")}₫
                          </p>
                        )}
                      </div>
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
