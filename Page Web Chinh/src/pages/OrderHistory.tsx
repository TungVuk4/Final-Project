import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import customFetch from "../axios/custom";
import { formatDate } from "../utils/formatDate";
import { getAuthToken } from "../features/auth/authSlice";

// Loader chạy trước khi component mount — phải lấy token từ localStorage trực tiếp
export const loader = async () => {
  const token = getAuthToken();
  if (!token) return [];
  try {
    const response = await customFetch.get("/orders/my-orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};

type BackendOrder = {
  OrderID: number;
  OrderDate: string;
  TotalAmount: number;
  Status: string;
};

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-stone-500 hover:text-stone-800 transition-colors"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl font-semibold text-stone-800">Lịch sử đơn hàng</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-medium text-stone-700 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-stone-500 mb-8">Hãy bắt đầu mua sắm và đơn hàng của bạn sẽ xuất hiện ở đây.</p>
            <Link
              to="/shop"
              className="inline-block bg-stone-800 text-white px-8 py-3 rounded-lg hover:bg-stone-900 transition-colors font-medium"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-stone-600">Mã đơn</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-stone-600">Ngày đặt</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-stone-600">Tổng tiền</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-stone-600">Trạng thái</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-stone-600">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr key={order.OrderID} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-stone-800">
                        #{order.OrderID}
                      </td>
                      <td className="py-4 px-6 text-sm text-stone-600">
                        {formatDate(order.OrderDate)}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-stone-800">
                        ${Number(order.TotalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[order.Status] || "bg-stone-100 text-stone-600"}`}>
                          {order.Status || "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/order-history/${order.OrderID}`}
                          className="text-sm text-stone-700 underline hover:text-stone-900 transition-colors"
                        >
                          Xem chi tiết →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
