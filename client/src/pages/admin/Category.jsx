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
    const item = categories.find((c)=> c.id === id);
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
      { autoClose: false, closeOnClick: false },
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-stone-50 via-amber-50/10 to-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-gray-800 border-l-4 border-amber-500 pl-4">
            Quản lý danh mục
          </h1>
          <p className="text-gray-500 text-sm mt-2 ml-5">
            Tổ chức các bộ sưu tập trang sức
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-amber-100/40 p-5 sm:p-6 mb-8 transition-all">
          <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-400 rounded-full"></span>
            {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="Tên danh mục (VD: Nhẫn cưới, Dây chuyền, ...)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition text-gray-800 placeholder:text-gray-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200"
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
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm border border-amber-100/40">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition font-medium"
              >
                Tìm kiếm
              </button>
              <button
                onClick={() => {
                  setKeyword("");
                  fetchData();
                }}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition font-medium"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white/50 rounded-2xl">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-amber-100/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50 to-stone-50 border-b border-amber-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Tên danh mục
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-12 text-gray-400"
                      >
                        <svg
                          className="w-12 h-12 mx-auto text-gray-300 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        Chưa có danh mục nào
                      </td>
                    </tr>
                  ) : (
                    categories.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-amber-50/30 transition"
                      >
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                          #{item.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition text-sm font-medium flex items-center gap-1"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition text-sm font-medium flex items-center gap-1"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
    </div>
  );
}
