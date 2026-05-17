import { useState, useEffect, useCallback } from "react";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getProductsForDiscount,
} from "../../services/discountService";
import { toast } from "react-toastify";

const TYPE_LABELS = {
  percent: "Giảm %",
  fixed: "Giảm tiền",
  freeship: "Freeship",
};

const TYPE_COLORS = {
  percent: "bg-blue-100 text-blue-700",
  fixed: "bg-emerald-100 text-emerald-700",
  freeship: "bg-purple-100 text-purple-700",
};

const EMPTY_FORM = {
  name: "",
  type: "percent",
  value: "",
  start_date: "",
  end_date: "",
  min_order_amount: "",
  max_discount_amount: "",
  product_ids: [],
};

export default function DiscountManagement() {
    document.title = "Quản lý giảm giá";
  const [discounts, setDiscounts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Product picker
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  // ── Fetch discounts ───────────────────────────────────────
  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDiscounts({
        search: search || undefined,
        page,
        per_page: 15,
      });
      setDiscounts(res.data.data ?? []);
      setMeta(res.data.meta ?? null);
    } catch (err) {
      toast.error("Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ── Fetch products cho picker ─────────────────────────────
  useEffect(() => {
    if (!showModal) return;
    (async () => {
      try {
        const res = await getProductsForDiscount({
          per_page: 100,
          search: productSearch || undefined,
        });
        setProducts(res.data.data?.data ?? res.data.data ?? []);
      } catch {}
    })();
  }, [showModal, productSearch]);

  // ── Open modal ────────────────────────────────────────────
  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (discount) => {
    setEditId(discount.id);
    setForm({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      start_date: discount.start_date,
      end_date: discount.end_date,
      min_order_amount: discount.min_order_amount || "",
      max_discount_amount: discount.max_discount_amount || "",
      product_ids: discount.products?.map((p) => p.id) ?? [],
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        value: form.value === "" ? 0 : Number(form.value),
        min_order_amount:
          form.min_order_amount === "" ? null : Number(form.min_order_amount),
        max_discount_amount:
          form.max_discount_amount === ""
            ? null
            : Number(form.max_discount_amount),
      };

      if (editId) {
        await updateDiscount(editId, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await createDiscount(payload);
        toast.success("Tạo chương trình thành công!");
      }
      closeModal();
      fetchDiscounts();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xoá chương trình giảm giá này?")) return;
    try {
      await deleteDiscount(id);
      toast.success("Đã xoá.");
      fetchDiscounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xoá thất bại.");
    }
  };

  // ── Toggle product selection ──────────────────────────────
  const toggleProduct = (id) => {
    setForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter((x) => x !== id)
        : [...f.product_ids, id],
    }));
  };

  // ── Helpers ───────────────────────────────────────────────
  const fv = (field) =>
    errors[field] ? (
      <p className="text-red-500 text-xs mt-0.5">{errors[field][0]}</p>
    ) : null;

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200"}`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            🎫 Quản lý giảm giá
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tạo và gán voucher cho sản phẩm
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          + Tạo mới
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Tìm theo tên chương trình..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Không có chương trình nào
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Tên chương trình</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Giá trị</th>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">Sản phẩm</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {d.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[d.type]}`}
                    >
                      {TYPE_LABELS[d.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.type === "freeship"
                      ? "—"
                      : d.type === "percent"
                        ? `${d.value}%`
                        : `${Number(d.value).toLocaleString("vi-VN")}₫`}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {d.start_date} → {d.end_date}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {d.products?.length ?? 0} sản phẩm
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${d.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {d.is_active ? "Đang chạy" : "Không active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(d)}
                        className="px-3 py-1 text-xs border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="px-3 py-1 text-xs border border-red-300 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center items-center gap-3 px-6 py-4 border-t border-gray-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-500">
              {page} / {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* ── Modal tạo / sửa ──────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                {editId
                  ? "✏️ Sửa chương trình"
                  : "➕ Tạo chương trình giảm giá"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Tên */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Tên chương trình *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="VD: Giảm 20% trang sức vàng"
                  className={inputClass("name")}
                />
                {fv("name")}
              </div>

              {/* Loại + Giá trị */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Loại giảm giá *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputClass("type")}
                  >
                    <option value="percent">Giảm theo % </option>
                    <option value="fixed">Giảm tiền cố định</option>
                    <option value="freeship">Miễn phí vận chuyển</option>
                  </select>
                  {fv("type")}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Giá trị{" "}
                    {form.type === "percent"
                      ? "(%)"
                      : form.type === "fixed"
                        ? "(₫)"
                        : "(Freeship — để trống)"}
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, value: e.target.value }))
                    }
                    placeholder={form.type === "percent" ? "20" : "50000"}
                    disabled={form.type === "freeship"}
                    className={
                      inputClass("value") +
                      (form.type === "freeship" ? " opacity-50" : "")
                    }
                  />
                  {fv("value")}
                </div>
              </div>

              {/* Ngày */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_date: e.target.value }))
                    }
                    className={inputClass("start_date")}
                  />
                  {fv("start_date")}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end_date: e.target.value }))
                    }
                    className={inputClass("end_date")}
                  />
                  {fv("end_date")}
                </div>
              </div>

              {/* Min order + Max discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Đơn hàng tối thiểu (₫)
                  </label>
                  <input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        min_order_amount: e.target.value,
                      }))
                    }
                    placeholder="100000"
                    className={inputClass("min_order_amount")}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Giảm tối đa (₫)
                  </label>
                  <input
                    type="number"
                    value={form.max_discount_amount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        max_discount_amount: e.target.value,
                      }))
                    }
                    placeholder="200000"
                    className={inputClass("max_discount_amount")}
                  />
                </div>
              </div>

              {/* Gán sản phẩm */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Gán sản phẩm ({form.product_ids.length} đã chọn)
                </label>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="border border-gray-100 rounded-xl overflow-y-auto max-h-48">
                  {products.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-4">
                      Không có sản phẩm
                    </p>
                  ) : (
                    products.map((p) => {
                      const checked = form.product_ids.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                            ${checked ? "bg-blue-50" : "hover:bg-gray-50"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProduct(p.id)}
                            className="w-4 h-4 accent-blue-500"
                          />
                          {p.thumbnail && (
                            <img
                              src={p.thumbnail}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-gray-100"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {Number(p.price).toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                          {checked && (
                            <span className="text-blue-500 text-xs">✓</span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
