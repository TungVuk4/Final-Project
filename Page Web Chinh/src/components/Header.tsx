import { HiBars3, HiOutlineUser, HiOutlineMagnifyingGlass, HiOutlineShoppingBag } from "react-icons/hi2";
import { Link, useLocation } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import { useState, useEffect } from "react";
import { useAppSelector } from "../hooks";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { productsInCart } = useAppSelector((state) => state.cart);
  const { loginStatus, userInfo } = useAppSelector((state) => state.auth);
  const cartCount = productsInCart.reduce((sum, p) => sum + p.quantity, 0);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent border-transparent"
            : "bg-white/90 backdrop-blur-xl border-b border-stone-100/80 shadow-sm"
        }`}
      >
        <div className="max-w-screen-2xl flex items-center justify-between py-4 px-5 mx-auto max-[400px]:px-3">
          
          {/* Hamburger */}
          <button
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
              isTransparent
                ? "text-white hover:bg-white/20"
                : "text-stone-700 hover:bg-stone-100"
            }`}
            onClick={() => setIsSidebarOpen(true)}
            aria-label={t("header.menu", "Mở menu")}
          >
            <HiBars3 className="text-2xl max-sm:text-xl" />
          </button>

          {/* Brand Logo */}
          <Link
            to="/"
            className={`text-2xl font-light tracking-[0.35em] max-sm:text-xl transition-all duration-300 hover:tracking-[0.45em] select-none ${
              isTransparent ? "text-white" : "text-stone-800"
            }`}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            FASHION
          </Link>

          {/* Right Icons */}
          <div className="flex gap-0.5 items-center">
            {/* Lang Toggle */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === "en" ? "vi" : "en")}
              className={`px-3 py-1.5 mr-2 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 border backdrop-blur-md flex items-center gap-1 ${
                isTransparent 
                  ? "border-white/30 text-white hover:bg-white/20" 
                  : "border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 shadow-sm"
              }`}
              aria-label="Toggle Language"
            >
              <span className={i18n.language === "en" ? "opacity-100" : "opacity-40"}>EN</span>
              <span className="w-px h-2.5 bg-current opacity-30"></span>
              <span className={i18n.language === "vi" ? "opacity-100" : "opacity-40"}>VI</span>
            </button>

            {/* Search */}
            <Link
              to="/search"
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 group ${
                isTransparent ? "text-white hover:bg-white/20" : "text-stone-700 hover:bg-stone-100"
              }`}
              aria-label={t("header.search", "Tìm kiếm")}
            >
              <HiOutlineMagnifyingGlass className="text-xl transition-transform group-hover:rotate-12" />
            </Link>

            {/* User */}
            <Link
              to={loginStatus ? "/user-profile" : "/login"}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 flex items-center gap-1.5 group ${
                isTransparent ? "text-white hover:bg-white/20" : "text-stone-700 hover:bg-stone-100"
              }`}
              aria-label={t("header.account", "Tài khoản")}
            >
              {loginStatus && userInfo && (
                <span className={`text-xs font-medium hidden sm:block max-w-[80px] truncate transition-colors ${
                  isTransparent ? "text-white/90" : "text-stone-600"
                }`}>
                  {userInfo.fullName?.split(" ").pop() ?? userInfo.email?.split("@")[0] ?? ""}
                </span>
              )}
              <HiOutlineUser className="text-xl" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 relative group ${
                isTransparent ? "text-white hover:bg-white/20" : "text-stone-700 hover:bg-stone-100"
              }`}
              aria-label={`${t("header.cart", "Giỏ hàng")} (${cartCount})`}
            >
              <HiOutlineShoppingBag className="text-xl transition-transform group-hover:-rotate-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-700 text-white text-[10px] font-bold
                                 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center
                                 leading-none animate-pulse" style={{ padding: "2px" }}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer khi header không transparent */}
      {!isHome && <div className="h-[64px]" />}

      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};

export default Header;
