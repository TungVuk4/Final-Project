import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type Step = "email" | "otp";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Gửi OTP tới Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error(t("auth.enter_email", "Vui lòng nhập email")); return; }
    setLoading(true);
    try {
      await customFetch.post("/auth-temp/forgot-password", { Email: email });
      toast.success(t("auth.otp_sent", "Mã OTP đã được gửi về email của bạn!"));
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("auth.email_not_exist", "Email không tồn tại trong hệ thống"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Đặt lại mật khẩu với OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) { toast.error(t("auth.fill_info", "Vui lòng điền đầy đủ thông tin")); return; }
    if (newPassword !== confirmPassword) { toast.error(t("auth.pass_not_match", "Mật khẩu xác nhận không khớp")); return; }
    if (newPassword.length < 6) { toast.error(t("auth.pass_min_length", "Mật khẩu phải có ít nhất 6 ký tự")); return; }

    setLoading(true);
    try {
      await customFetch.put("/auth-temp/reset-password", {
        Email: email,
        OTP: otp,
        newPassword: newPassword,
      });
      toast.success(t("auth.reset_success", "Đặt lại mật khẩu thành công! Hãy đăng nhập lại."));
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("auth.invalid_otp", "Mã OTP không hợp lệ hoặc đã hết hạn"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 sm:px-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-widest text-stone-800 uppercase">Fashion</h1>
            <p className="text-stone-500 mt-2 text-sm">
              {step === "email" ? t("auth.reset_pass", "Đặt lại mật khẩu") : t("auth.enter_otp", "Nhập mã OTP xác nhận")}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step === "email" ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-600"}`}>
              1
            </div>
            <div className="flex-1 h-px bg-stone-200 max-w-[60px]"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step === "otp" ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-500"}`}>
              2
            </div>
          </div>

          {/* Step 1: Email Form */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm text-stone-600">
                {t("auth.email_instruction", "💌 Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác nhận.")}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="email">{t("auth.email_address", "Địa chỉ Email")}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                             focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-6 rounded-lg
                           transition-all duration-200 disabled:opacity-60"
              >
                {loading ? t("auth.sending", "Đang gửi...") : t("auth.send_otp", "Gửi mã OTP")}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <div
                className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700"
                dangerouslySetInnerHTML={{ __html: t("auth.otp_instruction", "✅ Mã OTP đã được gửi đến <strong>{{email}}</strong>. Kiểm tra hộp thư (kể cả Spam).", { email }) }}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="otp">{t("auth.otp_code", "Mã OTP")}</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={t("auth.enter_6_digits", "Nhập mã 6 số")}
                  maxLength={6}
                  className="border border-stone-300 rounded-lg px-4 py-3 text-xl text-center tracking-[0.5em] outline-none transition-all
                             focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400 placeholder:tracking-normal placeholder:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="newPassword">{t("auth.new_password", "Mật khẩu mới")}</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("auth.pass_placeholder", "Ít nhất 6 ký tự")}
                    className="w-full border border-stone-300 rounded-lg pl-4 pr-12 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showNewPassword ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="confirmPassword">{t("auth.confirm_new_pass", "Xác nhận mật khẩu mới")}</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.reenter_new_pass", "Nhập lại mật khẩu mới")}
                    className="w-full border border-stone-300 rounded-lg pl-4 pr-12 py-3 text-base outline-none transition-all
                               focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showConfirmPassword ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-6 rounded-lg
                           transition-all duration-200 disabled:opacity-60"
              >
                {loading ? t("auth.updating", "Đang cập nhật...") : t("auth.reset_pass", "Đặt lại mật khẩu")}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-center text-sm text-stone-500 hover:text-stone-800 transition-colors"
              >
                {t("auth.resend_otp", "← Gửi lại mã OTP")}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              {t("auth.back_to_login", "← Quay về đăng nhập")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
