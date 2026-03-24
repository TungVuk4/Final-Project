import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  Link,
} from "react-router-dom";
import { getAuthToken } from "../features/auth/authSlice";
import { formatDate } from "../utils/formatDate";
import { formatCurrency } from "../utils/formatCurrency";
import { getImageUrl } from "../utils/formatImageUrl";
import { useState, useEffect, useCallback } from "react";
import {
  HiArrowLeft, HiShoppingBag, HiMapPin, HiCreditCard,
  HiCheckCircle, HiXCircle, HiClock, HiTruck, HiArrowPath,
} from "react-icons/hi2";

// ── Types ──────────────────────────────────────────────────────────
type OrderItem = {
  ProductName: string;
  Quantity: number;
  UnitPrice: number;       // Giá đã giảm (lưu trong OrderDetails.Price)
  DiscountPercent: number;
  image: string | null;
};

type SingleOrder = {
  OrderID: number;
  OrderDate: string;
  TotalAmount: number;     // Tổng chính thức từ DB (đã áp dụng discount)
  Status: string;
  ShippingAddress: string;
  PaymentMethod: string;
  items: OrderItem[];
};

// ── Loader ────────────────────────────────────────────────────────
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  const token = getAuthToken();
  if (!token) throw new Response("Unauthorized", { status: 401 });

  try {
    const response = await fetch(`http://localhost:8080/api/orders/my-orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Response("Not found", { status: response.status });
    const data = await response.json();
    return data?.data;
  } catch {
    throw new Response("Không thể tải đơn hàng", { status: 500 });
  }
};

// ── Status config ──────────────────────────────────────────────────
const statusMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; step: number }> = {
  PENDING_COD:       { label: "Chờ xác nhận", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" />, step: 1 },
  AWAITING_PAYMENT:  { label: "Chờ thanh toán", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" />, step: 1 },
  PENDING_ONLINE:    { label: "Chờ thanh toán", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" />, step: 1 },
  Pending:           { label: "Chờ xác nhận", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" />, step: 1 },
  "Chờ xử lý":      { label: "Chờ xác nhận", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" />, step: 1 },
  PROCESSING:        { label: "Đang xử lý", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <HiClock className="w-4 h-4" />, step: 2 },
  Processing:        { label: "Đang xử lý", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <HiClock className="w-4 h-4" />, step: 2 },
  Shipped:           { label: "Đang giao", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <HiTruck className="w-4 h-4" />, step: 3 },
  "Dang giao":       { label: "Đang giao", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <HiTruck className="w-4 h-4" />, step: 3 },
  "Đang giao":       { label: "Đang giao", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <HiTruck className="w-4 h-4" />, step: 3 },
  Delivered:         { label: "Đã giao thành công", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <HiCheckCircle className="w-4 h-4" />, step: 4 },
  "Đã giao":         { label: "Đã giao thành công", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <HiCheckCircle className="w-4 h-4" />, step: 4 },
  CANCELLED:         { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <HiXCircle className="w-4 h-4" />, step: 0 },
  Cancelled:         { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <HiXCircle className="w-4 h-4" />, step: 0 },
  "Đã hủy":          { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <HiXCircle className="w-4 h-4" />, step: 0 },
};

const steps = [
  { label: "Đặt hàng", icon: <HiShoppingBag className="w-4 h-4" /> },
  { label: "Xác nhận", icon: <HiCheckCircle className="w-4 h-4" /> },
  { label: "Đang giao", icon: <HiTruck className="w-4 h-4" /> },
  { label: "Hoàn thành", icon: <HiCheckCircle className="w-4 h-4" /> },
];

// ── Component ─────────────────────────────────────────────────────
const SingleOrderHistory = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData() as SingleOrder;
  // State riêng để có thể cập nhật real-time khi admin thay đổi
  const [order, setOrder] = useState<SingleOrder>(loaderData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch mới nhất từ server ───────────────────────────────────
  const fetchLatest = useCallback(async (silent = true) => {
    const token = getAuthToken();
    if (!token || !order?.OrderID) return;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`http://localhost:8080/api/orders/my-orders/${order.OrderID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          setOrder(data.data);
          setLastUpdated(new Date());
        }
      }
    } catch { /* silent fail */ }
    finally { setRefreshing(false); }
  }, [order?.OrderID]);

  // ── Auto-refresh mỗi 20 giây để sync trạng thái từ Admin ──────
  useEffect(() => {
    const interval = setInterval(() => fetchLatest(true), 20000);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-medium text-stone-700 mb-4">Không tìm thấy đơn hàng</h2>
          <Link to="/order-history" className="text-amber-700 hover:text-amber-900 underline text-sm">
            ← Quay lại lịch sử đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const sInfo = statusMap[order.Status] || {
    label: order.Status, color: "text-stone-600", bg: "bg-stone-50 border-stone-200", icon: null, step: 1,
  };
  const isCancelled = ["CANCELLED", "Cancelled"].includes(order.Status);

  // ── Tính subtotal từ items (UnitPrice đã là giá sau giảm) ──────
  const subtotal = order.items?.reduce((s, i) => s + i.Quantity * i.UnitPrice, 0) || 0;
  // TotalAmount từ DB là chuẩn nhất
  const total = Number(order.TotalAmount) || subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/order-history")}
              className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center
                         text-stone-500 hover:text-stone-800 hover:border-stone-400 transition-all shadow-sm"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-light text-stone-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Đơn hàng #{order.OrderID}
              </h1>
              <p className="text-stone-400 text-sm">{formatDate(order.OrderDate)}</p>
            </div>
          </div>

          {/* Manual refresh + last updated */}
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="hidden sm:block">Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
            <button
              onClick={() => fetchLatest(false)}
              className={`w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center
                          hover:border-stone-400 hover:text-stone-700 transition-all ${refreshing ? "animate-spin text-amber-600" : "text-stone-400"}`}
              title="Làm mới trạng thái"
            >
              <HiArrowPath className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status tracker */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between relative">
              {/* Background line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-100 z-0 mx-8" />
              {/* Progress line */}
              <div
                className="absolute top-5 left-0 h-0.5 bg-amber-700 z-0 mx-8 transition-all duration-700"
                style={{ width: `${Math.max(0, ((sInfo.step - 1) / (steps.length - 1)) * 100)}%` }}
              />
              {steps.map((step, i) => {
                const done = i < sInfo.step;
                const active = i === sInfo.step - 1;
                return (
                  <div key={step.label} className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                      ${active ? "bg-amber-700 border-amber-700 text-white scale-110 shadow-lg shadow-amber-200"
                        : done ? "bg-amber-100 border-amber-400 text-amber-700"
                        : "bg-white border-stone-200 text-stone-400"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className={`text-[11px] font-medium text-center max-sm:hidden
                      ${active ? "text-amber-700" : done ? "text-stone-600" : "text-stone-400"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Status label */}
            <div className="text-center mt-5">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${sInfo.bg} ${sInfo.color}`}>
                {sInfo.icon}
                {sInfo.label}
              </span>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <HiXCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-700">Đơn hàng đã bị hủy</p>
              <p className="text-red-500 text-sm">Vui lòng liên hệ chúng tôi nếu có thắc mắc.</p>
            </div>
          </div>
        )}

        {/* Product list */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-stone-50">
            <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-widest">
              Sản phẩm ({order.items?.length || 0})
            </h2>
          </div>
          <div className="divide-y divide-stone-50">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 hover:bg-stone-50/50 transition-colors">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.ProductName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiShoppingBag className="w-6 h-6 text-stone-300" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm truncate">{item.ProductName}</p>
                  {item.DiscountPercent > 0 && (
                    <span className="inline-block text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mt-1">
                      -{item.DiscountPercent}%
                    </span>
                  )}
                  <p className="text-stone-400 text-xs mt-0.5">Số lượng: {item.Quantity}</p>
                </div>
                {/* Price — UnitPrice đã là giá sau giảm */}
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-stone-800 text-sm">
                    {formatCurrency(item.UnitPrice * item.Quantity)}
                  </p>
                  <p className="text-stone-400 text-xs">
                    {formatCurrency(item.UnitPrice)} / sản phẩm
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping + Payment grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Shipping info */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
              Thông tin giao hàng
            </h3>
            <div className="flex items-start gap-2 text-stone-700 text-sm">
              <HiMapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{order.ShippingAddress || "Chưa có địa chỉ"}</span>
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
              Thanh toán
            </h3>
            <div className="flex items-center gap-2 text-stone-700 text-sm mb-4">
              <HiCreditCard className="w-4 h-4 text-amber-600" />
              <span className="font-medium">{order.PaymentMethod || "—"}</span>
            </div>
            <div className="border-t border-stone-50 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Phí giao hàng</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between font-bold text-stone-800 text-base border-t border-stone-100 pt-2 mt-2">
                <span>Tổng cộng</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            to="/order-history"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Xem tất cả đơn hàng
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SingleOrderHistory;
