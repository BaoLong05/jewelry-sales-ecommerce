import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { getDashboardStats } from "../../services/dashboardService";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );

const num = (n) => new Intl.NumberFormat("vi-VN").format(n ?? 0);

const ORDER_STATUS_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#6b7280",
];

const STATUS_BADGE = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipping: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

function KpiCard({ icon, label, value, sub, colorClass }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:-translate-y-0.5 transition-transform">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${colorClass}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-base font-semibold text-gray-800 mb-4">{children}</h2>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboardStats();
        setData(res.data.data);
        toast.success("Tải dữ liệu thành công!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Tải dữ liệu thất bại!");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Không có dữ liệu
      </div>
    );
  }

  const {
    kpi,
    order_status_chart,
    revenue_trend,
    revenue_by_month,
    top_products,
    low_stock,
    recent_orders,
    pending_refunds,
    new_users_by_month,
  } = data;

  const growthPositive = kpi.revenue.growth >= 0;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Thống kê kinh doanh tổng hợp
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard
          icon="💰"
          label="Doanh thu hôm nay"
          value={fmt(kpi.revenue.today)}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          icon="📅"
          label="Doanh thu tháng này"
          value={fmt(kpi.revenue.this_month)}
          sub={
            <span
              className={growthPositive ? "text-emerald-500" : "text-red-500"}
            >
              {growthPositive ? "▲" : "▼"} {Math.abs(kpi.revenue.growth)}% so
              với tháng trước
            </span>
          }
          colorClass="bg-blue-100 text-blue-600"
        />
        <KpiCard
          icon="🛍️"
          label="Đơn hàng hôm nay"
          value={num(kpi.orders.today)}
          sub={`Tổng: ${num(kpi.orders.total)} đơn`}
          colorClass="bg-purple-100 text-purple-600"
        />
        <KpiCard
          icon="⏳"
          label="Chờ xác nhận"
          value={num(kpi.orders.pending)}
          colorClass="bg-yellow-100 text-yellow-600"
        />
        <KpiCard
          icon="✅"
          label="Hoàn thành"
          value={num(kpi.orders.completed)}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          icon="❌"
          label="Đã huỷ"
          value={num(kpi.orders.cancelled)}
          colorClass="bg-red-100 text-red-600"
        />
        <KpiCard
          icon="👥"
          label="Khách hàng"
          value={num(kpi.users.total)}
          sub={`+${kpi.users.new_this_month} tháng này`}
          colorClass="bg-cyan-100 text-cyan-600"
        />
        <KpiCard
          icon="↩️"
          label="Hoàn hàng chờ duyệt"
          value={num(kpi.refunds.pending)}
          colorClass="bg-orange-100 text-orange-600"
        />
        <KpiCard
          icon="📦"
          label="Tổng sản phẩm"
          value={num(kpi.products.total)}
          sub={`${kpi.products.low_stock} sắp hết · ${kpi.products.out_of_stock} hết hàng`}
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <KpiCard
          icon="⭐"
          label="Đánh giá trung bình"
          value={`${kpi.reviews.avg_rating} / 5`}
          sub={`${num(kpi.reviews.total)} lượt đánh giá`}
          colorClass="bg-yellow-100 text-yellow-600"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle>🥧 Trạng thái đơn hàng</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={order_status_chart}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.03 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
              >
                {order_status_chart.map((_, i) => (
                  <Cell
                    key={i}
                    fill={ORDER_STATUS_COLORS[i % ORDER_STATUS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${num(v)} đơn`} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {order_status_chart.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1 text-xs text-gray-600"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{
                    background:
                      ORDER_STATUS_COLORS[i % ORDER_STATUS_COLORS.length],
                  }}
                />
                {item.name}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
          <SectionTitle>📈 Doanh thu 30 ngày gần nhất</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenue_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v) => fmt(v)}
                labelFormatter={(l) => `Ngày ${l}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle>📊 Doanh thu 12 tháng</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenue_by_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar
                dataKey="revenue"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                name="Doanh thu"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle>👥 Khách hàng mới 12 tháng</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={new_users_by_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v} khách`} />
              <Bar
                dataKey="total"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Khách mới"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle>🔥 Top sản phẩm bán chạy</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-l-lg">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50">
                    Sản phẩm
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50">
                    Đã bán
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-r-lg">
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {top_products.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-400 font-medium">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-gray-800 truncate max-w-[180px]">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Còn {p.stock} sản phẩm
                      </p>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                      {num(p.total_sold)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-600 text-xs">
                      {fmt(p.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle>⚠️ Sản phẩm sắp hết hàng</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-l-lg">
                    Sản phẩm
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50">
                    Giá
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-r-lg">
                    Tồn kho
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {low_stock.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-800 truncate max-w-[200px]">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600 text-xs">
                      {fmt(p.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${p.stock === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}
                      >
                        {p.stock === 0 ? "Hết hàng" : `Còn ${p.stock}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle>🆕 Đơn hàng mới nhất</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-l-lg">
                    Mã đơn
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50">
                    Khách hàng
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50">
                    Trạng thái
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-r-lg">
                    Tổng tiền
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent_orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-600">
                      {o.order_code}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-gray-800 text-xs">
                        {o.user?.name}
                      </p>
                      <p className="text-gray-400 text-xs">{o.created_at}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[o.status]}`}
                      >
                        {o.status_label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-red-500 text-xs">
                      {fmt(o.final_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle>↩️ Hoàn hàng chờ duyệt</SectionTitle>
          {pending_refunds.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              ✅ Không có yêu cầu nào đang chờ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-l-lg">
                      Khách hàng
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50">
                      Sản phẩm
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50">
                      Mã đơn
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-r-lg">
                      Ngày gửi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pending_refunds.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-gray-800 text-xs">
                          {r.user?.name}
                        </p>
                        <p className="text-gray-400 text-xs">{r.user?.email}</p>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-600 truncate max-w-[120px]">
                        {r.product}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-gray-500">
                        {r.order_code}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-400">
                        {r.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
