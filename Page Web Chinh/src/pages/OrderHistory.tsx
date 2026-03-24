import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { formatCurrency } from "../utils/formatCurrency";
import { getAuthToken } from "../features/auth/authSlice";
import { HiArrowLeft, HiShoppingBag, HiClock, HiCheckCircle, HiXCircle, HiTruck } from "react-icons/hi2";

export const loader = async () => {
  const token = getAuthToken();
  if (!token) return [];
  try {
    const response = await fetch("http://localhost:8080/api/orders/my-orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data?.data || [];
  } catch {
    return [];
  }
};

type BackendOrder = {
  OrderID: number;
  OrderDate: string;
  TotalAmount: number;
  Status: string;
};

const statusMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING_COD:    { label: "Chờ xác nhận", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" /> },
  PENDING_ONLINE: { label: "Chờ thanh toán", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" /> },
  PROCESSING:     { label: "Đang xử lý", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <HiClock className="w-4 h-4" /> },
  Shipped:        { label: "Đang giao", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <HiTruck className="w-4 h-4" /> },
  "Dang giao":   { label: "Đang giao", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <HiTruck className="w-4 h-4" /> },
  Delivered:      { label: "Đã giao", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <HiCheckCircle className="w-4 h-4" /> },
  CANCELLED:      { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <HiXCircle className="w-4 h-4" /> },
  Cancelled:      { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <HiXCircle className="w-4 h-4" /> },
  Pending:        { label: "Chờ xác nhận", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <HiClock className="w-4 h-4" /> },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusMap[status] || { label: status, color: "text-stone-600", bg: "bg-stone-50 border-stone-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.color}`}>
      {s.icon}
      {s.label}
    </span>
  );
};

const OrderHistory = () => {
  const orders = useLoaderData() as BackendOrder[];
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Vui lòng đăng nhập để xem lịch sử đơn hàng");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/user-profile')}
            className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center
                       text-stone-500 hover:text-stone-800 hover:border-stone-400 transition-all shadow-sm"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-stone-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Lịch sử đơn hàng
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">{orders.length > 0 ? `${orders.length} đơn hàng` : "Chưa có đơn hàng"}</p>
          </div>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-16 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiShoppingBag className="w-10 h-10 text-stone-300" />
            </div>
            <h2 className="text-xl font-medium text-stone-700 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-stone-400 text-sm mb-8">Hãy bắt đầu mua sắm và đơn hàng của bạn sẽ xuất hiện ở đây.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-xl
                         hover:bg-amber-800 transition-colors font-medium text-sm"
            >
              <HiShoppingBag className="w-4 h-4" />
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order, idx) => (
              <div
                key={order.OrderID}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden anim-fadeInUp"
                style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: "both" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
                  {/* Order info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center border border-stone-100 flex-shrink-0">
                      <HiShoppingBag className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-stone-800 text-base">Đơn #{order.OrderID}</h3>
                        <StatusBadge status={order.Status} />
                      </div>
                      <p className="text-stone-400 text-sm mt-1">{formatDate(order.OrderDate)}</p>
                    </div>
                  </div>

                  {/* Amount + Action */}
                  <div className="flex items-center gap-4 sm:flex-shrink-0 sm:ml-auto pl-16 sm:pl-0">
                    <div className="text-right">
                      <p className="text-xs text-stone-400 mb-0.5">Tổng tiền</p>
                      <p className="font-bold text-stone-800 text-base">{formatCurrency(Number(order.TotalAmount || 0))}</p>
                    </div>
                    <Link
                      to={`/order-history/${order.OrderID}`}
                      className="inline-flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium
                                 px-4 py-2 rounded-xl hover:bg-amber-800 transition-colors whitespace-nowrap"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
