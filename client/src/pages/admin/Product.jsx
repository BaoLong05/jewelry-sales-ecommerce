import { useEffect, useState } from "react";
import { getImageUrl } from "../../utils/image";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { toast } from "react-toastify";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ search: keyword, page });
      setProducts(res.data.data.data || []);
      setLastPage(res.data.data.last_page || 1);
    } catch {
      toast.error("Lỗi load sản phẩm");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data.data || res.data || []);
    } catch {
      toast.error("Lỗi load danh mục");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    setPreview(
      newImages.map((f) => (f instanceof File ? URL.createObjectURL(f) : f)),
    );
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreview = preview.filter((_, i) => i !== index);
    setImages(newImages);
    setPreview(newPreview);
    if (mainIndex >= newImages.length) setMainIndex(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    formData.append("main_index", parseInt(mainIndex, 10));
    images.forEach((img) => {
      if (img instanceof File) formData.append("images[]", img);
    });
    if (editing) {
      formData.append("_method", "PUT");
      formData.append("updated_at", editing.updated_at);
    }
    try {
      if (editing) {
        await updateProduct(editing.id, formData);
        toast.success("Cập nhật thành công");
      } else {
        await createProduct(formData);
        toast.success("Thêm thành công");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(
          "Sản phẩm vừa được cập nhật bởi người khác. Vui lòng tải lại!",
        );
        resetForm();
        fetchProducts(); 
      } else {
        toast.error(err.response?.data?.message || "Lỗi!");
      }
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      stock: "",
      category_id: "",
      description: "",
    });
    setImages([]);
    setPreview([]);
    setMainIndex(0);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      price: item.price,
      stock: item.stock,
      category_id: item.category_id,
      description: item.description || "",
    });
    setPreview(item.images?.map((img) => getImageUrl(img.image_url)) || []);
    setImages([]);
    const main = item.images?.findIndex((i) => i.is_main);
    setMainIndex(main !== -1 ? main : 0);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id,{ updated_at: product?.updated_at });
      toast.success("Xóa thành công");
      fetchProducts();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Quản lý sản phẩm
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Thêm sản phẩm
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Tên sản phẩm
                  </label>
                  <input
                    className="border border-gray-200 rounded-lg p-2.5 w-full text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Nhập tên sản phẩm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Danh mục
                  </label>
                  <select
                    className="border border-gray-200 rounded-lg p-2.5 w-full text-sm focus:outline-none focus:border-blue-400"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Giá (₫)
                  </label>
                  <input
                    className="border border-gray-200 rounded-lg p-2.5 w-full text-sm focus:outline-none focus:border-blue-400"
                    placeholder="VD: 500000"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Tồn kho
                  </label>
                  <input
                    className="border border-gray-200 rounded-lg p-2.5 w-full text-sm focus:outline-none focus:border-blue-400"
                    placeholder="VD: 10"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Mô tả
                </label>
                <textarea
                  className="border border-gray-200 rounded-lg p-2.5 w-full text-sm focus:outline-none focus:border-blue-400 resize-none"
                  rows={3}
                  placeholder="Mô tả sản phẩm..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Upload ảnh */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">
                  Hình ảnh{" "}
                  <span className="text-gray-400">
                    (tối đa 5 ảnh, click radio để chọn ảnh chính)
                  </span>
                </label>
                <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition w-fit">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">Chọn ảnh</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>

                {preview.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {preview.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          className={`w-20 h-20 object-cover rounded-lg border-2 transition ${
                            mainIndex === index
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        />
                        {/* Ảnh chính badge */}
                        {mainIndex === index && (
                          <span className="absolute bottom-0 left-0 right-0 text-center text-white text-[10px] bg-blue-500 rounded-b-lg py-0.5">
                            Chính
                          </span>
                        )}
                        {/* Radio chọn ảnh chính */}
                        <input
                          type="radio"
                          checked={mainIndex === index}
                          onChange={() => setMainIndex(index)}
                          className="absolute top-1 left-1 cursor-pointer"
                          title="Chọn làm ảnh chính"
                        />
                        {/* Nút xóa ảnh */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  {editing ? "Cập nhật" : "Thêm sản phẩm"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-gray-200 px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <input
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-blue-400"
          placeholder="Tìm kiếm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
        />
        <button
          onClick={() => {
            setPage(1);
            fetchProducts();
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Tìm
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-12">
                  ID
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Sản phẩm
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Danh mục
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Giá
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Tồn kho
                </th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    Không có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const mainImg =
                    p.images?.find((i) => i.is_main) || p.images?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400">{p.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {mainImg ? (
                            <img
                              src={getImageUrl(mainImg.image_url)}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
                          )}
                          <span className="font-medium text-gray-800">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium">
                        {Number(p.price).toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            p.stock > 10
                              ? "bg-green-50 text-green-700"
                              : p.stock > 0
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {p.stock > 0 ? `${p.stock} sản phẩm` : "Hết hàng"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="w-8 h-8 border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-gray-300 transition text-sm"
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
            className="w-8 h-8 border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-gray-300 transition text-sm"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
