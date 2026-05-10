import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, getProducts } from "../../services/productService";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("desc");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const res = await getProductById(id);
    const p = res.data.data;
    setProduct(p);

    // anh main tren dau
    const sorted = [...(p.images || [])].sort((a, b) => b.is_main - a.is_main);
    setProduct({ ...p, images: sorted });

    // product tuong tu
    const rel = await getProducts({ category_id: p.category_id });
    setRelated(
      (rel.data.data.data || []).filter((x) => x.id !== p.id).slice(0, 4),
    );
  };

  if (!product) return <p className="p-8">Đang tải...</p>;

  const mainImage = product.images?.[activeImg];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Cột ảnh */}
        <div className="w-[420px] shrink-0">
          <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square">
            <img
              src={getImageUrl(mainImage?.image_url)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-2 mt-3">
            {product.images?.map((img, i) => (
              <img
                key={img.id}
                src={getImageUrl(img.image_url)}
                onClick={() => setActiveImg(i)}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                  activeImg === i ? "border-blue-500" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="text-red-600 text-2xl font-semibold mt-2">
              {Number(product.price).toLocaleString("vi-VN")}₫
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Số lượng</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-lg hover:bg-gray-100"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm border-x">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                className="px-3 py-2 text-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-400">
              ({product.stock} có sẵn)
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
              Mua ngay
            </button>
            <button className="border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-6">
        <div className="flex gap-6 border-b mb-6">
          {[
            ["desc", "Mô tả"],
            ["reviews", "Đánh giá"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "desc" && (
          <p className="text-gray-600 leading-relaxed">
            {product.description || "Chưa có mô tả."}
          </p>
        )}

        {activeTab === "reviews" && (
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào.</p>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-4 gap-4">
            {related.map((p) => {
              const thumb = p.images?.find((i) => i.is_main) || p.images?.[0];
              return (
                <Link to={`/products/${p.id}`} key={p.id}>
                  <div className="border rounded-xl overflow-hidden hover:shadow-sm transition">
                    <img
                      src={getImageUrl(thumb?.image_url)}
                      className="w-full h-36 object-cover bg-gray-100"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-red-600 text-sm font-semibold mt-1">
                        {Number(p.price).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
