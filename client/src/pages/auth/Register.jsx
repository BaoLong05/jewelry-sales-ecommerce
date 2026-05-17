import { useState } from "react";
import { registerApi } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  document.title = "Đăng ký";
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await registerApi(form);
      toast.success(res.data?.message || "Đăng ký thành công");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Đăng ký tài khoản thất bại!";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-md xl:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-amber-100/60 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>

          <div className="p-6 sm:p-8 md:p-10">
            <div className="text-center mb-5 sm:mb-6 md:mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-2 sm:mb-3 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-wide">
                LUMINA JEWELRY
              </h2>
              <p className="text-amber-600 text-xs sm:text-sm mt-1 font-light">
                Trở thành thành viên – Nhận ưu đãi đặc biệt
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 ml-1">
                  Họ và tên
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all duration-200 outline-none text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="Tên người dùng"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 ml-1">
                  Số điện thoại
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all duration-200 outline-none text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="Số điện thoại"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 ml-1">
                  Địa chỉ
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all duration-200 outline-none text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="Địa chỉ"
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all duration-200 outline-none text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 ml-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all duration-200 outline-none text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="Mật khẩu"
                  value={form.password || ""}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 ml-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all duration-200 outline-none text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="Xác nhận mật khẩu"
                  value={form.password_confirmation || ""}
                  onChange={(e) =>
                    setForm({ ...form, password_confirmation: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-medium py-2.5 sm:py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-amber-300 focus:outline-none text-sm sm:text-base mt-2"
              >
                Đăng ký
              </button>

              <div className="relative my-4 sm:my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-400 text-xs sm:text-sm">
                    đã có tài khoản?
                  </span>
                </div>
              </div>

              <p className="text-center text-gray-600 text-xs sm:text-sm">
                <Link
                  to="/login"
                  className="text-amber-700 hover:text-amber-900 font-medium hover:underline transition"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </form>
          </div>
        </div>

        <p className="text-center text-gray-400 text-[11px] sm:text-xs mt-5 sm:mt-6 px-2">
          Đăng ký ngay để nhận thông tin về bộ sưu tập mới và ưu đãi dành riêng
        </p>
      </div>
    </div>
  );
}
