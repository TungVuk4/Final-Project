import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  removeProductFromTheCart,
  updateProductQuantity,
  addProductToTheCart,
} from "../features/cart/cartSlice";
import { getAuthToken } from "../features/auth/authSlice";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/formatImageUrl";

const Cart = () => {
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const token = getAuthToken();

  // Load cart từ Backend khi đã đăng nhập
  useEffect(() => {
    const loadCartFromServer = async () => {
      if (!token) return;
      try {
        const res = await customFetch.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const items = res.data?.items || res.data || [];
        items.forEach((item: any) => {
          dispatch(addProductToTheCart({
            id: String(item.ProductID),
            title: item.ProductName || item.name,
            price: Number(item.Price || item.price),
            image: item.FileName || item.image || "default.jpg",
            quantity: item.Quantity || 1,
            stock: item.StockQuantity || 1,
            size: item.NameSize || item.size || "",
            color: item.ColorName || item.color || "",
            popularity: 0,
            category: "",
          }));
        });
      } catch {
        // Không cần toast, fallback về Redux local
      }
    };
    loadCartFromServer();
  }, []);

  const handleRemove = async (id: string) => {
    dispatch(removeProductFromTheCart({ id }));
    toast.error("Đã xóa khỏi giỏ hàng");
    if (token) {
      try {
        await customFetch.delete(`/cart/item/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* silent */ }
    }
  };


  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateProductQuantity({ id, quantity }));
    if (token) {
      try {
        await customFetch.put(`/cart/item/${id}`, { Quantity: quantity }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* silent */ }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-light tracking-wide text-stone-800 mb-8">
          Giỏ hàng của bạn
          <span className="ml-3 text-lg text-stone-400 font-normal">
            ({productsInCart.length} sản phẩm)
          </span>
        </h1>

        {productsInCart.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-7xl mb-4">🛒</div>
            <h2 className="text-xl font-medium text-stone-700 mb-2">Giỏ hàng đang trống</h2>
            <p className="text-stone-500 mb-8">Thêm sản phẩm vào giỏ để bắt đầu mua sắm nhé!</p>
            <Link
              to="/shop"
              className="inline-block bg-stone-800 text-white px-8 py-3 rounded-lg hover:bg-stone-900 transition-colors font-medium"
            >
              Khám phá sản phẩm
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
                          to={`/product/${product.id}`}
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
                          <span className="text-xs text-green-600 mt-1 block">✓ Còn hàng</span>
                        ) : (
                          <span className="text-xs text-red-500 mt-1 block">✗ Hết hàng</span>
                        )}
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product.id)}
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
                          onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                          className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 transition-colors text-lg leading-none"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-stone-800 min-w-[2rem] text-center">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                          className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 transition-colors text-lg leading-none"
                        >
                          +
                        </button>
                      </div>
                      {/* Price */}
                      <span className="font-semibold text-stone-800">
                        ${(product.price * product.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-5">Tóm tắt đơn hàng</h2>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Tạm tính</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">{subtotal === 0 ? "$0" : "Miễn phí"}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 flex justify-between font-semibold text-stone-800 text-base">
                    <span>Tổng cộng</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 block w-full bg-stone-800 hover:bg-stone-900 text-white text-center font-medium py-3 rounded-lg transition-colors"
                >
                  Tiến hành thanh toán →
                </Link>
                <Link
                  to="/shop"
                  className="mt-3 block w-full text-center text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  ← Tiếp tục mua sắm
                </Link>

                {!token && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    💡 <Link to="/login" className="underline font-medium">Đăng nhập</Link> để lưu giỏ hàng và nhận ưu đãi
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
