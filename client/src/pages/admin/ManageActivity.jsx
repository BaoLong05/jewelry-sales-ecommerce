import { useState, useEffect, useCallback } from "react";
import { getActivityLogs, getLoginLogs } from "../../services/adminActivityService";

const TABS = [
  { key: "activity", label: "Nhật ký hoạt động" },
  { key: "login",    label: "Lịch sử đăng nhập" },
];

const MODULE_COLORS = {
  auth:     "bg-blue-100 text-blue-700",
  product:  "bg-violet-100 text-violet-700",
  order:    "bg-amber-100 text-amber-700",
  refund:   "bg-red-100 text-red-700",
  category: "bg-emerald-100 text-emerald-700",
  discount: "bg-pink-100 text-pink-700",
};

const ACTION_ICONS = {
  login:        "🔐",
  login_google: "🔐",
  logout:       "🚪",
  register:     "📝",
  create:       "➕",
  update:       "✏️",
  delete:       "🗑️",
  approve:      "✅",
  reject:       "❌",
};

function formatDuration(seconds) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}g ${m}p`;
  if (m > 0) return `${m}p ${s}s`;
  return `${s}s`;
}

export default function ManageActivity() {
  const [activeTab, setActiveTab]     = useState("activity");
  const [logs, setLogs]               = useState([]);
  const [meta, setMeta]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);
  const [filterModule, setFilterModule] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterUserId, setFilterUserId] = useState("");

  const fetchLogs = useCallback(async () => {
    document.title = "Quản lý hoạt động hệ thống";
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (filterUserId) params.user_id = filterUserId;

      if (activeTab === "activity") {
        if (filterModule) params.module = filterModule;
        if (filterAction) params.action = filterAction;
        const res = await getActivityLogs(params);
        setLogs(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      } else {
        const res = await getLoginLogs(params);
        setLogs(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      }
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, filterModule, filterAction, filterUserId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [activeTab, filterModule, filterAction, filterUserId]);

  const resetFilters = () => {
    setFilterModule("");
    setFilterAction("");
    setFilterUserId("");
    setPage(1);
  };

  const hasFilter = filterModule || filterAction || filterUserId;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Nhật ký hệ thống</h1>
          <p className="text-sm text-gray-400 mt-0.5">Theo dõi hoạt động và lịch sử đăng nhập</p>
        </div>
        {meta && (
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            {meta.total} bản ghi
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); resetFilters(); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeTab === tab.key
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">User ID</label>
          <input
            type="number"
            placeholder="Nhập ID..."
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-32 bg-white"
          />
        </div>

        {activeTab === "activity" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Module</label>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="">Tất cả</option>
                <option value="auth">Auth</option>
                <option value="product">Product</option>
                <option value="order">Order</option>
                <option value="refund">Refund</option>
                <option value="category">Category</option>
                <option value="discount">Discount</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Hành động</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="">Tất cả</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="register">Register</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>
          </>
        )}

        {hasFilter && (
          <div className="flex flex-col gap-1 justify-end">
            <label className="text-xs text-transparent">x</label>
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              Xoá filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-sm">Không có dữ liệu</p>
          </div>
        ) : activeTab === "activity" ? (

          /* Activity log table */
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Module</th>
                <th className="px-4 py-3 text-left">Hành động</th>
                <th className="px-4 py-3 text-left">Mô tả</th>
                <th className="px-4 py-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {log.created_at}
                  </td>
                  <td className="px-4 py-3">
                    {log.user ? (
                      <>
                        <p className="text-gray-700 font-medium text-xs">{log.user.name}</p>
                        <p className="text-xs text-gray-400">{log.user.email}</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Ẩn danh</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODULE_COLORS[log.module] ?? "bg-gray-100 text-gray-600"}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    <span className="flex items-center gap-1">
                      <span>{ACTION_ICONS[log.action] ?? "⚙️"}</span>
                      <span className="font-mono">{log.action}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[220px] truncate" title={log.description}>
                    {log.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        ) : (

          /* Login log table */
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Đăng nhập</th>
                <th className="px-4 py-3 text-left">Đăng xuất</th>
                <th className="px-4 py-3 text-left">Thời lượng</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Trình duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {log.user ? (
                      <>
                        <p className="text-gray-700 font-medium text-xs">{log.user.name}</p>
                        <p className="text-xs text-gray-400">{log.user.email}</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Ẩn danh</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {log.login_at}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {log.logout_at
                      ? <span className="text-gray-500">{log.logout_at}</span>
                      : <span className="text-green-500 font-medium">● Đang online</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDuration(log.duration)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                    {log.ip_address}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[180px] truncate" title={log.user_agent}>
                    {log.user_agent ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            ‹
          </button>
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm transition ${
                p === page
                  ? "bg-blue-500 text-white font-medium shadow-sm"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}