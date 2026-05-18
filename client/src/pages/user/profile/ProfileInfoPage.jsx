import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../../services/addressService";
import {
  getUserProfile,
  updateUserProfile,
} from "../../../services/profileService/userService";

const emptyAddress = {
  receiver_name: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  street: "",
  is_default: false,
};

const emptyPassword = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

export default function ProfileInfoPage() {
  document.title = "Thông tin tài khoản";

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [errors, setErrors] = useState({});

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, addressRes] = await Promise.all([
        getUserProfile(),
        getAddresses(),
      ]);
      const profile = profileRes.data.data;

      setUser(profile);
      setProfileForm({
        name: profile?.name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
      });
      setAddresses(addressRes.data.data || profile?.addresses || []);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const getValidationErrors = (err) => err.response?.data?.errors || {};
  const fieldError = (name) => errors[name]?.[0];

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setErrors({});

    try {
      const res = await updateUserProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
      });
      setUser(res.data.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      toast.success(res.data.message || "Đã cập nhật thông tin");
    } catch (err) {
      setErrors(getValidationErrors(err));
      toast.error(err.response?.data?.message || "Cập nhật thông tin thất bại");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setErrors({});

    try {
      await updateUserProfile(passwordForm);
      setPasswordForm(emptyPassword);
      toast.success("Đã đổi mật khẩu");
    } catch (err) {
      setErrors(getValidationErrors(err));
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setSavingPassword(false);
    }
  };

  const validateAddress = () => {
    const nextErrors = {};
    if (!addressForm.receiver_name.trim()) {
      nextErrors.receiver_name = ["Vui lòng nhập tên người nhận"];
    }
    if (!addressForm.phone.trim()) {
      nextErrors.address_phone = ["Vui lòng nhập số điện thoại"];
    }
    if (!addressForm.province.trim()) {
      nextErrors.province = ["Vui lòng nhập tỉnh/thành phố"];
    }
    if (!addressForm.district.trim()) {
      nextErrors.district = ["Vui lòng nhập quận/huyện"];
    }
    if (!addressForm.ward.trim()) {
      nextErrors.ward = ["Vui lòng nhập phường/xã"];
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    if (!validateAddress()) return;

    setSavingAddress(true);
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await createAddress(addressForm);
        toast.success("Đã thêm địa chỉ");
      }

      const res = await getAddresses();
      setAddresses(res.data.data || []);
      resetAddressForm();
    } catch (err) {
      setErrors(getValidationErrors(err));
      toast.error(err.response?.data?.message || "Lưu địa chỉ thất bại");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      receiver_name: address.receiver_name || "",
      phone: address.phone || "",
      province: address.province || "",
      district: address.district || "",
      ward: address.ward || "",
      street: address.street || "",
      is_default: Boolean(address.is_default),
    });
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;

    try {
      await deleteAddress(id);
      setAddresses((current) => current.filter((address) => address.id !== id));
      if (editingAddressId === id) resetAddressForm();
      toast.success("Đã xóa địa chỉ");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa địa chỉ thất bại");
    }
  };

  const inputClass = (name) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-amber-200 ${
      fieldError(name)
        ? "border-rose-400 bg-rose-50"
        : "border-gray-200 bg-white focus:border-amber-400"
    }`;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="border-b border-[#F0EDE5] pb-4 mb-5">
          <h1 className="text-xl font-serif font-semibold text-gray-800">
            Thông tin tài khoản
          </h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>

        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Họ tên</label>
            <input
              className={inputClass("name")}
              value={profileForm.name}
              onChange={(e) => setProfileForm((form) => ({ ...form, name: e.target.value }))}
            />
            {fieldError("name") && <p className="text-xs text-rose-500 mt-1">{fieldError("name")}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              value={profileForm.email}
              disabled
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Số điện thoại</label>
            <input
              className={inputClass("phone")}
              value={profileForm.phone}
              onChange={(e) => setProfileForm((form) => ({ ...form, phone: e.target.value }))}
            />
            {fieldError("phone") && <p className="text-xs text-rose-500 mt-1">{fieldError("phone")}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Địa chỉ nhanh</label>
            <input
              className={inputClass("address")}
              value={profileForm.address}
              onChange={(e) => setProfileForm((form) => ({ ...form, address: e.target.value }))}
              placeholder="Địa chỉ liên hệ"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              disabled={savingProfile}
              className="rounded-lg bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {savingProfile ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </section>

      <section className="border-t border-[#F0EDE5] pt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Đổi mật khẩu</h2>
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PasswordInput label="Mật khẩu hiện tại" name="current_password" value={passwordForm.current_password} onChange={setPasswordForm} error={fieldError("current_password")} />
          <PasswordInput label="Mật khẩu mới" name="password" value={passwordForm.password} onChange={setPasswordForm} error={fieldError("password")} />
          <PasswordInput label="Xác nhận mật khẩu mới" name="password_confirmation" value={passwordForm.password_confirmation} onChange={setPasswordForm} />
          <div className="md:col-span-3 flex justify-end">
            <button
              disabled={savingPassword}
              className="rounded-lg border border-amber-700 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
            >
              {savingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </section>

      <section className="border-t border-[#F0EDE5] pt-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-800">Địa chỉ giao hàng</h2>
          {editingAddressId && (
            <button type="button" onClick={resetAddressForm} className="text-sm text-gray-500 hover:text-amber-700">
              Thêm mới
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">Bạn chưa có địa chỉ giao hàng.</p>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="rounded-lg border border-[#E8E2D2] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {address.receiver_name} - {address.phone}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {[address.street, address.ward, address.district, address.province].filter(Boolean).join(", ")}
                      </p>
                      {address.is_default && (
                        <span className="inline-block mt-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEditAddress(address)} className="text-sm font-medium text-amber-700 hover:text-amber-800">
                        Sửa
                      </button>
                      <button type="button" onClick={() => handleDeleteAddress(address.id)} className="text-sm font-medium text-rose-600 hover:text-rose-700">
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddressSubmit} className="rounded-lg border border-[#E8E2D2] p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">
              {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField label="Tên người nhận" name="receiver_name" value={addressForm.receiver_name} onChange={setAddressForm} error={fieldError("receiver_name")} />
              <TextField label="Số điện thoại" name="phone" value={addressForm.phone} onChange={setAddressForm} error={fieldError("address_phone") || fieldError("phone")} />
              <TextField label="Tỉnh/Thành phố" name="province" value={addressForm.province} onChange={setAddressForm} error={fieldError("province")} />
              <TextField label="Quận/Huyện" name="district" value={addressForm.district} onChange={setAddressForm} error={fieldError("district")} />
              <TextField label="Phường/Xã" name="ward" value={addressForm.ward} onChange={setAddressForm} error={fieldError("ward")} />
              <TextField label="Số nhà, tên đường" name="street" value={addressForm.street} onChange={setAddressForm} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={addressForm.is_default}
                onChange={(e) => setAddressForm((form) => ({ ...form, is_default: e.target.checked }))}
                className="accent-amber-700"
              />
              Đặt làm địa chỉ mặc định
            </label>
            <button
              disabled={savingAddress}
              className="w-full rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {savingAddress ? "Đang lưu..." : editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function TextField({ label, name, value, onChange, error }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-amber-200 ${
          error ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white focus:border-amber-400"
        }`}
        value={value}
        onChange={(e) => onChange((form) => ({ ...form, [name]: e.target.value }))}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

function PasswordInput({ label, name, value, onChange, error }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type="password"
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-amber-200 ${
          error ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white focus:border-amber-400"
        }`}
        value={value}
        onChange={(e) => onChange((form) => ({ ...form, [name]: e.target.value }))}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
