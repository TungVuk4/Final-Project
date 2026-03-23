import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import { logout } from "../features/auth/authSlice";
import { store } from "../store";
import { getAuthToken } from "../features/auth/authSlice";

type ProfileData = {
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const handleLogout = () => {
    store.dispatch(logout());
    toast.success("Đã đăng xuất thành công");
    navigate("/login");
  };

  const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) { navigate("/login"); return; }
    try {
      const res = await customFetch.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data || res.data);
    } catch {
      toast.error("Không thể tải thông tin tài khoản");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) { navigate("/login"); return; }
    const formData = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await customFetch.put("/user/profile", {
        FullName: formData.get("fullName"),
        PhoneNumber: formData.get("phone"),
        Address: formData.get("address"),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Cập nhật hồ sơ thành công!");
      fetchProfile();
    } catch {
      toast.error("Cập nhật thất bại, thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) { navigate("/login"); return; }
    const formData = new FormData(e.currentTarget);
    const oldPass = formData.get("oldPassword") as string;
    const newPass = formData.get("newPassword") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (newPass !== confirm) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    if (newPass.length < 6) { toast.error("Mật khẩu mới phải có ít nhất 6 ký tự"); return; }

    setSaving(true);
    try {
      await customFetch.put("/user/change-password", {
        oldPassword: oldPass,
        newPassword: newPass,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Đổi mật khẩu thành công!");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500 text-lg animate-pulse">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg px-8 py-6 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-800">{user?.FullName || "Tài khoản của tôi"}</h1>
            <p className="text-stone-500 text-sm mt-0.5">{user?.Email}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/order-history"
              className="text-sm border border-stone-300 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
            >
              📦 Lịch sử đơn hàng
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-stone-200">
            {(["profile", "password"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-stone-800 text-stone-800"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {tab === "profile" ? "Thông tin cá nhân" : "Đổi mật khẩu"}
              </button>
            ))}
          </div>

          <div className="px-8 py-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Họ và tên</label>
                  <input
                    name="fullName"
                    type="text"
                    defaultValue={user?.FullName}
                    placeholder="Nguyễn Văn A"
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.Email}
                    disabled
                    className="border border-stone-200 rounded-lg px-4 py-3 text-base bg-stone-50 text-stone-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-stone-400">Email không thể thay đổi</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Số điện thoại</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={user?.PhoneNumber}
                    placeholder="0901 234 567"
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Địa chỉ giao hàng</label>
                  <textarea
                    name="address"
                    defaultValue={user?.Address}
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                    rows={3}
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all resize-none
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-6 rounded-lg
                             transition-all duration-200 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </form>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Mật khẩu hiện tại</label>
                  <input
                    name="oldPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Mật khẩu mới</label>
                  <input
                    name="newPassword"
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Xác nhận mật khẩu mới</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-6 rounded-lg
                             transition-all duration-200 disabled:opacity-60"
                >
                  {saving ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
