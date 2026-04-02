import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSystemConfig } from "../hooks/useSystemConfig";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const { config } = useSystemConfig();

  // Đóng đăng ký Customer mới
  if (config.close_registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-12 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-light tracking-widest text-stone-800 uppercase mb-3">Fashion</h2>
          <p className="text-stone-700 font-medium mb-2">{t("auth.reg_closed_title", "Đăng ký tạm thời bị đóng")}</p>
          <p className="text-stone-500 text-sm mb-8">{t("auth.reg_closed_desc", "Hệ thống hiện đang tạm dừng nhận thành viên mới. Vui lòng quay lại sau.")}</p>
          <Link to="/login" className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-8 rounded-lg transition-colors">
            {t("auth.back_to_login", "Quay lại Đăng nhập")}
          </Link>
        </div>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = `${formData.get("firstName") || ""} ${formData.get("lastName") || ""}`.trim();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const phone = formData.get("phone") as string;

    if (!fullName || !email || !password) {
      toast.error(t("auth.fill_required", "Vui lòng điền đầy đủ thông tin bắt buộc"));
      return;
    }
    // Validate tên: ít nhất 2 ký tự, không chứa số hoặc ký tự đặc biệt
    if (fullName.trim().length < 2) {
      toast.error("Họ và tên phải có ít nhất 2 ký tự");
      return;
    }
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName.trim())) {
      toast.error("Họ và tên chỉ được chứa chữ cái và khoảng trắng (không có số hoặc ký tự đặc biệt)");
      return;
    }
    // Validate email: phải đúng định dạng
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Email không đúng định dạng (ví dụ: name@example.com)");
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("auth.pass_not_match", "Mật khẩu xác nhận không khớp"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("auth.pass_min_length", "Mật khẩu phải có ít nhất 6 ký tự"));
      return;
    }

    setLoading(true);
    try {
      await customFetch.post("/auth-temp/register", {
        FullName: fullName,
        Email: email,
        Password: password,
        PhoneNumber: phone || null,
      });
      toast.success(t("auth.reg_success", "Đăng ký thành công! Hãy đăng nhập ngay."));
      navigate("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("auth.reg_fail", "Đăng ký thất bại. Vui lòng thử lại.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 sm:px-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-widest text-stone-800 uppercase">Fashion</h1>
            <p className="text-stone-500 mt-2 text-sm">{t("auth.create_account", "Tạo tài khoản mới")}</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="firstName">{t("auth.first_name", "Họ")}</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder={t("auth.fn_placeholder", "Nguyễn")}
                  className="border border-stone-300 rounded-lg px-3 py-3 text-sm outline-none transition-all
                             focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="lastName">{t("auth.last_name", "Tên")}</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder={t("auth.ln_placeholder", "Văn A")}
                  className="border border-stone-300 rounded-lg px-3 py-3 text-sm outline-none transition-all
                             focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700" htmlFor="email">Email <span className="text-red-400">*</span></label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                           focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700" htmlFor="phone">{t("auth.phone", "Số điện thoại")}</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="0901 234 567"
                className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                           focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700" htmlFor="password">{t("auth.password", "Mật khẩu")} <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder={t("auth.pass_placeholder", "Ít nhất 6 ký tự")}
                  className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all w-full
                             focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPass ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700" htmlFor="confirmPassword">{t("auth.confirm_password", "Xác nhận mật khẩu")} <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  name="confirmPassword"
                  placeholder={t("auth.confirm_pass_placeholder", "Nhập lại mật khẩu")}
                  className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all w-full
                             focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showConfirmPass ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-6 rounded-lg
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("auth.creating_account", "Đang tạo tài khoản...") : t("auth.register", "Đăng ký")}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-stone-400 text-sm">{t("auth.or", "hoặc")}</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          <p className="text-center text-sm text-stone-600">
            {t("auth.has_account", "Đã có tài khoản?")}{" "}
            <Link to="/login" className="font-medium text-stone-800 hover:underline">
              {t("auth.login", "Đăng nhập")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
