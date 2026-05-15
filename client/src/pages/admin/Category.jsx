import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import { toast } from "react-toastify";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({ name: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCategories({ search: keyword || "" });
      setCategories(res.data.data.data || []);
    } catch (err) {
      toast.error("Lỗi tải danh mục!");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.warning("Vui lòng nhập tên danh mục");
    }
    try {
      if (editing) {
        await updateCategory(editing.id, {
          ...form,
          updated_at: editing.updated_at,
        });
        toast.success("Cập nhật thành công");
      } else {
        await createCategory(form);
        toast.success("Thêm danh mục thành công");
      }
      setForm({ name: "" });
      setEditing(null);
      fetchData();
    } catch (err) {
      const message = err.response?.data?.message || "Có lỗi xảy ra!";
      toast.error(message);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name });
  };

  const handleDelete = (id) => {
    const item = categories.find((c) => c.id === id);
    toast(
      ({ closeToast }) => (
        <div>
          <p className="mb-2 text-gray-700">
            Bạn chắc chắn muốn xóa danh mục này?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await deleteCategory(id, { updated_at: item?.updated_at });
                  toast.success("Xóa thành công");
                  fetchData();
                } catch (err) {
                  toast.error("Xóa thất bại!");
                }
                closeToast();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg text-sm transition"
            >
              Xóa
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-lg text-sm transition"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Quản lý danh mục
        </h1>
      </div>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        Tổ chức các bộ sưu tập trang sức
      </p>

      {/* Form thêm / sửa */}
      <div className="border border-gray-100 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Tên danh mục (VD: Nhẫn cưới, Dây chuyền, ...)"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              {editing ? "Cập nhật" : "Thêm mới"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "" });
                }}
                className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tìm kiếm */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition"
        >
          Tìm kiếm
        </button>
        <button
          onClick={() => {
            setKeyword("");
            fetchData();
          }}
          className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-2 rounded-lg text-sm transition"
        >
          Đặt lại
        </button>
      </div>

      {/* Bảng danh mục */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Tên danh mục
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-16 text-gray-400">
                      Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  categories.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{item.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}