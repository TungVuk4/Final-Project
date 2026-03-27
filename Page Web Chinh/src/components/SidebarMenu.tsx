import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiXMark, HiHome, HiShoppingBag, HiMagnifyingGlass, HiUser, HiArrowRightOnRectangle, HiUserPlus } from "react-icons/hi2";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { useTranslation } from "react-i18next";
import { logout as authLogout } from "../features/auth/authSlice";
import { store } from "../store";
import { clearCart } from "../features/cart/cartSlice";

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (prev: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const { loginStatus, userInfo } = useAppSelector((state) => state.auth);
  const { productsInCart } = useAppSelector((state) => state.cart);
  const cartCount = productsInCart.reduce((s, p) => s + p.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    toast.success("Đã đăng xuất thành công");
    store.dispatch(clearCart());
    store.dispatch(authLogout());
    navigate("/login");
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (isSidebarOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => setIsAnimating(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  const isActive = (path: string) => location.pathname === path;
  const close = () => setIsSidebarOpen(false);

  const menuItems = [
    { to: "/", label: t("menu.home", "Home"), icon: HiHome },
    { to: "/shop", label: t("menu.shop", "Shop"), icon: HiShoppingBag },
    { to: "/search", label: t("menu.search", "Search"), icon: HiMagnifyingGlass },
    { to: "/cart", label: `${t("menu.cart", "Cart")} ${cartCount > 0 ? `(${cartCount})` : ""}`, icon: HiShoppingBag },
  ];

  return (
    <>
      {/* Overlay */}
      {(isSidebarOpen || isAnimating) && (
        <div
          className={`fixed inset-0 z-40 transition-all duration-350 ${
            isSidebarOpen ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"
          }`}
          onClick={close}
          style={{
            opacity: isSidebarOpen ? 1 : 0,
            transition: "opacity 0.35s ease, backdrop-filter 0.35s ease",
          }}
        />
      )}

      {/* Drawer */}
      {(isSidebarOpen || isAnimating) && (
        <div
          className={`fixed top-0 left-0 w-72 h-full z-50 flex flex-col max-sm:w-[85vw]`}
          style={{
            background: "rgba(250, 250, 248, 0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "20px 0 60px rgba(0,0,0,0.15)",
            transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <Link
              to="/"
              onClick={close}
              className="text-2xl font-light tracking-[0.3em] text-stone-800 hover:text-amber-800 transition-colors"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              FASHION
            </Link>
            <button
              onClick={close}
              className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-800"
            >
              <HiXMark className="text-xl" />
            </button>
          </div>

          {/* User info */}
          {loginStatus && userInfo && (
            <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-stone-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(userInfo.fullName || userInfo.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 truncate max-w-[160px]">
                    {userInfo.fullName || t("menu.guest", "Khách hàng")}
                  </p>
                  <p className="text-xs text-stone-500 truncate max-w-[160px]">{userInfo.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
            {menuItems.map(({ to, label, icon: Icon }, idx) => (
              <Link
                key={to}
                to={to}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive(to)
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <Icon className={`text-lg flex-shrink-0 transition-transform group-hover:scale-110 ${isActive(to) ? "text-white" : "text-stone-500"}`} />
                <span className="font-medium text-sm tracking-wide">{label}</span>
                {isActive(to) && (
                  <div className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full" />
                )}
              </Link>
            ))}

            {/* Auth links */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col gap-1">
              {loginStatus ? (
                <>
                  <Link
                    to="/user-profile"
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all group"
                  >
                    <HiUser className="text-lg text-stone-500 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">{t("menu.profile", "My Profile")}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all group w-full text-left"
                  >
                    <HiArrowRightOnRectangle className="text-lg group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">{t("menu.logout", "Logout")}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all group"
                  >
                    <HiUser className="text-lg text-stone-500 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">{t("menu.sign_in", "Sign In")}</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all group"
                  >
                    <HiUserPlus className="text-lg group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">{t("menu.create_account", "Create Account")}</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-stone-100">
            <p className="text-xs text-stone-400 text-center tracking-widest uppercase">
              {t("menu.rights", "© 2026 Fashion Studio")}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarMenu;
