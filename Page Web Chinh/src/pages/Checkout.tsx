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

const paymentMethods = [
  { id: "COD", title: "Thanh toán khi nhận hàng (COD)" },
  { id: "BANK TRANSFER", title: "Chuyển khoản Ngân hàng" },
];

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
          <p className="text-sm text-gray-500 text-center">Nhập thông tin thẻ ngân hàng của bạn</p>

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
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Thanh toán thành công! 🎉</h2>
        {orderId && (
          <p className="text-gray-500 text-sm">Mã đơn hàng: <span className="font-semibold text-gray-800">#{orderId}</span></p>
        )}
        <p className="text-gray-400 text-sm">Cảm ơn bạn đã mua sắm tại FashionStyle. Đơn hàng đang được xử lý.</p>
        <button
          onClick={onDone}
          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
        >
          Xem chi tiết đơn hàng
        </button>
      </div>
    </div>
  );
}

// ================================================================
// MAIN CHECKOUT PAGE
// ================================================================
const Checkout = () => {
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = getAuthToken();

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
      // Vì checkout có thể dành cho guest hoặc user, 
      // ta gọi API public (hoặc my-vouchers nếu có user)
      // Tốt nhất là gọi API GET /promotions để check (hoặc tạo endpoint validate riêng)
      // Tạm thời dùng customFetch.get('/promotions') để tự check ở client
      const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      let allPromos: any[] = [];
      
      // Nếu có token, check xem user có được gán mã vip ko, VÀ mã public
      if (token) {
        // Cố gắng get VIP vouchers trước
        try {
          const myRes = await customFetch.get("/promotions/my-vouchers", cfg);
          if (myRes.data?.success) allPromos = [...allPromos, ...myRes.data.data];
        } catch(e) {}
      }
      
      // Get public promos (cần chỉnh BE cho phép guest xem public promos, hoặc dựa vào BE hiện tại)
      try {
        const pubRes = await customFetch.get("/promotions", cfg);
        if (pubRes.data?.success) {
          allPromos = [...allPromos, ...pubRes.data.data];
        }
      } catch(e) {}
      
      const codeUpper = promoInput.trim().toUpperCase();
      const match = allPromos.find(p => p.Code === codeUpper);
      
      if (match) {
        setAppliedPromo({ code: match.Code, percent: match.DiscountPercent });
        toast.success(`Áp dụng mã ${match.Code} thành công! (Giảm ${match.DiscountPercent}%)`);
      } else {
        setPromoError("Mã khuyến mãi không hợp lệ hoặc bạn không có quyền sử dụng mã này.");
        setAppliedPromo(null);
      }
    } catch(e) {
      setPromoError("Lỗi hệ thống khi kiểm tra mã.");
    } finally {
      setValidatingPromo(false);
    }
  };

  const buildPayloads = (formData: FormData) => {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const emailAddress = formData.get("emailAddress") as string;
    const address = formData.get("address") as string;
    const apartment = formData.get("apartment") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const postalCode = formData.get("postalCode") as string;
    const phone = formData.get("phone") as string;
    const fullAddress = `${address} ${apartment ? `(${apartment})` : ""}, ${city}, ${country} - Mã Zip: ${postalCode} - SĐT: ${phone} - Khách hàng: ${firstName} ${lastName}`;

    const cartItems = productsInCart.map((p) => ({
      ProductID: parseInt(p.id),
      Quantity: p.quantity,
      Price: p.price,
    }));

    const promoCodeToSave = appliedPromo ? appliedPromo.code : null;

    const authPayload = { ShippingAddress: fullAddress, PaymentMethod: selectedPayment, PromotionCode: promoCodeToSave, cartItems };
    const guestPayload = { CustomerName: `${firstName} ${lastName}`, CustomerEmail: emailAddress, CustomerPhone: phone, ShippingAddress: fullAddress, PaymentMethod: selectedPayment, PromotionCode: promoCodeToSave, cartItems };
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
                <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
                <div className="mt-4">
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <input type="email" id="email-address" name="emailAddress" autoComplete="email"
                      className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First name</label>
                    <div className="mt-1">
                      <input type="text" id="first-name" name="firstName" autoComplete="given-name"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last name</label>
                    <div className="mt-1">
                      <input type="text" id="last-name" name="lastName" autoComplete="family-name"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                    <div className="mt-1">
                      <input type="text" name="company" id="company"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="mt-1">
                      <input type="text" name="address" id="address" autoComplete="street-address"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">Apartment, suite, etc.</label>
                    <div className="mt-1">
                      <input type="text" name="apartment" id="apartment"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <div className="mt-1">
                      <input type="text" name="city" id="city" autoComplete="address-level2"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <div className="mt-1">
                      <select id="country" name="country" autoComplete="country-name"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required>
                        <option value="Vietnam">Vietnam</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">State / Province</label>
                    <div className="mt-1">
                      <input type="text" name="region" id="region" autoComplete="address-level1"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">Postal code</label>
                    <div className="mt-1">
                      <input type="text" name="postalCode" id="postal-code" autoComplete="postal-code"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <div className="mt-1">
                      <input type="text" name="phone" id="phone" autoComplete="tel"
                        className="block w-full py-2 indent-2 border-gray-300 outline-none focus:border-gray-400 border border shadow-sm sm:text-sm" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">Payment</h2>
                <fieldset className="mt-4">
                  <legend className="sr-only">Payment type</legend>
                  <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                    {paymentMethods.map((pm) => (
                      <div key={pm.id} className="flex items-center">
                        <input
                          id={pm.id} name="paymentType" value={pm.id} type="radio"
                          checked={selectedPayment === pm.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={pm.id} className="ml-3 block text-sm font-medium text-gray-700">{pm.title}</label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Bank Transfer — chọn hình thức trước khi submit */}
                {selectedPayment === "BANK TRANSFER" && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm text-gray-600 font-medium">Chọn hình thức thanh toán:</p>

                    {/* Card option */}
                    <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${bankMethod === "card" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" className="sr-only" checked={bankMethod === "card"} onChange={() => setBankMethod("card")} />
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Nhập thông tin thẻ</p>
                        <p className="text-xs text-gray-400">Visa, Mastercard, ATM — điền số thẻ</p>
                      </div>
                      {bankMethod === "card" && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                    </label>

                    {/* QR option */}
                    <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${bankMethod === "qr" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" className="sr-only" checked={bankMethod === "qr"} onChange={() => setBankMethod("qr")} />
                      <span className="text-2xl">📱</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Quét mã QR</p>
                        <p className="text-xs text-gray-400">VietQR · Vietcombank — mở app ngân hàng quét</p>
                      </div>
                      {bankMethod === "qr" && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                    </label>

                    <p className="text-xs text-gray-400 italic">
                      * Điền đầy đủ thông tin giao hàng và bấm "Tiến hành thanh toán" để mở màn hình thanh toán.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
              <div className="mt-4 border border-gray-200 bg-white shadow-sm">
                <h3 className="sr-only">Items in your cart</h3>
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
                          <div className="ml-4"><p className="text-base">Quantity: {product?.quantity}</p></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Shipping</dt>
                    <dd className="text-sm font-medium text-green-600">{subtotal ? "Miễn phí" : formatCurrency(0)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Taxes (10%)</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(tax)}</dd>
                  </div>
                  
                  {/* Promo Input Area */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã Khuyến Mãi / Voucher VIP</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã ví dụ: SALE50"
                        className="flex-1 min-w-0 py-2 px-3 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-all"
                        disabled={!!appliedPromo}
                      />
                      {appliedPromo ? (
                        <button 
                          type="button" 
                          onClick={() => { setAppliedPromo(null); setPromoInput(""); }}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          Gỡ mã
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || validatingPromo}
                          className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-900 disabled:bg-stone-300 transition-colors"
                        >
                          {validatingPromo ? "..." : "Áp dụng"}
                        </button>
                      )}
                    </div>
                    {promoError && <p className="mt-2 text-xs font-semibold text-red-600">{promoError}</p>}
                    {appliedPromo && <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">✅ Đã áp dụng mã ưu đãi giảm {appliedPromo.percent}%</p>}
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <dt className="text-sm">Discount ({appliedPromo.code})</dt>
                      <dd className="text-sm">- {formatCurrency(discountAmount)}</dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt className="text-base font-medium">Total</dt>
                    <dd className="text-base font-medium text-gray-900">{formatCurrency(totalWithTax)}</dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  {selectedPayment === "COD" ? (
                    <Button text="Confirm Order" type="submit" mode="brown" />
                  ) : (
                    /* BANK TRANSFER: submit button mở modal thanh toán sau khi validate form */
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {bankMethod === "qr" ? "📱" : "💳"} Tiến hành thanh toán {formatCurrency(totalWithTax)}
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
