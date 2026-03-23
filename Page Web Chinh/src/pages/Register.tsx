import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = `${formData.get("firstName") || ""} ${formData.get("lastName") || ""}`.trim();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const phone = formData.get("phone") as string;

    if (!fullName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
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
      toast.success("Đăng ký thành công! Hãy đăng nhập ngay.");
      navigate("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
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
            <p className="text-stone-500 mt-2 text-sm">Tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="firstName">Họ</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="Nguyễn"
                  className="border border-stone-300 rounded-lg px-3 py-3 text-sm outline-none transition-all
                             focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700" htmlFor="lastName">Tên</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Văn A"
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
              <label className="text-sm font-medium text-stone-700" htmlFor="phone">Số điện thoại</label>
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
              <label className="text-sm font-medium text-stone-700" htmlFor="password">Mật khẩu <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Ít nhất 6 ký tự"
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
              <label className="text-sm font-medium text-stone-700" htmlFor="confirmPassword">Xác nhận mật khẩu <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
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
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-stone-400 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          <p className="text-center text-sm text-stone-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-medium text-stone-800 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
