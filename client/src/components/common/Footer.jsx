import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/uu-dai", label: "Ưu đãi" },
  { to: "/bo-suu-tap", label: "Bộ sưu tập" },
  { to: "/lien-he", label: "Liên hệ" },
];

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr] gap-8">
          <div>
            <Link to="/" className="text-3xl font-serif font-bold text-amber-400 tracking-wide">
              LUMINA
            </Link>
            <p className="text-sm text-stone-400 mt-3 leading-6 max-w-md">
              Trang sức tinh tế cho những khoảnh khắc đáng nhớ. Lumina hỗ trợ tư vấn, chọn quà và chăm sóc khách hàng mỗi ngày.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Điều hướng</h3>
            <div className="grid gap-2">
              {FOOTER_LINKS.map((item) => (
                <Link key={item.to} to={item.to} className="text-sm text-stone-400 hover:text-amber-300 transition">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Liên hệ</h3>
            <div className="space-y-2 text-sm text-stone-400">
              <p>Hotline: 0901 234 567</p>
              <p>Email: support@lumina.vn</p>
              <p>123 Võ Văn Ngân, Quận Thủ Đức, TP. Hồ Chí Minh</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 Lumina Jewelry. All rights reserved.</p>
          <p>Thanh toán an toàn · Hỗ trợ khách hàng · Ưu đãi định kỳ</p>
        </div>
      </div>
    </footer>
  );
}
