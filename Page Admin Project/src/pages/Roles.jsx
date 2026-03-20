import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import {
  RiShieldUserFill,
  RiShieldStarFill,
  RiShieldCheckFill,
  RiCheckboxCircleFill,
  RiLockPasswordFill,
  RiUser3Fill,
  RiStore2Fill,
  RiTruckFill,
  RiSettings4Fill,
  RiBarChartBoxFill,
  RiDeleteBinFill,
  RiEditFill,
  RiAddCircleFill,
  RiCheckDoubleFill,
  RiCloseCircleFill,
  RiMailFill,
  RiTimeFill,
  RiSearchLine,
  RiHistoryFill,
  RiPriceTag3Fill,
  RiCheckLine,
  RiCloseLine,
  RiToggleFill,
} from "react-icons/ri";
import { InputSwitch } from "primereact/inputswitch";
import { useAuthStore } from "../stores/auth";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

// ---------------------------------------------------------------
// Dữ liệu cấu hình 3 tài khoản Admin cố định
// ---------------------------------------------------------------
const ADMIN_ROLES = [
  {
    id: 1,
    title: "Admin Chính",
    subtitle: "Toàn quyền kiểm soát hệ thống",
    email: "admin1@fashionstyle.com",
    color: "from-violet-600 to-purple-700",
    lightColor: "bg-violet-50 dark:bg-violet-900/20",
    borderColor: "border-violet-200 dark:border-violet-800",
    textColor: "text-violet-700 dark:text-violet-300",
    icon: <RiShieldStarFill size={28} />,
    badge: "LEVEL 1",
    permissions: [
      { icon: <RiCheckboxCircleFill />, label: "Xem & quản lý toàn bộ Dashboard" },
      { icon: <RiUser3Fill />, label: "Quản lý tất cả người dùng (CRUD)" },
      { icon: <RiStore2Fill />, label: "Quản lý & duyệt sản phẩm" },
      { icon: <RiPriceTag3Fill />, label: "Toàn quyền quản lý chiến dịch Khuyến Mãi" },
      { icon: <RiTruckFill />, label: "Duyệt đơn hàng do Admin 3 lên" },
      { icon: <RiShieldUserFill />, label: "Phân quyền & quản lý Admin 2, Admin 3" },
      { icon: <RiBarChartBoxFill />, label: "Xem báo cáo thống kê doanh thu" },
      { icon: <RiSettings4Fill />, label: "Cấu hình hệ thống" },
    ],
    blocked: [],
  },
  {
    id: 2,
    title: "Admin Kho",
    subtitle: "Quản lý sản phẩm & kho hàng",
    email: "admin2@fashionstyle.com",
    color: "from-cyan-500 to-blue-600",
    lightColor: "bg-cyan-50 dark:bg-cyan-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    textColor: "text-cyan-700 dark:text-cyan-300",
    icon: <RiStore2Fill size={28} />,
    badge: "LEVEL 2",
    permissions: [
      { icon: <RiAddCircleFill />, label: "Thêm sản phẩm mới vào kho" },
      { icon: <RiEditFill />, label: "Sửa thông tin, giá, ảnh sản phẩm" },
      { icon: <RiPriceTag3Fill />, label: "Tạo chiến dịch mã Code & % Giảm" },
      { icon: <RiDeleteBinFill />, label: "Xóa sản phẩm (khi Admin 1 ra lệnh)" },
      { icon: <RiStore2Fill />, label: "Xem danh sách sản phẩm & tồn kho" },
      { icon: <RiBarChartBoxFill />, label: "Xem thống kê kho hàng" },
    ],
    blocked: [
      "Quản lý người dùng",
      "Duyệt đơn hàng",
      "Phân quyền Admin",
      "Cấu hình hệ thống",
    ],
  },
  {
    id: 3,
    title: "Admin Vận Hành",
    subtitle: "Xử lý đơn hàng & chăm sóc khách hàng",
    email: "admin3@fashionstyle.com",
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
    icon: <RiTruckFill size={28} />,
    badge: "LEVEL 3",
    permissions: [
      { icon: <RiMailFill />, label: "Nhận thông tin đặt hàng từ khách hàng" },
      { icon: <RiCheckDoubleFill />, label: "Lên đơn hàng khi Admin 1 duyệt" },
      { icon: <RiUser3Fill />, label: "Xem thông tin khách hàng của đơn hàng" },
      { icon: <RiTimeFill />, label: "Cập nhật trạng thái vận chuyển" },
      { icon: <RiTruckFill />, label: "Xem lịch sử & danh sách đơn hàng" },
    ],
    blocked: [
      "Quản lý sản phẩm",
      "Quản lý Khuyến mãi",
      "Phân quyền Admin",
      "Xóa người dùng",
      "Cấu hình hệ thống",
    ],
  },
];

// ---------------------------------------------------------------
// Luồng phê duyệt đơn hàng (flow diagram)
// ---------------------------------------------------------------
const ORDER_FLOW = [
  { step: 1, actor: "Khách hàng", action: "Đặt hàng trên Web", icon: <RiUser3Fill size={20} />, color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  { step: 2, actor: "Admin Vận Hành", action: "Lên đơn hàng", icon: <RiTruckFill size={20} />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { step: 3, actor: "Admin Chính", action: "Duyệt / Từ chối đơn", icon: <RiShieldStarFill size={20} />, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  { step: 4, actor: "Admin Vận Hành", action: "Giao hàng", icon: <RiTruckFill size={20} />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
];

// ---------------------------------------------------------------
// Component Card cho mỗi Admin Role
// ---------------------------------------------------------------
function RoleCard({ role, isActive = true, onLock, onReset }) {
  const currentEmail = useAuthStore((state) => state.user?.email);
  const isOnline = currentEmail === role.email;

  return (
    <div className={`relative flex flex-col rounded-3xl border-2 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${role.borderColor} bg-white dark:bg-[#1C252E]`}>
      
      {/* Header Gradient */}
      <div className={`bg-gradient-to-br ${role.color} p-6 pb-8 text-white relative`}>
        {/* Status Badge */}
        <div className="absolute top-5 right-5">
          {isOnline ? (
            <div className="flex items-center gap-1.5 bg-green-400/20 text-green-100 px-3 py-1.5 rounded-full text-xs font-bold border border-green-400/30 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              ONLINE
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/20 text-white/60 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              OFFLINE
            </div>
          )}
        </div>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shadow-white/10 ring-1 ring-white/30">
            {role.icon}
          </div>
          <div className="mt-1">
            <span className="text-[10px] font-black bg-white/20 backdrop-blur-sm px-2 py-1 rounded tracking-widest uppercase mb-2 inline-block">
              {role.badge}
            </span>
            <h3 className="text-xl font-extrabold tracking-tight">{role.title}</h3>
            <p className="text-sm text-white/80 mt-0.5 line-clamp-1">{role.subtitle}</p>
          </div>
        </div>

        {/* Email */}
        <div className="mt-6 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 w-fit">
          <RiMailFill size={16} className="text-white/70" />
          <span className="text-sm font-mono font-bold tracking-tight">{role.email}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-6 flex-1 -mt-3 bg-white dark:bg-[#1C252E] rounded-t-3xl relative">
        {/* Quyền hạn */}
        <div>
          <p className={`text-xs font-extrabold uppercase tracking-widest mb-4 flex items-center gap-2 ${role.textColor}`}>
            <RiCheckboxCircleFill size={16} /> Quyền hạn
          </p>
          <ul className="space-y-3">
            {role.permissions.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                <span className={`${role.textColor} flex-shrink-0 mt-0.5`}>{p.icon}</span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Hạn chế */}
        {role.blocked.length > 0 && (
          <div className="mt-auto">
            <div className="h-px w-full bg-gray-100 dark:bg-gray-800 mb-4"></div>
            <p className="text-xs font-extrabold uppercase tracking-widest mb-3 text-red-500/80 dark:text-red-400 flex items-center gap-2">
              <RiCloseCircleFill size={16} /> Không có quyền
            </p>
            <ul className="space-y-2">
              {role.blocked.map((b, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-400 dark:text-gray-500 line-through font-medium">
                  <RiCloseCircleFill className="text-red-300 dark:text-red-900/50 flex-shrink-0" size={16} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {role.id === 1 && (
          <div className={`mt-auto ${role.lightColor} rounded-2xl px-5 py-4 border ${role.borderColor}`}>
            <p className={`text-xs text-center font-bold ${role.textColor} flex flex-col items-center gap-2`}>
              <RiShieldStarFill size={20} />
              Admin 1 có thể thực hiện MỌI quyền của Admin 2 và Admin 3
            </p>
          </div>
        )}

        {/* Chức năng biểu diễn dành riêng cho Admin 1 thao tác với Admin 2 & 3 */}
        {currentEmail === "admin1@fashionstyle.com" && role.id !== 1 && (
          <div className="mt-auto pt-4 flex gap-3 w-full border-t border-gray-100 dark:border-gray-800">
            <button 
              className="flex-1 bg-violet-50 hover:bg-violet-600 text-violet-600 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-xs flex items-center justify-center gap-2 border border-violet-100 hover:shadow-[0_4px_10px_rgba(124,58,237,0.3)]"
              onClick={() => onReset()}
            >
              <RiLockPasswordFill size={16} /> Reset MK
            </button>
            <button 
              className={`flex-1 font-bold py-2.5 rounded-xl transition-all duration-300 text-xs flex items-center justify-center gap-2 border ${
                isActive 
                  ? "bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border-red-100 hover:shadow-[0_4px_10px_rgba(239,68,68,0.3)]"
                  : "bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-100 hover:shadow-[0_4px_10px_rgba(16,185,129,0.3)]"
              }`}
              onClick={() => onLock(isActive)}
            >
              {isActive ? <><RiCloseCircleFill size={16} /> Khóa TK</> : <><RiCheckboxCircleFill size={16} /> Mở Khóa</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Component chính: Trang Roles
// ---------------------------------------------------------------
export default function Roles() {
  const [searchLog, setSearchLog] = useState("");
  const activityLog = useAuthStore((state) => state.activityLog); // Vẫn giữ để fallback hoặc dùng local nếu cần
  const currentEmail = useAuthStore((state) => state.user?.email);
  const token = useAuthStore((state) => state.token);
  const notifications = useAuthStore((state) => state.notifications) || [];
  const clearNotifications = useAuthStore((state) => state.clearNotifications);
  const addNotification = useAuthStore((state) => state.addNotification);

  const [dbLogs, setDbLogs] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [admin2CanDelete, setAdmin2CanDelete] = useState(false);
  const [adminIsActive, setAdminIsActive] = useState({ 2: true, 3: true });

  // 0. Xử lý thông báo chuyển tài khoản
  useEffect(() => {
    if (currentEmail && notifications.length > 0) {
      const myNotifs = notifications.filter(n => n.toEmail === currentEmail);
      if (myNotifs.length > 0) {
        // Tích hợp Toast/Alert thông báo cho Admin khi đăng nhập (do không có socket Realtime ở file này)
        setTimeout(() => {
          myNotifs.forEach(n => alert(`🔔 THÔNG BÁO:\n\n${n.message}`));
          if (clearNotifications) clearNotifications(currentEmail);
        }, 500); // Đợi render xong mới hiện popup
      }
    }
  }, [currentEmail, notifications, clearNotifications]);

  // Gọi API nếu là Admin 1
  useEffect(() => {
    fetchAdmin1Data();
    fetchLogs();
  }, [currentEmail]);

  const fetchLogs = async () => {
    try {
      if (!token) return;
      const res = await axios.get(`${API_URL}/admin-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setDbLogs(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi fetch logs:", err);
    }
  };

  const fetchAdmin1Data = async () => {
    try {
      if (!token) return;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 1. Fetch Đơn chờ duyệt
      const resOrders = await axios.get(`${API_URL}/orders/admin`, config);
      if (resOrders.data?.success) {
        const pendings = resOrders.data.data.filter(
          (o) => o.Status.includes("PENDING") || o.Status === "AWAITING_PAYMENT"
        );
        setPendingOrders(pendings);
      }
      // 2. Fetch Quyền xóa và Trạng thái khóa của Admin
      const resPerms = await axios.get(`${API_URL}/user/admin/permissions`, config);
      if (resPerms.data?.success) {
        setAdmin2CanDelete(resPerms.data.admin2CanDelete);
        setAdminIsActive({
          2: resPerms.data.admin2IsActive,
          3: resPerms.data.admin3IsActive
        });
      }
    } catch (err) {
      console.error("Lỗi fetch dữ liệu Admin 1:", err);
    }
  };

  const handleResetPassword = (email) => {
    // Lưu thông báo vào Zustand thay vì gọi API phức tạp (để demo giao diện nhanh)
    if (addNotification) {
      addNotification(email, `Admin Chính đã yêu cầu cấp mới lại Mật khẩu của tài khoản [${email}]. Vui lòng truy cập trang Cấu Hình để đổi mật khẩu ngay lập tức!`);
    }
    alert(`✅ Đã gửi lệnh Reset Mật khẩu tới ${email}. Người này sẽ nhận thông báo ngay khi đăng nhập.`);
  };

  const handleLockAccount = async (email, currentIsActive) => {
    try {
      if (!token) return;
      const res = await axios.put(`${API_URL}/user/admin/lock`, 
        { email, lock: currentIsActive }, // Gửi lock=true nếu đang Active
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        alert(`✅ ${res.data.message}`);
        fetchAdmin1Data(); // Tải lại state khóa
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi khóa/mở khóa tài khoản!");
    }
  };

  const handleApproveOrder = async (orderId, isApprove) => {
    try {
      const action = isApprove ? "APPROVE" : "REJECT";
      await axios.put(`${API_URL}/orders/admin/${orderId}/approve`, {
        Action: action,
        Reason: isApprove ? "" : "Admin 1 từ chối",
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchAdmin1Data(); // Gọi lại để cập nhật DS
    } catch (err) {
      alert("Lỗi khi duyệt đơn hàng!");
    }
  };

  const handleToggleAdmin2Permission = async (val) => {
    try {
      await axios.put(`${API_URL}/user/admin/permissions`, 
        { admin2CanDelete: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdmin2CanDelete(val);
    } catch (err) {
      alert("Lỗi khi cập nhật quyền!");
    }
  };

  const handleDeleteLog = async (logId) => {
    if (currentEmail !== "admin1@fashionstyle.com") {
      alert("Chỉ Admin Chính mới có quyền xóa nhật ký!");
      return;
    }
    try {
      await axios.delete(`${API_URL}/admin-logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (err) {
      alert("Lỗi khi xóa log!");
    }
  };

  const handleClearAllLogs = async () => {
    if (currentEmail !== "admin1@fashionstyle.com") {
      alert("Chỉ Admin Chính mới có quyền xóa toàn bộ nhật ký!");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử hoạt động không? Hành động này không thể hoàn tác.")) return;
    try {
      await axios.delete(`${API_URL}/admin-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (err) {
      alert("Lỗi khi xóa toàn bộ logs!");
    }
  };

  // Lọc lịch sử hoạt động từ DB
  const filteredLogs = dbLogs.filter(
    (log) =>
      log.email?.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.name?.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <RiShieldUserFill className="text-violet-600" size={36} />
            Phân Quyền Quản Trị
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Quản lý 3 cấp độ Admin, theo dõi trạng thái online và lịch sử hoạt động.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1">
           <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800/50 font-bold text-sm">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             Hệ thống đang hoạt động
           </div>
        </div>
      </div>

      {/* 3 Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ADMIN_ROLES.map((role) => (
          <RoleCard 
            key={role.id} 
            role={role} 
            isActive={role.id === 1 ? true : adminIsActive[role.id]}
            onLock={(currentIsActive) => handleLockAccount(role.email, currentIsActive)}
            onReset={() => handleResetPassword(role.email)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Lịch Sử Hoạt Động (2/3 chiều rộng) */}
        <div className="xl:col-span-2 bg-white dark:bg-[#1C252E] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <RiHistoryFill className="text-blue-500" size={24} />
                Lịch Sử Hoạt Động
              </h2>
              <p className="text-xs font-medium text-gray-400 mt-1">Lưu trữ tối đa 100 hành động gần nhất của các Admin</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <InputText
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  placeholder="Tìm user, email, hành động..."
                  className="pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#212B36] border-none rounded-xl text-sm font-medium w-full sm:w-[280px] focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white"
                />
              </div>
              {currentEmail === "admin1@fashionstyle.com" && (
                <button 
                  onClick={handleClearAllLogs}
                  className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white p-3 rounded-xl transition-all duration-300 border border-red-100 dark:bg-red-900/10 dark:border-red-800/20"
                  title="Xóa tất cả nhật ký"
                >
                  <RiDeleteBinFill size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredLogs.length > 0 ? (
              <div className="flex flex-col">
                {filteredLogs.map((log) => {
                  const roleData = ADMIN_ROLES.find(r => r.email === log.email);
                  const dt = new Date(log.time);
                  const timeString = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateString = dt.toLocaleDateString('vi-VN');

                  return (
                    <div key={log.id} className="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors mx-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${roleData?.color || "bg-gray-500"}`}>
                        {roleData ? roleData.title.split(" ")[1].substring(0, 1) : (log.Role === 'Admin' ? 'A' : 'C')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 truncate">
                          {log.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{log.name}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          <code className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{log.email}</code>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{timeString}</span>
                          <span className="text-[10px] text-gray-400">{dateString}</span>
                        </div>
                        {currentEmail === "admin1@fashionstyle.com" && (
                          <button 
                            onClick={() => handleDeleteLog(log.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <RiDeleteBinFill size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                <RiSearchLine size={48} className="text-gray-200 dark:text-gray-700" />
                <p className="font-medium text-sm">Không tìm thấy lịch sử phù hợp.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Flow Diagram (1/3 chiều rộng) */}
        <div className="bg-white dark:bg-[#1C252E] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col h-[500px]">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <RiTruckFill className="text-emerald-500" size={24} />
              Luồng Đơn Hàng
            </h2>
            <p className="text-xs font-medium text-gray-400 mt-1">Sự phối hợp giữa các tài khoản</p>
          </div>
          
          <div className="mt-8 flex flex-col gap-4 flex-1">
            {ORDER_FLOW.map((step, idx) => (
              <div key={step.step} className="flex relative">
                {/* Timeline line */}
                {idx < ORDER_FLOW.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-[-16px] w-[2px] bg-gray-100 dark:bg-gray-800"></div>
                )}
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 ring-4 ring-white dark:ring-[#1C252E] shadow-sm ${step.color}`}>
                  {step.icon}
                </div>
                
                <div className="ml-4 pt-1">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-gray-200">{step.actor}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{step.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TÍNH NĂNG MỞ RỘNG DÀNH RIÊNG CHO ADMIN 1 */}
      {useAuthStore((state) => state.user?.email) === "admin1@fashionstyle.com" && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-3xl border border-violet-200 dark:border-violet-800/30 shadow-md p-8 mt-4">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-violet-800 dark:text-violet-400 flex items-center gap-3 drop-shadow-sm">
              <RiShieldStarFill className="text-violet-600" size={32} />
              Bảng Điều Khiển Độc Quyền (Admin Chính)
            </h2>
            <p className="text-sm font-semibold text-violet-600/70 mt-1 pl-11">
              Trung tâm thao tác các quyền hạn cao cấp nhất của hệ thống
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Duyệt đơn hàng */}
            <div className="bg-white dark:bg-[#1C252E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-gray-100"><RiCheckDoubleFill className="text-emerald-500" size={24}/> Duyệt Đơn Hàng (Chờ xử lý)</h3>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                {pendingOrders.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Không có đơn hàng chờ duyệt.</p>
                ) : (
                  pendingOrders.map(order => (
                    <div key={order.OrderID} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col gap-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-blue-600 font-mono">#ORD-{order.OrderID}</span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(order.OrderDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Tổng: <span className="text-red-500">${order.TotalAmount}</span> - {order.FullName}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveOrder(order.OrderID, true)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-1 shadow-sm"><RiCheckLine/> Duyệt</button>
                        <button onClick={() => handleApproveOrder(order.OrderID, false)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-1"><RiCloseLine/> Hủy</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Quản lý Admin */}
            <div className="bg-white dark:bg-[#1C252E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-gray-100"><RiShieldUserFill className="text-blue-500" size={24}/> Quản Lý Admin 2 & 3</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                  <div>
                    <p className="font-extrabold text-sm text-slate-700 dark:text-gray-200">Admin Kho (A2)</p>
                    <p className="text-xs text-gray-500">Quyền Xóa Sản Phẩm Kho</p>
                  </div>
                  <InputSwitch checked={admin2CanDelete} onChange={(e) => handleToggleAdmin2Permission(e.value)} className="scale-75" />
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/20">
                  <div>
                    <p className="font-extrabold text-sm text-slate-700 dark:text-gray-200">Admin Vận Hành (A3)</p>
                    <p className="text-xs text-gray-500">Quyền truy cập thông tin khách</p>
                  </div>
                  <InputSwitch checked={true} className="scale-75" />
                </div>
              </div>
            </div>

            {/* 3. Cấu hình hệ thống */}
            <div className="bg-white dark:bg-[#1C252E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-gray-100"><RiSettings4Fill className="text-amber-500" size={24}/> Cấu Hình Hệ Thống</h3>
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300">Chế độ Bảo Trì Web</span>
                    <InputSwitch checked={false} className="scale-75" />
                 </div>
                 <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300">Nhận cảnh báo qua TGM</span>
                    <InputSwitch checked={true} className="scale-75" />
                 </div>
                 <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300">Đóng đăng ký Customer mới</span>
                    <InputSwitch checked={false} className="scale-75" />
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

