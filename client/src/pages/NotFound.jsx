import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Số 404 lớn */}
        <div className="relative mb-6">
          <p className="text-[120px] font-bold text-amber-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">💎</span>
              <p className="text-amber-700 font-semibold text-sm mt-1">Không tìm thấy</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-serif font-semibold text-gray-800 mb-2">
          Trang không tồn tại
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Trang bạn đang tìm kiếm có thể đã bị xoá, đổi tên hoặc tạm thời không khả dụng.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors"
          >
            ← Quay lại
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold transition-colors"
          >
            Về trang chủ
          </button>
        </div>

      </div>
    </div>
  );
}