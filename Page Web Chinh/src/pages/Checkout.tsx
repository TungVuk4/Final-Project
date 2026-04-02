import { HiTrash as TrashIcon } from "react-icons/hi2";
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components";
import { useAppDispatch, useAppSelector } from "../hooks";
import { removeProductFromTheCart, clearCart } from "../features/cart/cartSlice";
import customFetch from "../axios/custom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { checkCheckoutFormData } from "../utils/checkCheckoutFormData";
import { getImageUrl } from "../utils/formatImageUrl";
import { formatCurrency } from "../utils/formatCurrency";
import { getAuthToken } from "../features/auth/authSlice";
import { useTranslation } from "react-i18next";



// ---- Vietcombank info ----
const VCB_BANK_NO = "1031598808";
const VCB_ACCOUNT_NAME = "VU THANH TUNG";

// Deep link URL chuẩn VietQR — camera điện thoại quét sẽ tự mở app ngân hàng
// Khi camera quét → mở trình duyệt → vietqr.io redirect sang app ngân hàng
const buildVietQRDeepLink = (amount: number) =>
  `https://dl.vietqr.io/pay?app=VCB&ba=${VCB_BANK_NO}&mn=${amount}&tn=DH%20FashionStyle&nn=${encodeURIComponent(VCB_ACCOUNT_NAME)}`;

// ================================================================
// MODAL: Nhập thông tin thẻ ngân hàng (Demo)
// ================================================================
function CardPaymentModal({
  total,
  onPaid,
  onClose,
}: {
  total: number;
  onPaid: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCardNo = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNo.replace(/\s/g, "").length < 16 || expiry.length < 5 || cvv.length < 3) {
      toast.error("Vui lòng kiểm tra lại thông tin thẻ.");
      return;
    }
    setLoading(true);
    // Giả lập xử lý 1.5s → thành công
    setTimeout(() => { setLoading(false); onPaid(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 p-5 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-xs">Số tiền thanh toán</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-3xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-500 text-center">{t("checkout.card", "Nhập thông tin thẻ ngân hàng của bạn")}</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Số thẻ</label>
            <input
              value={cardNo} onChange={(e) => setCardNo(formatCardNo(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tên chủ thẻ</label>
            <input
              value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="NGUYEN VAN A"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày hết hạn</label>
              <input
                value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
              <input
                value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="•••" type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">🔒 Đây là giao dịch demo — không có tiền thật bị trừ.</p>

          <button
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang xử lý...</>
            ) : `Thanh toán ${formatCurrency(total)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ================================================================
// MODAL: Quét mã QR VietQR
// ================================================================
function QRPaymentModal({
  total,
  onPaid,
  onClose,
}: {
  total: number;
  onPaid: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  // Deep link URL — camera điện thoại quét → trình duyệt mở → app ngân hàng bật lên
  const qrValue = buildVietQRDeepLink(Math.round(total));

  const handleConfirm = () => {
    setLoading(true);
    // Simulate 1s processing → success
    setTimeout(() => { setLoading(false); onPaid(); }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* VCB Header */}
        <div className="bg-gradient-to-br from-[#007A33] to-[#00A650] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs">Quét mã VietQR để thanh toán</p>
            <p className="text-white font-bold text-xl">{formatCurrency(total)}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-3xl leading-none">×</button>
        </div>

        <div className="p-5 flex flex-col items-center gap-4">
          {/* QR Code tự vẽ — quét bằng camera điện thoại để mở app ngân hàng */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-inner">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "https://img.vietqr.io/image/970436-compact.png",
                width: 36,
                height: 36,
                excavate: true,
              }}
            />
          </div>

          {/* Thông tin tài khoản */}
          <div className="w-full bg-gray-50 rounded-xl p-4 text-sm text-center space-y-1">
            <p className="text-xs text-gray-500">Ngân hàng: <strong className="text-gray-800">Vietcombank</strong></p>
            <p className="text-gray-700 font-bold text-xl tracking-widest">{VCB_BANK_NO}</p>
            <p className="text-gray-600 font-semibold">{VCB_ACCOUNT_NAME}</p>
            <p className="text-xs text-gray-400 pt-1">Nội dung: <span className="font-medium text-gray-600">DH FashionStyle</span></p>
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            📷 Dùng <b>camera điện thoại</b> quét mã QR → điện thoại sẽ gợi ý mở app ngân hàng → kiểm tra thông tin → chuyển khoản (tuỳ bạn).<br />
            Sau đó bấm <b>"Tôi đã chuyển khoản"</b> để hoàn tất đặt hàng.
          </p>

          <button
            onClick={handleConfirm} disabled={loading}
            className="w-full bg-[#007A33] hover:bg-[#005D27] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang xác nhận...</>
            ) : "✅ Tôi đã chuyển khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Màn hình thanh toán thành công (full-page overlay)
// ================================================================
function PaymentSuccessOverlay({ orderId, onDone }: { orderId?: number; onDone: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t("checkout.success_title", "Thanh toán thành công! 🎉")}</h2>
        {orderId && (
          <p className="text-gray-500 text-sm">{t("checkout.order_id", "Mã đơn hàng:")} <span className="font-semibold text-gray-800">#{orderId}</span></p>
        )}
        <p className="text-gray-400 text-sm">{t("checkout.success_desc", "Cảm ơn bạn đã mua sắm tại FashionStyle. Đơn hàng đang được xử lý.")}</p>
        <button
          onClick={onDone}
          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {t("checkout.view_order", "Xem chi tiết đơn hàng")}
        </button>
      </div>
    </div>
  );
}

// ================================================================
// MAIN CHECKOUT PAGE
// ================================================================
const Checkout = () => {
  const { t } = useTranslation();
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);
  const { userInfo } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = getAuthToken();

  // Decode JWT để lấy email đáng tin cậy nhất (JWT luôn có email trong payload)
  const loggedInEmail = (() => {
    // Ưu tiên 1: Decode từ JWT token (nguồn đáng tin nhất)
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.email) return payload.email as string;
        }
      } catch {}
    }
    // Ưu tiên 2: Redux state
    if (userInfo?.email) return userInfo.email;
    // Ưu tiên 3: localStorage fallback
    try {
      const raw = localStorage.getItem("fashionUser");
      return raw ? (JSON.parse(raw).email || "") : "";
    } catch { return ""; }
  })();

  const [selectedPayment, setSelectedPayment] = useState<string>("COD");
  // "card" | "qr" — user chọn hình thức ngân hàng TRC khi submit
  const [bankMethod, setBankMethod] = useState<"card" | "qr">("qr");

  const [showCardModal, setShowCardModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | undefined>(undefined);

  // Promotion state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Email state — pre-fill từ JWT, dùng lazy initializer để đọc đúng ngay khi mount
  const [emailInput, setEmailInput] = useState<string>(() => {
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.email) return payload.email as string;
        }
      } catch {}
    }
    try {
      const raw = localStorage.getItem("fashionUser");
      return raw ? (JSON.parse(raw).email || "") : "";
    } catch { return ""; }
  });

  // payload được lưu SAU KHI form validate thành công
  const pendingPayload = useRef<{ url: string; data: object } | null>(null);
  
  // Tính toán tiền
  const tax = subtotal ? subtotal * 0.1 : 0;
  const discountAmount = appliedPromo && subtotal ? (subtotal * appliedPromo.percent) / 100 : 0;
  // Make sure not to go below 0
  const totalWithTax = Math.max(0, Math.round((subtotal || 0) + tax - discountAmount));

  // Handle promo code
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setValidatingPromo(true);
    try {
      const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await customFetch.post("/promotions/validate-promo", { code: promoInput.trim() }, cfg);
      const data = res.data;
      if (data.valid) {
        setAppliedPromo({ code: data.code, percent: data.discountPercent });
        const typeLabel = data.type === "single-use" ? "🎟 Mã dùng 1 lần" : data.type === "vip" ? "👑 Voucher VIP" : "🏷 Mã chung";
        toast.success(`${typeLabel} — Giảm ${data.discountPercent}% được áp dụng!`);
      } else {
        setPromoError(data.message || "Mã khuyến mãi không hợp lệ.");
        setAppliedPromo(null);
      }
    } catch (e: any) {
      setPromoError(e?.response?.data?.message || "Lỗi hệ thống khi kiểm tra mã.");
    } finally {
      setValidatingPromo(false);
    }
  };

  const buildPayloads = (formData: FormData) => {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const address = formData.get("address") as string;
    const apartment = formData.get("apartment") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const postalCode = formData.get("postalCode") as string;
    const phone = formData.get("phone") as string;
    const fullAddress = `${address} ${apartment ? `(${apartment})` : ""}, ${city}, ${country} - Mã Zip: ${postalCode} - SĐT: ${phone} - Khách hàng: ${firstName} ${lastName}`;

    const cartItems = productsInCart.map((p) => ({
      ProductID: p.productId ?? parseInt(p.id),
      Quantity: p.quantity,
      Price: p.price,
    }));

    const promoCodeToSave = appliedPromo ? appliedPromo.code : null;

    const emailForOrder = token ? loggedInEmail : (formData.get("emailAddress") as string);

    const authPayload = { ShippingAddress: fullAddress, PaymentMethod: selectedPayment, PromotionCode: promoCodeToSave, cartItems };
    const guestPayload = { CustomerName: `${firstName} ${lastName}`, CustomerEmail: emailForOrder, CustomerPhone: phone, ShippingAddress: fullAddress, PaymentMethod: selectedPayment, PromotionCode: promoCodeToSave, cartItems };
    return { authPayload, guestPayload };
  };

  const submitOrder = async (url: string, data: object): Promise<number | undefined> => {
    const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const resp = await customFetch.post(url, data, cfg);
    return resp.data?.orderId;
  };

  // ---- Form submit ----
  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const checkoutData = { data: Object.fromEntries(formData), products: productsInCart, subtotal, paymentMethod: selectedPayment };
    if (!checkCheckoutFormData(checkoutData)) return;

    const { authPayload, guestPayload } = buildPayloads(formData);
    const url = token ? "/orders/checkout" : "/orders/guest-checkout";
    const payload = token ? authPayload : guestPayload;

    // Validate email khớp với tài khoản đăng nhập (áp dụng cả COD lẫn Bank Transfer)
    if (token && emailInput.trim().toLowerCase() !== loggedInEmail.toLowerCase()) {
      toast.error(`Email không hợp lệ! Vui lòng dùng email đăng nhập: ${loggedInEmail}`);
      return;
    }

    if (selectedPayment === "BANK TRANSFER") {
      // Lưu payload sau khi form validate OK → mở modal thanh toán
      pendingPayload.current = { url, data: payload };
      if (bankMethod === "card") {
        setShowCardModal(true);
      } else {
        setShowQrModal(true);
      }
      return;
    }

    // COD → đặt hàng thẳng
    try {
      await submitOrder(url, payload);
      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");
      dispatch(clearCart());
      navigate("/order-confirmation");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại.";
      toast.error(msg);
    }
  };

  // Gọi khi user xác nhận đã thanh toán (card form submit / "Tôi đã chuyển khoản")
  const handleBankPaid = async () => {
    setShowCardModal(false);
    setShowQrModal(false);

    if (!pendingPayload.current) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      return;
    }
    try {
      const orderId = await submitOrder(pendingPayload.current.url, pendingPayload.current.data);
      pendingPayload.current = null;
      setConfirmedOrderId(orderId);
      setShowSuccess(true);
      dispatch(clearCart());
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi lưu đơn hàng. Vui lòng thử lại.";
      toast.error(msg);
    }
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    navigate("/order-confirmation");
  };

  return (
    <>
      {/* Modals */}
      {showCardModal && <CardPaymentModal total={totalWithTax} onPaid={handleBankPaid} onClose={() => setShowCardModal(false)} />}
      {showQrModal && <QRPaymentModal total={totalWithTax} onPaid={handleBankPaid} onClose={() => setShowQrModal(false)} />}
      {showSuccess && <PaymentSuccessOverlay orderId={confirmedOrderId} onDone={handleSuccessDone} />}

      <div className="mx-auto max-w-screen-2xl">
        <div className="pb-24 pt-16 px-5 max-[400px]:px-3">
          <h2 className="sr-only">Checkout</h2>

          <form
            onSubmit={handleCheckoutSubmit}
            className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
          >
            <div>
              {/* Contact */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">{t("checkout.contact", "Contact information")}</h2>
                <div className="mt-4">
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                    {t("checkout.email", "Email address")}
                    {token && <span className="ml-2 text-xs text-emerald-600 font-normal">✓ Tài khoản đã đăng nhập</span>}
                  </label>
                  <div className="mt-1">
                    {token ? (
                      // Đã đăng nhập: email được điền sẵn, vẫn có thể chỉnh nhưng phải khớp tài khoản
                      <div className="relative">
                        <input
                          type="email"
                          id="email-address"
                          name="emailAddress"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className={`block w-full py-2 indent-2 border shadow-sm sm:text-sm outline-none transition-all ${
                            emailInput.trim().toLowerCase() !== loggedInEmail.toLowerCase() && emailInput !== ""
                              ? "border-red-400 focus:border-red-500 bg-red-50"
                              : "border-gray-300 focus:border-emerald-400 bg-emerald-50/30"
                          }`}
                        />
                        {emailInput.trim().toLowerCase() !== loggedInEmail.toLowerCase() && emailInput !== "" ? (
                          <p className="mt-1 text-xs text-red-500 font-medium">⚠️ Email phải khớp với tài khoản đăng nhập</p>
                        ) : (
                          <p className="mt-1 text-xs text-emerald-600">✓ Email tài khoản của bạn</p>
                        )}
                      </div>
                    ) : (
                      // Khách vãng lai: tự nhập email
                      <input
                        type="email"
                        id="email-address"
                        name="emailAddress"
                        autoComplete="email"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">{t("checkout.shipping", "Shipping information")}</h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">{t("checkout.first", "First name")}</label>
                    <div className="mt-1">
                      <input type="text" id="first-name" name="firstName" autoComplete="given-name"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">{t("checkout.last", "Last name")}</label>
                    <div className="mt-1">
                      <input type="text" id="last-name" name="lastName" autoComplete="family-name"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">{t("checkout.company", "Company")}</label>
                    <div className="mt-1">
                      <input type="text" name="company" id="company"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t("checkout.address", "Address")}</label>
                    <div className="mt-1">
                      <input type="text" name="address" id="address" autoComplete="street-address"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">{t("checkout.apt", "Apartment, suite, etc.")}</label>
                    <div className="mt-1">
                      <input type="text" name="apartment" id="apartment"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t("checkout.city", "City")}</label>
                    <div className="mt-1">
                      <input type="text" name="city" id="city" autoComplete="address-level2"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">{t("checkout.country", "Country")}</label>
                    <div className="mt-1">
                      <select id="country" name="country" autoComplete="country-name"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required>
                        <option value="Vietnam">Vietnam</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">{t("checkout.state", "State / Province")}</label>
                    <div className="mt-1">
                      <input type="text" name="region" id="region" autoComplete="address-level1"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">{t("checkout.zip", "Postal code")}</label>
                    <div className="mt-1">
                      <input type="text" name="postalCode" id="postal-code" autoComplete="postal-code"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t("checkout.phone", "Phone")}</label>
                    <div className="mt-1">
                      <input type="text" name="phone" id="phone" autoComplete="tel"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">{t("checkout.payment", "Payment")}</h2>
                <fieldset className="mt-4">
                  <legend className="sr-only">Payment type</legend>
                  <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                    <div className="flex items-center">
                      <input
                        id="COD" name="paymentType" value="COD" type="radio"
                        checked={selectedPayment === "COD"}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="COD" className="ml-3 block text-sm font-medium text-gray-700">{t("checkout.cod", "Cash on Delivery (COD)")}</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="BANK TRANSFER" name="paymentType" value="BANK TRANSFER" type="radio"
                        checked={selectedPayment === "BANK TRANSFER"}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="BANK TRANSFER" className="ml-3 block text-sm font-medium text-gray-700">{t("checkout.bank", "Bank Transfer")}</label>
                    </div>
                  </div>
                </fieldset>

                {/* Bank Transfer — chọn hình thức trước khi submit */}
                {selectedPayment === "BANK TRANSFER" && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm text-gray-600 font-medium">{t("checkout.select_bank", "Chọn hình thức thanh toán:")}</p>

                    {/* Card option */}
                    <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${bankMethod === "card" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" className="sr-only" checked={bankMethod === "card"} onChange={() => setBankMethod("card")} />
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t("checkout.card", "Nhập thông tin thẻ")}</p>
                        <p className="text-xs text-gray-400">{t("checkout.card_desc", "Visa, Mastercard, ATM — điền số thẻ")}</p>
                      </div>
                      {bankMethod === "card" && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                    </label>

                    {/* QR option */}
                    <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${bankMethod === "qr" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" className="sr-only" checked={bankMethod === "qr"} onChange={() => setBankMethod("qr")} />
                      <span className="text-2xl">📱</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t("checkout.qr", "Quét mã QR")}</p>
                        <p className="text-xs text-gray-400">{t("checkout.qr_desc", "VietQR · Vietcombank — mở app ngân hàng quét")}</p>
                      </div>
                      {bankMethod === "qr" && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                    </label>

                    <p className="text-xs text-gray-400 italic">
                      {t("checkout.note", "* Điền đầy đủ thông tin giao hàng và bấm \"Tiến hành thanh toán\" để mở màn hình thanh toán.")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900">{t("checkout.order_summary", "Order summary")}</h2>
              <div className="mt-4 border border-gray-200 bg-white shadow-sm">
                <h3 className="sr-only">{t("checkout.items_cart", "Items in your cart")}</h3>
                <ul role="list" className="divide-y divide-gray-200">
                  {productsInCart.map((product) => (
                    <li key={product?.id} className="flex px-4 py-6 sm:px-6">
                      <div className="flex-shrink-0">
                        <img src={getImageUrl(product?.image)} alt={product?.title} className="w-20 rounded-md" />
                      </div>
                      <div className="ml-6 flex flex-1 flex-col">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-700 hover:text-gray-800">{product?.title}</h4>
                            <p className="mt-1 text-sm text-gray-500">{product?.color}</p>
                            <p className="mt-1 text-sm text-gray-500">{product?.size}</p>
                          </div>
                          <div className="ml-4 flow-root flex-shrink-0">
                            <button type="button"
                              className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                              onClick={() => dispatch(removeProductFromTheCart({ id: product?.id }))}
                            >
                              <span className="sr-only">Remove</span>
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between pt-2">
                          <p className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(product?.price || 0)}</p>
                          <div className="ml-4"><p className="text-base">{t("checkout.quantity", "Quantity")}: {product?.quantity}</p></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">{t("checkout.subtotal", "Subtotal")}</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">{t("checkout.shipping_fee", "Shipping")}</dt>
                    <dd className="text-sm font-medium text-green-600">{subtotal ? (t('cart.free', 'Free') || "Miễn phí") : formatCurrency(0)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">{t("checkout.tax", "Taxes (10%)")}</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(tax)}</dd>
                  </div>
                  
                  {/* Promo Input Area */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("checkout.promo", "Mã Khuyến Mãi / Voucher VIP")}</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder={t("checkout.promo_placeholder", "Nhập mã ví dụ: SALE50")}
                        className="flex-1 min-w-0 py-2 px-3 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-all"
                        disabled={!!appliedPromo}
                      />
                      {appliedPromo ? (
                        <button 
                          type="button" 
                          onClick={() => { setAppliedPromo(null); setPromoInput(""); }}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          {t("checkout.remove", "Gỡ mã")}
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || validatingPromo}
                          className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-900 disabled:bg-stone-300 transition-colors"
                        >
                          {validatingPromo ? "..." : t("checkout.apply", "Áp dụng")}
                        </button>
                      )}
                    </div>
                    {promoError && <p className="mt-2 text-xs font-semibold text-red-600">{promoError}</p>}
                    {appliedPromo && <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">✅ {t("checkout.discount", "Discount")} {appliedPromo.percent}%</p>}
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <dt className="text-sm">{t("checkout.discount", "Discount")} ({appliedPromo.code})</dt>
                      <dd className="text-sm">- {formatCurrency(discountAmount)}</dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt className="text-base font-medium">{t("checkout.total", "Total")}</dt>
                    <dd className="text-base font-medium text-gray-900">{formatCurrency(totalWithTax)}</dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  {selectedPayment === "COD" ? (
                    <Button text={t("checkout.confirm", "Confirm Order")} type="submit" mode="brown" />
                  ) : (
                    /* BANK TRANSFER: submit button mở modal thanh toán sau khi validate form */
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {bankMethod === "qr" ? "📱" : "💳"} {t("checkout.proceed", "Tiến hành thanh toán")} {formatCurrency(totalWithTax)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Checkout;
