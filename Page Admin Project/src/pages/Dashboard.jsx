import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { Chart } from "primereact/chart";
import { Skeleton } from "primereact/skeleton";

const API_URL = "http://localhost:8080/api";

function formatCurrency(amount) {
  const usd = Number(amount);
  if (!usd) return "0$";
  return new Intl.NumberFormat("en-US").format(usd) + "$";
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
  const [adminLogs, setAdminLogs] = useState([]);

  // Cấu hình hệ thống (Admin 1)
  const [sysConfig, setSysConfig] = useState({
    maintenance_mode: false,
    telegram_alerts: false,
    close_registration: false,
  });
  const [sysConfigLoading, setSysConfigLoading] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [ovRes, chRes, logRes] = await Promise.all([
          axios.get(`${API_URL}/stats/dashboard/overview`, config),
          axios.get(`${API_URL}/stats/dashboard/charts`, config),
          axios.get(`${API_URL}/admin-logs`, config)
        ]);
        
        if (ovRes.data?.success) setStats(ovRes.data.data);
        if (chRes.data?.success) {
          setPieData(chRes.data.data.pieChart || []);
          setBarData(chRes.data.data.barChart || []);
        }
        if (logRes.data?.success) setAdminLogs(logRes.data.data.slice(0, 10));
      } catch (error) {
        console.error("Lỗi load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  // Load system config cho Admin 1
  useEffect(() => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.email !== "admin1@fashionstyle.com") return;
    axios.get(`${API_URL}/system-config`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data?.success) setSysConfig(res.data.data); })
      .catch(() => {});
  }, [token]);

  const handleSysConfigToggle = async (key) => {
    const newValue = !sysConfig[key];
    setSysConfigLoading(prev => ({ ...prev, [key]: true }));
    try {
      await axios.put(`${API_URL}/system-config`, { key, value: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSysConfig(prev => ({ ...prev, [key]: newValue }));
    } catch (e) {
      console.error("Lỗi cập nhật cấu hình:", e);
    } finally {
      setSysConfigLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getActionCfg = (action) => {
    const types = {
      APPROVE_ORDER: { icon: "pi-check-circle", color: "text-emerald-500", bg: "bg-emerald-50" },
      REJECT_ORDER: { icon: "pi-times-circle", color: "text-red-500", bg: "bg-red-50" },
      UPDATE_STATUS: { icon: "pi-sync", color: "text-blue-500", bg: "bg-blue-50" },
      DELETE_ORDER: { icon: "pi-trash", color: "text-rose-500", bg: "bg-rose-50" },
      DEFAULT: { icon: "pi-info-circle", color: "text-slate-500", bg: "bg-slate-50" }
    };
    return types[action] || types.DEFAULT;
  };

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
          label: (ctx) => ` Doanh thu: ${new Intl.NumberFormat("en-US").format(Number(ctx.raw))}$`
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
          callback: (value) => (value >= 1000000 ? (value / 1000000) + 'M' : value >= 1000 ? (value / 1000) + 'K' : value) + '$'
        }
      }
    },
    animation: { duration: 1500, easing: 'easeOutQuart' }
  };

  const currentUser = useAuthStore((state) => state.user);
  const isOpsAdmin = currentUser?.email === "admin3@fashionstyle.com";
  const isProductAdmin = currentUser?.email === "admin2@fashionstyle.com";
  const isAdmin1 = currentUser?.email === "admin1@fashionstyle.com";

  // Dữ liệu UI cho 4 thẻ Widget (Cá nhân hóa theo Role)
  let widgets = [
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

  // (Đã xóa bộ lọc ẩn Tổng đơn hàng cho Admin 1 theo yêu cầu mới)

  if (isOpsAdmin) {
    widgets = [
      {
        title: t("new_order_widget", "Đơn hàng mới"),
        value: stats.pendingOrders > 0 ? (stats.pendingOrders > 2 ? "2+" : stats.pendingOrders) : "0",
        desc: t("new_order_desc", "Cần xác nhận ngay"),
        icon: "pi-bell",
        iconBg: "bg-gradient-to-br from-orange-400 to-red-500 shadow-red-500/40"
      },
      {
        title: t("shipping_widget", "Đang vận chuyển"),
        value: formatNumber(stats.shippingOrders),
        desc: t("shipping_desc", "Đơn hàng trên đường đi"),
        icon: "pi-truck",
        iconBg: "bg-gradient-to-br from-blue-400 to-indigo-600 shadow-indigo-500/40"
      },
      {
        title: t("my_customers_widget", "Khách hàng của tôi"),
        value: formatNumber(stats.totalUsers),
        desc: t("total_customers_desc", "Tổng khách hàng"),
        icon: "pi-user",
        iconBg: "bg-gradient-to-br from-teal-400 to-emerald-600 shadow-emerald-500/40"
      },
      {
        title: t("completed_widget", "Đã hoàn thành"),
        value: formatNumber(stats.completedOrders),
        desc: t("completed_desc", "Đơn hàng thành công"),
        icon: "pi-check-circle",
        iconBg: "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-blue-500/40"
      }
    ];
  }

  return (
    <div className="space-y-8 font-inter pb-10">
      {isOpsAdmin && currentUser?.canAccessCustomerInfo === false ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white rounded-3xl p-10 shadow-sm border border-red-100">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <i className="pi pi-lock text-5xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quyền hoạt động đã bị tạm dừng</h1>
          <p className="text-slate-500 mt-4 font-medium max-w-md mx-auto leading-relaxed">Tài khoản Admin Vận Hành của bạn hiện đang bị giới hạn quyền truy cập vào thông tin khách hàng và đơn hàng. Vui lòng liên hệ Admin Chính để được cấp lại quyền.</p>
        </div>
      ) : (
      <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("welcome_back", "Chào mừng trở lại! 👋")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
             {isOpsAdmin ? t("ops_dashboard_desc", "Hệ thống vận hành đơn hàng FashionStyle.") : t("dashboard_desc", "Bảng điều khiển thống kê tổng quan của hệ thống.")}
          </p>
        </div>
      </div>

      {isOpsAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Card Admin Vận Hành - Phong cách Premium như ảnh mẫu */}
           <div className="lg:col-span-4 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-500/10 border border-emerald-100 flex flex-col">
              <div className="bg-gradient-to-br from-[#00A76F] to-[#007B55] p-8 text-white relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                 <div className="absolute top-2 right-4 flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-widest uppercase">{t("status_online", "ONLINE")}</span>
                 </div>
                 
                 <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
                    <i className="pi pi-truck text-3xl"></i>
                 </div>
                 
                 <div className="mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-black tracking-tighter backdrop-blur-md">{t("level_3", "LEVEL 3")}</span>
                    <h2 className="text-2xl font-black mt-2 leading-tight">{t("role_admin3_title", "Admin Vận Hành")}</h2>
                 </div>
                 <p className="text-emerald-50/80 text-sm font-medium">{t("role_admin3_sub", "Xử lý đơn hàng & chăm sóc khách hàng")}</p>
                 
                 <div className="mt-8 flex items-center gap-3 p-3 bg-black/20 rounded-2xl backdrop-blur-md border border-white/10">
                    <i className="pi pi-envelope text-emerald-200"></i>
                    <span className="text-sm font-bold truncate">admin3@fashionstyle.com</span>
                 </div>
              </div>
              
              <div className="bg-white p-8 flex-1">
                 <div className="space-y-6">
                    <div>
                       <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                          <i className="pi pi-check-circle"></i> {t("permissions_label", "QUYỀN HẠN")}
                       </h3>
                       <ul className="space-y-4">
                          {[
                             { icon: 'pi-bell', text: t("role_admin3_p1", "Nhận thông tin đặt hàng từ khách hàng") },
                             { icon: 'pi-send', text: t("role_admin3_p2", "Lên đơn hàng khi Admin 1 duyệt") },
                             { icon: 'pi-user', text: t("role_admin3_p3", "Xem thông tin khách hàng của đơn hàng") },
                             { icon: 'pi-map-marker', text: t("role_admin3_p4", "Cập nhật trạng thái vận chuyển") },
                             { icon: 'pi-list', text: t("role_admin3_p5", "Xem lịch sử & danh sách đơn hàng") }
                          ].map((item, idx) => (
                             <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                <i className={`pi ${item.icon} text-emerald-500`}></i>
                                {item.text}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <div className="pt-6 border-t border-gray-100">
                       <h3 className="text-xs font-black text-red-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                          <i className="pi pi-times-circle"></i> {t("no_permissions_label", "KHÔNG CÓ QUYỀN")}
                       </h3>
                       <ul className="space-y-4 opacity-40 grayscale">
                          {[t("role_admin3_b1", "Quản lý sản phẩm"), t("role_admin3_b2", "Quản lý Khuyến mãi"), t("role_admin3_b3", "Phân quyền Admin")].map((text, idx) => (
                             <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-500 line-through">
                                <i className="pi pi-times-circle text-red-400"></i>
                                {text}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
           </div>

           {/* Stats Widgets for Ops Admin */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {widgets.map((w, index) => (
                    <div
                       key={index}
                       className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 flex items-center justify-between group transition-all duration-300"
                    >
                       <div>
                          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2">{w.title}</p>
                          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{w.value}</h3>
                          <p className="text-xs font-medium text-gray-400 mt-2">{w.desc}</p>
                       </div>
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ${w.iconBg}`}>
                          <i className={`pi ${w.icon}`} />
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex-1">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                       <span className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner pt-1">
                          <i className="pi pi-history text-2xl" />
                       </span>
                       {t("ops_activity_log", "Nhật ký Vận hành")}
                    </h2>
                 </div>
                  {adminLogs.length > 0 ? (
                    <div className="space-y-6 overflow-y-auto pr-2 max-h-[400px]">
                        {adminLogs.map((log) => {
                          const cfg = getActionCfg(log.action);
                          return (
                            <div key={log.id} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                   <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110`}>
                                      <i className={`pi ${cfg.icon} text-lg`} />
                                   </div>
                                   <div className="w-px h-full bg-slate-100 mt-2"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                   <div className="flex justify-between items-start mb-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                         {new Date(log.time).toLocaleString("vi-VN")}
                                      </span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">
                                         {t("admin_prefix", "Admin: ")}{log.name}
                                      </span>
                                   </div>
                                   <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-cyan-600 transition-colors">
                                      {log.Details || log.action}
                                   </p>
                                </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-10 opacity-60">
                        <div className="w-20 h-20 mb-4 bg-gray-50 rounded-full flex items-center justify-center border-4 border-dashed border-gray-200">
                           <i className="pi pi-clock text-3xl"></i>
                        </div>
                        <p className="text-sm font-bold">{t("no_activity_today", "Chưa có hoạt động nào trong hôm nay")}</p>
                    </div>
                  )}
              </div>
           </div>
        </div>
      )}

      {/* Grid 4 thẻ thống kê (Chỉ hiển thị cho Admin 1 hoặc role khác) */}
      {!isOpsAdmin && (
        <>
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
          {/* Pie Chart */}
          <div className="lg:col-span-1 bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><i className="pi pi-chart-pie text-xl" /></span>
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

          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner"><i className="pi pi-chart-bar text-xl" /></span>
                {t("revenue_7_days", "Doanh thu 7 ngày qua")}
              </h2>
            </div>
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
        </>
      )}
      </>
      )}
    </div>
  );
}
