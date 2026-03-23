import { HiBars3, HiOutlineUser, HiOutlineMagnifyingGlass, HiOutlineShoppingBag } from "react-icons/hi2";
import { Link } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import { useState } from "react";
import { useAppSelector } from "../hooks";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { productsInCart } = useAppSelector((state) => state.cart);
  const { loginStatus, userInfo } = useAppSelector((state) => state.auth);
  const cartCount = productsInCart.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
        <div className="max-w-screen-2xl flex text-center justify-between items-center py-3.5 px-5 text-black mx-auto max-[400px]:px-3">
          {/* Hamburger */}
          <button
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <HiBars3 className="text-2xl max-sm:text-xl text-stone-700" />
          </button>

          {/* Brand */}
          <Link
            to="/"
            className="text-3xl font-light tracking-[0.2em] max-sm:text-2xl max-[400px]:text-xl text-stone-800 hover:text-stone-600 transition-colors"
          >
            FASHION
          </Link>

          {/* Right Icons */}
          <div className="flex gap-1 items-center">
            {/* Search */}
            <Link
              to="/search"
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Tìm kiếm"
            >
              <HiOutlineMagnifyingGlass className="text-xl text-stone-700" />
            </Link>

            {/* User — khi đăng nhập hiện tên, khi chưa hiện icon */}
            <Link
              to={loginStatus ? "/user-profile" : "/login"}
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              aria-label="Tài khoản"
            >
              {loginStatus && userInfo ? (
                <span className="text-xs font-medium text-stone-700 hidden sm:block max-w-[80px] truncate">
                  {userInfo.fullName?.split(" ").pop() ?? userInfo.email?.split("@")[0] ?? ""}
                </span>
              ) : null}
              <HiOutlineUser className="text-xl text-stone-700" />
            </Link>

            {/* Cart with badge */}
            <Link
              to="/cart"
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors relative"
              aria-label={`Giỏ hàng (${cartCount})`}
            >
              <HiOutlineShoppingBag className="text-xl text-stone-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-stone-800 text-white text-[10px] font-bold
                                 w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};

export default Header;
