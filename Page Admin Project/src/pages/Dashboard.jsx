import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { Chart } from "primereact/chart";
import { Skeleton } from "primereact/skeleton";

const API_URL = "http://localhost:8080/api";

function formatCurrency(amount) {
  if (!amount) return "0₫";
  return Number(amount).toLocaleString("vi-VN") + "₫";
}

function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function Dashboard() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.token);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalReviews: 0
  });
  
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Gộp 2 request để tải nhanh hơn
        const [resStats, resCharts] = await Promise.all([
          axios.get(`${API_URL}/stats/dashboard/overview`, config),
          axios.get(`${API_URL}/stats/dashboard/charts`, config)
        ]);

        if (resStats.data?.success) {
          setStats(resStats.data.data);
        }
        if (resCharts.data?.success) {
          setPieData(resCharts.data.data.pieChart || []);
          setBarData(resCharts.data.data.barChart || []);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Cấu hình Biểu đồ Tròn (Doanh số theo danh mục)
  const pieChartConfig = {
    labels: pieData.map(d => d.label),
    datasets: [
      {
        data: pieData.map(d => Number(d.value)),
        backgroundColor: ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899"],
        hoverBackgroundColor: ["#2563EB", "#7C3AED", "#D97706", "#059669", "#DC2626", "#DB2777"],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const pieOptions = {
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 25, font: { family: 'Inter', size: 13 } } },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 14, family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        callbacks: {
          label: (ctx) => ` Số lượng bán: ${ctx.raw} SP`
        }
      }
    },
    cutout: '70%',
    layout: { padding: 20 },
    animation: { animateScale: true, animateRotate: true }
  };

  // Cấu hình Biểu đồ Cột (Doanh thu 7 ngày)
  const barChartConfig = {
    labels: barData.map(d => d.date),
    datasets: [
      {
        label: "Doanh thu",
        data: barData.map(d => Number(d.revenue)),
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        hoverBackgroundColor: "#8B5CF6",
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 14, family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        callbacks: {
          label: (ctx) => ` Doanh thu: ${Number(ctx.raw).toLocaleString("vi-VN")}₫`
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false, drawBorder: false },
        ticks: { font: { family: 'Inter', size: 12 }, color: '#6B7280' }
      },
      y: { 
        grid: { color: "#F3F4F6", drawBorder: false, borderDash: [5, 5] },
        ticks: { 
          font: { family: 'Inter', size: 12 }, 
          color: '#6B7280',
          callback: (value) => value >= 1000000 ? (value / 1000000) + 'M' : value >= 1000 ? (value / 1000) + 'K' : value
        }
      }
    },
    animation: { duration: 1500, easing: 'easeOutQuart' }
  };

  // Dữ liệu UI cho 4 thẻ Widget
  const widgets = [
    {
      title: t("acc_revenue", "Doanh thu tích lũy"),
      value: formatCurrency(stats.totalRevenue),
      desc: t("desc_revenue", "Tổng doanh thu bán hàng"),
      icon: "pi-wallet",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/40"
    },
    {
      title: t("acc_users", "Khách hàng đăng ký"),
      value: formatNumber(stats.totalUsers),
      desc: t("desc_users", "Thành viên trên hệ thống"),
      icon: "pi-users",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/40"
    },
    {
      title: t("acc_orders", "Tổng đơn đặt hàng"),
      value: formatNumber(stats.totalOrders),
      desc: t("desc_orders", "Đơn mua thành công"),
      icon: "pi-shopping-cart",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/40"
    },
    {
      title: t("acc_reviews", "Lượt đánh giá"),
      value: formatNumber(stats.totalReviews),
      desc: t("desc_reviews", "Phản hồi người dùng"),
      icon: "pi-star-fill",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-teal-500/40"
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t("welcome_back", "Chào mừng trở lại! 👋")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">{t("dashboard_desc", "Bảng điều khiển thống kê tổng quan của hệ thống.")}</p>
        </div>
      </div>

      {/* Grid 4 thẻ thống kê siêu xịn xò */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="7rem" borderRadius="1.5rem" className="!bg-gray-200" />
          ))
        ) : (
          widgets.map((w, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-lg border border-gray-100 flex items-center justify-between group transition-all duration-300"
            >
              <div>
                <p className="text-gray-500 font-medium text-sm mb-1">{w.title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{w.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-[1rem] flex items-center justify-center text-white text-2xl shadow-lg group-hover:-translate-y-1 transition-transform duration-300 ${w.iconBg}`}>
                <i className={`pi ${w.icon}`} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Phần Biểu đồ (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Doanh số theo danh mục */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><i className="pi pi-chart-pie text-xl" /></span>
            {t("trending_categories", "Thể loại thịnh hành")}
          </h2>
          
          <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
            {loading ? (
              <Skeleton shape="circle" size="18rem" className="!bg-gray-100" />
            ) : pieData.length > 0 ? (
                <>
                  <Chart type="doughnut" data={pieChartConfig} options={pieOptions} className="w-full flex justify-center" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[calc(50%+15px)] text-center pointer-events-none">
                     <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{t("total_products", "TỔNG SP")}</p>
                     <p className="text-3xl font-black text-gray-800 tracking-tighter">
                       {pieData.reduce((acc, cur) => acc + Number(cur.value), 0)}
                     </p>
                  </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                    <i className="pi pi-box text-5xl mb-3 text-gray-200"></i>
                    <p className="text-sm font-medium">{t("no_product_data", "Chưa có dữ liệu sản phẩm")}</p>
                </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Doanh thu 7 ngày qua */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><i className="pi pi-chart-bar text-xl" /></span>
              {t("revenue_7_days", "Doanh thu 7 ngày qua")}
            </h2>
          </div>
          <p className="text-gray-400 text-sm mb-6 ml-10 -mt-8">{t("revenue_stats_desc", "Thống kê doanh thu theo ngày")}</p>
          
          <div className="flex-1 min-h-[300px] h-[300px] w-full">
            {loading ? (
              <Skeleton width="100%" height="100%" borderRadius="16px" className="!bg-gray-100" />
            ) : barData.length > 0 ? (
              <Chart type="bar" data={barChartConfig} options={barOptions} className="h-full w-full" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <i className="pi pi-calendar text-5xl mb-3 text-gray-200"></i>
                  <p className="text-sm font-medium">{t("no_recent_transactions", "Chưa có giao dịch nào gần đây")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
