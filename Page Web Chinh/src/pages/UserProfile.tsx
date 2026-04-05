import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import { logout } from "../features/auth/authSlice";
import { store } from "../store";
import { clearCart } from "../features/cart/cartSlice";
import { getAuthToken } from "../features/auth/authSlice";
import { useTranslation } from "react-i18next";

type ProfileData = {
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
};

const UserProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "vouchers">("profile");
  const [passStep, setPassStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [oldPassSave, setOldPassSave] = useState("");
  const [newPassSave, setNewPassSave] = useState("");
  const isSavingRef = useRef(false);
  
  // Vouchers state
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  const handleLogout = () => {
    store.dispatch(clearCart());
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

  const fetchVouchers = async () => {
    const token = getAuthToken();
    if (!token) return;
    setVouchersLoading(true);
    try {
      const res = await customFetch.get("/promotions/my-vouchers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setVouchers(res.data.data);
      }
    } catch (e) {
      console.error("Lỗi lấy voucher:", e);
    } finally {
      setVouchersLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    const token = getAuthToken();
    if (!token) { isSavingRef.current = false; navigate("/login"); return; }
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
      isSavingRef.current = false;
    }
  };

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    const token = getAuthToken();
    if (!token) { isSavingRef.current = false; navigate("/login"); return; }
    
    const formData = new FormData(e.currentTarget);
    const oldPass = formData.get("oldPassword") as string;
    const newPass = formData.get("newPassword") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (!oldPass || !newPass || !confirm) { 
      toast.error("Vui lòng điền đủ thông tin"); 
      isSavingRef.current = false;
      return; 
    }
    if (newPass !== confirm) { 
      toast.error("Mật khẩu xác nhận không khớp"); 
      isSavingRef.current = false;
      return; 
    }
    if (newPass.length < 6) { 
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự"); 
      isSavingRef.current = false;
      return; 
    }

    setSaving(true);
    try {
      await customFetch.post("/user/request-change-password-otp", {
        oldPassword: oldPass,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setOldPassSave(oldPass);
      setNewPassSave(newPass);
      setPassStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Yêu cầu thất bại.");
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  const handleConfirmChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSavingRef.current) return;
    if (!otp) { toast.error("Vui lòng nhập mã OTP"); return; }
    
    isSavingRef.current = true;
    const token = getAuthToken();
    setSaving(true);
    try {
      await customFetch.put("/user/change-password", {
        oldPassword: oldPassSave,
        newPassword: newPassSave,
        OTP: otp,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Đổi mật khẩu thành công!");
      setPassStep("form");
      setOtp("");
      setOldPassSave("");
      setNewPassSave("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchVouchers();
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
            <h1 className="text-2xl font-semibold text-stone-800">{user?.FullName || t("profile.my_account", "Tài khoản của tôi")}</h1>
            <p className="text-stone-500 text-sm mt-0.5">{user?.Email}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/order-history"
              className="text-sm border border-stone-300 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
            >
              📦 {t("profile.order_history", "Lịch sử đơn hàng")}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              {t("profile.logout", "Đăng xuất")}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-stone-200">
            {(["profile", "vouchers", "password"] as const).map((tab) => {
              const tabNames = {
                profile: t("profile.tab_profile", "Thông tin cá nhân"),
                vouchers: t("profile.tab_vouchers", "Voucher của tôi"),
                password: t("profile.tab_password", "Đổi mật khẩu")
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-stone-800 text-stone-800 bg-stone-50/50"
                      : "text-stone-500 hover:text-stone-700 hover:bg-stone-50/50"
                  }`}
                >
                  {tabNames[tab]}
                </button>
              );
            })}
          </div>

          <div className="px-8 py-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">{t("profile.fullname", "Họ và tên")}</label>
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
                  <label className="text-sm font-medium text-stone-700">{t("profile.email", "Email")}</label>
                  <input
                    type="email"
                    defaultValue={user?.Email}
                    disabled
                    className="border border-stone-200 rounded-lg px-4 py-3 text-base bg-stone-50 text-stone-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-stone-400">{t("profile.email_desc", "Email không thể thay đổi")}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">{t("profile.phone", "Số điện thoại")}</label>
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
                  <label className="text-sm font-medium text-stone-700">{t("profile.address", "Địa chỉ giao hàng")}</label>
                  <textarea
                    name="address"
                    defaultValue={user?.Address}
                    placeholder={t("profile.address", "Địa chỉ giao hàng")}
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
                  {saving ? t("profile.saving", "Đang lưu...") : t("profile.save", "Lưu thông tin")}
                </button>
              </form>
            )}

            {/* Vouchers Tab */}
            {activeTab === "vouchers" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-stone-800">{t("profile.vip_vrs", "Kho Voucher Đặc Quyền ✨")}</h3>
                  <span className="text-sm font-medium text-stone-500">
                    {vouchers.filter((v: any) => !v.IsUsed).length} {t("profile.avail", "mã khả dụng")}
                  </span>
                </div>

                {vouchersLoading ? (
                  <div className="text-center py-10 text-stone-500 animate-pulse">{t("profile.loading", "Đang tải voucher...")}</div>
                ) : vouchers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vouchers.map((v: any) => (
                      <div key={v.VoucherID} className={`border rounded-xl p-5 relative overflow-hidden group transition-all ${
                        v.IsUsed
                          ? 'bg-stone-100/50 border-stone-200 opacity-60'
                          : 'bg-gradient-to-r from-stone-50 to-stone-100/50 border-stone-200 hover:shadow-md'
                      }`}>
                        {/* Used badge */}
                        {v.IsUsed && (
                          <div className="absolute top-3 right-3 bg-stone-400 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                            Đã sử dụng
                          </div>
                        )}
                        {!v.IsUsed && <div className="absolute top-0 right-0 w-2 h-full bg-stone-800 opacity-20 group-hover:opacity-100 transition-opacity"></div>}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="inline-block px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase rounded-md mb-2 tracking-wider">
                              {t("profile.off", "Giảm")} {v.DiscountPercent}%
                            </span>
                            <h4 className={`font-mono text-xl font-bold tracking-widest px-3 py-1.5 rounded border shadow-sm inline-block ${
                              v.IsUsed
                                ? 'text-stone-400 bg-stone-100 border-stone-200 line-through'
                                : 'text-stone-800 bg-white border-stone-200'
                            }`}>
                              {v.Code}
                            </h4>
                          </div>
                          {!v.IsUsed && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(v.Code);
                                toast.success("Đã sao chép mã voucher!");
                              }}
                              className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-colors"
                              title="Sao chép mã"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 font-medium">
                          {v.IsUsed
                            ? <span className="text-stone-400">✓ Mã đã được dùng</span>
                            : <>{t("profile.exp", "HSD")}: {new Date(v.EndDate).toLocaleDateString("vi-VN")}</>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-stone-200 rounded-xl">
                    <div className="text-4xl mb-3">🎫</div>
                    <h3 className="text-stone-700 font-semibold mb-1">{t("profile.empty_vr", "Chưa có voucher nào")}</h3>
                    <p className="text-stone-500 text-sm">{t("profile.empty_vr_desc", "Hãy mua sắm thêm để nhận mã giảm giá đặc quyền từ chúng tôi nhé.")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && passStep === "form" && (
              <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">{t("profile.cur_pass", "Mật khẩu hiện tại")}</label>
                  <input
                    name="oldPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">{t("profile.new_pass", "Mật khẩu mới")}</label>
                  <input
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">{t("profile.conf_pass", "Xác nhận mật khẩu mới")}</label>
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
                  {saving ? t("profile.sending_otp", "Đang gửi OTP...") : t("profile.change_pass", "Đổi mật khẩu")}
                </button>
              </form>
            )}

            {activeTab === "password" && passStep === "otp" && (
              <form onSubmit={handleConfirmChangePassword} className="flex flex-col gap-5">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                  ✅ Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư rác).
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Mã OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã 6 số"
                    maxLength={6}
                    className="border border-stone-300 rounded-lg px-4 py-3 text-xl text-center tracking-[0.5em] outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-6 rounded-lg
                             transition-all duration-200 disabled:opacity-60"
                >
                  {saving ? "Đang xác nhận..." : "Xác nhận đổi mật khẩu"}
                </button>

                <button
                  type="button"
                  onClick={() => { setPassStep("form"); setOtp(""); }}
                  className="text-center text-sm text-stone-500 hover:text-stone-800 transition-colors"
                >
                  ← Quay lại nhập mật khẩu
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
