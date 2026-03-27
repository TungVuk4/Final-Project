import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  removeProductFromTheCart,
  updateProductQuantity,
  setCartItems,
} from "../features/cart/cartSlice";
import { getAuthToken } from "../features/auth/authSlice";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/formatImageUrl";
import { formatCurrency } from "../utils/formatCurrency";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const { t } = useTranslation();
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const token = getAuthToken();

  // Load cart từ Backend khi đã đăng nhập hoặc có guestToken
  useEffect(() => {
    const loadCartFromServer = async () => {
      try {
        let items: any[] = [];

        if (token) {
          // User đã đăng nhập
          const res = await customFetch.get("/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          items = res.data?.items || [];
        } else {
          // Khách vãng lai — dùng guestToken
          const guestToken = localStorage.getItem("fashionGuestToken");
          if (!guestToken) return; // Chưa có guestToken = chưa từng thêm sản phẩm
          const res = await customFetch.get(`/cart/guest?guestToken=${guestToken}`);
          items = res.data?.items || [];
        }

        const formattedItems = items.map((item: any) => {
          const basePrice = Number(item.Price || item.price || 0);
          const discountPct = Number(item.DiscountPercent || 0);
          const discountedPrice = discountPct > 0
            ? Math.round(basePrice * (1 - discountPct / 100))
            : basePrice;
          return {
            id: String(item.ProductID) + (item.NameSize || item.size || ""),
            productId: String(item.ProductID),
            title: item.ProductName || item.name,
            price: discountedPrice,
            originalPrice: basePrice,
            discountPercent: discountPct,
            image: item.image || item.FileName || "default.jpg",
            quantity: item.Quantity || 1,
            stock: item.StockQuantity || 1,
            size: item.NameSize || item.size || "",
            color: item.ColorName || item.color || "",
            popularity: 0,
            category: "",
          };
        });
        dispatch(setCartItems(formattedItems));
      } catch {
        // Fallback về Redux local
      }
    };
    loadCartFromServer();
  }, []);



  const handleRemove = async (product: any) => {
    dispatch(removeProductFromTheCart({ id: product.id }));
    toast.error("Đã xóa khỏi giỏ hàng");
    if (token && product.productId) {
      try {
        await customFetch.delete(`/cart/remove/${product.productId}?size=${product.size || ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* silent */ }
    } else if (!token && product.productId) {
      const guestToken = localStorage.getItem("fashionGuestToken");
      if (guestToken) {
        try {
          await customFetch.delete(`/cart/guest/remove/${product.productId}?guestToken=${guestToken}&size=${product.size || ""}`);
        } catch { /* silent */ }
      }
    }
  };



  const handleUpdateQuantity = async (product: any, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateProductQuantity({ id: product.id, quantity }));
    if (token && product.productId) {
      try {
        await customFetch.put(`/cart/update`, { productId: product.productId, quantity, size: product.size || "" }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* silent */ }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-light tracking-wide text-stone-800 mb-8">
          {t("cart.your_cart", "Your Cart")}
          <span className="ml-3 text-lg text-stone-400 font-normal">
            ({productsInCart.length} {t("cart.items", "items")})
          </span>
        </h1>

        {productsInCart.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-7xl mb-4">🛒</div>
            <h2 className="text-xl font-medium text-stone-700 mb-2">{t("cart.empty_title", "Cart is empty")}</h2>
            <p className="text-stone-500 mb-8">{t("cart.empty_desc", "Add products to start shopping!")}</p>
            <Link
              to="/shop"
              className="inline-block bg-stone-800 text-white px-8 py-3 rounded-lg hover:bg-stone-900 transition-colors font-medium"
            >
              {t("cart.explore", "Explore products")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {productsInCart.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${product.productId || product.id}`}
                          className="font-medium text-stone-800 hover:text-stone-600 transition-colors truncate block"
                        >
                          {product.title}
                        </Link>
                        <div className="flex gap-3 mt-1 flex-wrap">
                          {product.color && (
                            <span className="text-xs text-stone-500 bg-stone-100 rounded px-2 py-0.5">{product.color}</span>
                          )}
                          {product.size && (
                            <span className="text-xs text-stone-500 bg-stone-100 rounded px-2 py-0.5">Size: {product.size}</span>
                          )}
                        </div>
                        {/* Stock indicator */}
                        {product.stock > 0 ? (
                          <span className="text-xs text-green-600 mt-1 block">✓ {t("cart.in_stock", "In stock")}</span>
                        ) : (
                          <span className="text-xs text-red-500 mt-1 block">✗ {t("cart.out_of_stock", "Out of stock")}</span>
                        )}
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product)}
                        className="text-stone-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity control */}
                      <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(product, product.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-stone-800">
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(product, product.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
                          >
                          +
                        </button>
                      </div>
                      {/* Price */}
                      <div className="text-right">
                        {(product as any).discountPercent > 0 && (
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                              -{(product as any).discountPercent}%
                            </span>
                            <span className="text-stone-300 line-through text-xs">
                              {formatCurrency((product as any).originalPrice * product.quantity)}
                            </span>
                          </div>
                        )}
                        <span className="font-semibold text-stone-800">
                          {formatCurrency(product.price * product.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-5">{t("cart.summary", "Order Summary")}</h2>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>{t("cart.subtotal", "Subtotal")}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{t("cart.shipping", "Shipping")}</span>
                    <span className="text-green-600">{subtotal === 0 ? formatCurrency(0) : t("cart.free", "Free")}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 flex justify-between font-semibold text-stone-800 text-base">
                    <span>{t("cart.total", "Total")}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 block w-full bg-stone-800 hover:bg-stone-900 text-white text-center font-medium py-3 rounded-lg transition-colors"
                >
                  {t("cart.checkout", "Proceed to Checkout")} &rarr;
                </Link>
                <Link
                  to="/shop"
                  className="mt-3 block w-full text-center text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  &larr; {t("cart.continue_shopping", "Continue Shopping")}
                </Link>

                {!token && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    💡 <Link to="/login" className="underline font-medium">{t("cart.login_prompt", "Login")}</Link>{t("cart.login_desc", " to save cart and get offers")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
