import { useState, useEffect } from "react";
import { getAddresses, createAddress } from "../../services/addressService";
import { toast } from "react-toastify";

export default function AddressForm({ onSelect, selectedId }) {
  document.title = "Địa chỉ mua hàng";
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    receiver_name: "", phone: "",
    province: "", district: "", ward: "", street: "",
    is_default: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json")
      .then(r => r.json()).then(setProvinces);
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const res = await getAddresses();
    const list = res.data.data || [];
    setAddresses(list);
    if (list.length === 0) setShowForm(true);
    else {
      const def = list.find(a => a.is_default) || list[0];
      onSelect(def.id);
    }
  };

  const handleProvince = (name) => {
    const p = provinces.find(x => x.Name === name);
    setDistricts(p?.Districts || []);
    setWards([]);
    setForm(f => ({ ...f, province: name, district: "", ward: "" }));
  };

  const handleDistrict = (name) => {
    const d = districts.find(x => x.Name === name);
    setWards(d?.Wards || []);
    setForm(f => ({ ...f, district: name, ward: "" }));
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return toast.error("Trình duyệt không hỗ trợ định vị");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=vi`
          );
          const data = await res.json();
          const addr = data.address;
          // Tìm tỉnh match
          const provinceName = addr.state || "";
          const matched = provinces.find(p =>
            p.Name.includes(provinceName) || provinceName.includes(p.Name.replace("Tỉnh ","").replace("Thành phố ",""))
          );
          if (matched) {
            setDistricts(matched.Districts);
            setForm(f => ({ ...f, province: matched.Name }));
            toast.success("Đã lấy tỉnh/thành phố từ vị trí của bạn");
          } else {
            toast.info("Không tìm được tỉnh, hãy chọn thủ công");
          }
        } catch {
          toast.error("Không thể lấy địa chỉ từ vị trí");
        } finally {
          setLocating(false);
        }
      },
      () => { toast.error("Không thể truy cập vị trí"); setLocating(false); }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.receiver_name.trim()) e.receiver_name = "Vui lòng nhập tên người nhận";
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(form.phone)) e.phone = "Số điện thoại không hợp lệ";
    if (!form.province) e.province = "Chọn tỉnh/thành phố";
    if (!form.district) e.district = "Chọn quận/huyện";
    if (!form.ward) e.ward = "Chọn phường/xã";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const res = await createAddress(form);
      toast.success("Đã lưu địa chỉ!");
      setAddresses(prev => [...prev, res.data.data]);
      onSelect(res.data.data.id);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lưu địa chỉ thất bại");
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-amber-200 ${
      errors[field] ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white/50 focus:border-amber-300"
    }`;

  return (
    <div className="space-y-3">
      {/* Danh sách địa chỉ đã có */}
      {addresses.map(addr => (
        <label
          key={addr.id}
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
            selectedId === addr.id ? "border-amber-400 bg-amber-50/50" : "border-gray-200 hover:border-amber-200"
          }`}
        >
          <input
            type="radio" name="address" value={addr.id}
            checked={selectedId === addr.id}
            onChange={() => onSelect(addr.id)}
            className="mt-1 accent-amber-600"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-800">{addr.receiver_name} · {addr.phone}</p>
            <p className="text-gray-500 mt-0.5">
              {[addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}
            </p>
            {addr.is_default && (
              <span className="inline-block mt-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Mặc định
              </span>
            )}
          </div>
        </label>
      ))}

      {/* Toggle form thêm mới */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-2.5 rounded-xl border border-dashed border-amber-300 text-amber-700 text-sm hover:bg-amber-50 transition"
      >
        + Thêm địa chỉ mới
      </button>

      {showForm && (
        <div className="bg-white/80 rounded-2xl border border-amber-100 p-5 space-y-4">
          {/* Nút định vị */}
          <button
            onClick={handleLocate}
            disabled={locating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 text-blue-700 text-sm hover:bg-blue-50 transition disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {locating ? "Đang định vị..." : "Lấy vị trí hiện tại"}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tên người nhận *</label>
              <input className={inputClass("receiver_name")} placeholder="Nguyễn Văn A"
                value={form.receiver_name} onChange={e => setForm(f => ({...f, receiver_name: e.target.value}))}/>
              {errors.receiver_name && <p className="text-xs text-rose-500 mt-1">{errors.receiver_name}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Số điện thoại *</label>
              <input className={inputClass("phone")} placeholder="0901234567" type="tel"
                value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}/>
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tỉnh/Thành phố *</label>
              <select className={inputClass("province")} value={form.province}
                onChange={e => handleProvince(e.target.value)}>
                <option value="">-- Chọn --</option>
                {provinces.map(p => <option key={p.Id} value={p.Name}>{p.Name}</option>)}
              </select>
              {errors.province && <p className="text-xs text-rose-500 mt-1">{errors.province}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Quận/Huyện *</label>
              <select className={inputClass("district")} value={form.district}
                onChange={e => handleDistrict(e.target.value)} disabled={!form.province}>
                <option value="">-- Chọn --</option>
                {districts.map(d => <option key={d.Id} value={d.Name}>{d.Name}</option>)}
              </select>
              {errors.district && <p className="text-xs text-rose-500 mt-1">{errors.district}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phường/Xã *</label>
              <select className={inputClass("ward")} value={form.ward}
                onChange={e => setForm(f => ({...f, ward: e.target.value}))} disabled={!form.district}>
                <option value="">-- Chọn --</option>
                {wards.map(w => <option key={w.Id} value={w.Name}>{w.Name}</option>)}
              </select>
              {errors.ward && <p className="text-xs text-rose-500 mt-1">{errors.ward}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Số nhà, tên đường (không bắt buộc)</label>
            <input className={inputClass("street")} placeholder="VD: 123 Nguyễn Trãi"
              value={form.street} onChange={e => setForm(f => ({...f, street: e.target.value}))}/>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.is_default} className="accent-amber-600"
              onChange={e => setForm(f => ({...f, is_default: e.target.checked}))}/>
            Đặt làm địa chỉ mặc định
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition">
              Hủy
            </button>
            <button onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition">
              Lưu địa chỉ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}