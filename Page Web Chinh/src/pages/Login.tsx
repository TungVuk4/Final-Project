import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { setUserInfo } from "../features/auth/authSlice";
import { store } from "../store";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error(t("auth.enter_email_pass", "Vui lòng nhập đầy đủ email và mật khẩu"));
      return;
    }

    setLoading(true);
    try {
      const res = await customFetch.post("/auth-temp/login", {
        Email: email,
        Password: password,
      });

      const { token, user } = res.data;

      store.dispatch(setUserInfo({
        userId: user.UserID,
        email: user.Email,
        fullName: user.FullName,
        role: user.Role,
        token,
      }));

      // Đồng bộ giỏ hàng Local (khách vãng lai) lên Server
      const localCartStr = localStorage.getItem("fashionCart");
      if (localCartStr) {
        try {
          const localCart = JSON.parse(localCartStr);
          if (localCart.productsInCart && localCart.productsInCart.length > 0) {
            for (const item of localCart.productsInCart) {
              if (item.productId) {
                try {
                  await customFetch.post(
                    "/cart/add",
                    { productId: item.productId, quantity: item.quantity, size: item.size || "xs" },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                } catch (e) {
                  console.error("Lỗi đồng bộ giỏ hàng từng phần:", e);
                }
              }
            }
          }
        } catch (e) {
          console.error("Lỗi parse giỏ hàng local:", e);
        }
      }

      toast.success(t("auth.welcome_back", "Chào mừng trở lại, {{name}}!", { name: user.FullName }));
      navigate("/user-profile");
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("auth.invalid_credentials", "Email hoặc mật khẩu không đúng");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem("fashionUser");
    if (raw) {
      navigate("/user-profile");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 sm:px-10">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-widest text-stone-800 uppercase">Fashion</h1>
            <p className="text-stone-500 mt-2 text-sm">{t("auth.login_desc", "Đăng nhập vào tài khoản của bạn")}</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                autoComplete="email"
                className="border border-stone-300 rounded-lg px-4 py-3 text-base outline-none transition-all
                           focus:border-stone-600 focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-stone-700" htmlFor="password">{t("auth.password", "Mật khẩu")}</label>
                <Link to="/forgot-password" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
                  {t("auth.forgot_password", "Quên mật khẩu?")}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-6 rounded-lg
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-stone-600 focus:ring-offset-2"
            >
              {loading ? t("auth.logging_in", "Đang đăng nhập...") : t("auth.login", "Đăng nhập")}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-stone-400 text-sm">{t("auth.or", "hoặc")}</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          <p className="text-center text-sm text-stone-600">
            {t("auth.no_account", "Chưa có tài khoản?")}{" "}
            <Link to="/register" className="font-medium text-stone-800 hover:underline">
              {t("auth.register_now", "Đăng ký ngay")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
