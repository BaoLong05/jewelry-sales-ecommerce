import { useState, useEffect, useCallback } from "react";
import {
  getRefundRequests,
  approveRefund,
  rejectRefund,
} from "../../services/adminRefundService";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/image";

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã chấp nhận" },
  { key: "rejected", label: "Đã từ chối" },
  { key: "refunded", label: "Đã hoàn tiền" },
];

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

export default function RefundManagement() {
  document.title = "Quản lý hoàn đơn";
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRefundRequests({ status: activeTab || undefined });
      setRequests(res.data.data ?? []);
      setMeta(res.data.meta ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openModal = (req, act) => {
    setSelected(req);
    setAction(act);
    setAdminNote("");
  };

  const closeModal = () => {
    setSelected(null);
    setAction("");
    setAdminNote("");
  };

  const handleSubmit = async () => {
    if (action === "reject" && adminNote.trim().length < 10) {
      toast.error("Vui lòng nhập lý do từ chối ít nhất 10 ký tự.");
      return;
    }
    setSubmitting(true);
    try {
      if (action === "approve") {
        await approveRefund(selected.id, adminNote);
        toast.success("Đã chấp nhận yêu cầu hoàn hàng.");
      } else {
        await rejectRefund(selected.id, adminNote);
        toast.success("Đã từ chối yêu cầu hoàn hàng.");
      }
      closeModal();
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Quản lý hoàn hàng
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Không có yêu cầu nào
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Sản phẩm</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Lý do</th>
                <th className="px-4 py-3 text-left">Ngày gửi</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {req.product?.thumbnail && (
                        <img
                          src={getImageUrl(req.product.thumbnail)}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                      )}
                      <span className="text-gray-700 max-w-[150px] truncate">
                        {req.product?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 font-medium">
                      {req.user?.name}
                    </p>
                    <p className="text-xs text-gray-400">{req.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {req.order?.order_code}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-gray-600 truncate">{req.reason}</p>
                    {req.images?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {req.images.slice(0, 3).map((url, i) => (
                          <img
                            key={i}
                            src={getImageUrl(url)}
                            alt=""
                            className="w-8 h-8 rounded object-cover cursor-pointer"
                            onClick={() => window.open(getImageUrl(url), "_blank")}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {req.created_at}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[req.status]}`}
                    >
                      {req.status_label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(req, "approve")}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => openModal(req, "reject")}
                          className="px-3 py-1 border border-red-300 text-red-500 hover:bg-red-50 text-xs rounded-lg transition-colors"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                    {req.status !== "pending" && req.admin_note && (
                      <p
                        className="text-xs text-gray-400 italic max-w-[150px] truncate"
                        title={req.admin_note}
                      >
                        {req.admin_note}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal xác nhận */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">
              {action === "approve"
                ? "✅ Xác nhận duyệt hoàn hàng"
                : "❌ Từ chối hoàn hàng"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Sản phẩm: <strong>{selected.product?.name}</strong>
              <br />
              Khách hàng: <strong>{selected.user?.name}</strong>
            </p>

            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
              Lý do khách: {selected.reason}
            </p>

            <label className="text-xs text-gray-500 mb-1 block">
              Ghi chú Admin{" "}
              {action === "reject" && (
                <span className="text-red-400">* (bắt buộc)</span>
              )}
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={
                action === "approve"
                  ? "Ghi chú thêm (không bắt buộc)..."
                  : "Lý do từ chối (bắt buộc)..."
              }
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {action === "approve" && (
              <p className="text-xs text-orange-500 mt-2">
                ⚠️ Sau khi duyệt, trạng thái đơn hàng sẽ chuyển sang "Đã hoàn
                tiền".
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50
                  ${action === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                {submitting
                  ? "Đang xử lý..."
                  : action === "approve"
                    ? "Xác nhận duyệt"
                    : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
