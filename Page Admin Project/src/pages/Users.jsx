import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/auth";
import { getAllUsersApi, deleteUserApi } from "../services/ApiServices";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getStatusConfig = (t) => ({
  PENDING_ADMIN_CONFIRM: { label: t("status_pending_admin", "Chờ duyệt"), color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  PROCESSING: { label: t("status_processing", "Đang xử lý"), color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  SHIPPING: { label: t("status_shipping", "Đang giao"), color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  DELIVERED: { label: t("status_delivered", "Đã giao"), color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  CANCELLED: { label: t("status_cancelled", "Đã hủy"), color: "bg-red-500/15 text-red-400 border-red-500/30" },
  AWAITING_PAYMENT: { label: t("status_awaiting_payment", "Chờ thanh toán"), color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  APPROVED: { label: t("status_approved", "Đã duyệt"), color: "bg-teal-500/15 text-teal-400 border-teal-500/30" },
});

function getStatusCfg(status, t) {
  if (!status) return { label: status || "—", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
  const cfg = getStatusConfig(t);
  const key = Object.keys(cfg).find(k => status.toUpperCase().includes(k));
  return cfg[key] || { label: status, color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const formatCurrency = (n) => {
  if (!n) return "0$";
  return new Intl.NumberFormat("en-US").format(n) + "$";
};

export default function User() {
  const { t } = useTranslation();
  const toast = useRef(null);
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin1 = currentUser?.email === "admin1@fashionstyle.com";
  const isAdmin3 = currentUser?.email === "admin3@fashionstyle.com";
  const canViewDetail = isAdmin1 || isAdmin3;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { loadUsers(); }, []);

  const logAction = async (action, details) => {
    try {
      await axios.post(`${API_URL}/admin-logs`, { action, details }, config);
    } catch (err) {
      console.warn("Ghi log thất bại:", err.message);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsersApi(token);
      if (res.success) setUsers(res.data);
    } catch {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Không thể tải danh sách người dùng" });
    } finally {
      setLoading(false);
    }
  };

  const openUserDetail = async (user) => {
    if (!canViewDetail) return;
    setSelectedUser(user);
    setPanelOpen(true);
    setUserOrders([]);
    if (user.UserID) {
      setOrdersLoading(true);
      try {
        const res = await axios.get(`${API_URL}/orders/admin/user/${user.UserID}`, config);
        if (res.data?.success) setUserOrders(res.data.data);
      } catch { /* silent */ }
      finally { setOrdersLoading(false); }
    }
  };

  const closePanel = () => { setPanelOpen(false); setSelectedUser(null); };

  const handleDelete = (user) => {
    confirmDialog({
      header: t("delete_account_confirm", "Xác nhận xóa tài khoản"),
      message: (
        <div className="flex flex-col items-center gap-3 py-2">
          <i className="pi pi-exclamation-triangle text-red-500 text-5xl" />
          <p className="text-center font-bold text-gray-700">{t("delete_user_question", "Xóa tài khoản")} <span className="text-red-500">{user.FullName}</span>?</p>
          <p className="text-sm text-gray-400 text-center">{t("delete_warning", "Hành động này không thể hoàn tác.")}</p>
        </div>
      ),
      acceptLabel: t("accept_label", "Xóa"),
      rejectLabel: t("reject_label", "Hủy"),
      acceptClassName: "bg-red-500 border-none px-6 py-2 font-bold rounded-xl text-white hover:bg-red-600",
      rejectClassName: "text-gray-400 font-bold px-6",
      accept: async () => {
        try {
          const res = await deleteUserApi(user.UserID, token);
          if (res.success) {
            toast.current?.show({ severity: "success", summary: "Đã xóa", detail: `${user.FullName} đã được xóa` });
            await logAction("Xóa người dùng", `Đã xóa tài khoản user "${user.FullName}" (Email: ${user.Email})`);
            if (selectedUser?.UserID === user.UserID) closePanel();
            loadUsers();
          }
        } catch { toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Không thể xóa tài khoản" }); }
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search ||
      u.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.Email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" ||
      (roleFilter === "admin" && u.Role === "Admin") ||
      (roleFilter === "customer" && u.Role !== "Admin");
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.Role === "Admin").length,
    customers: users.filter(u => u.Role !== "Admin").length,
    active: users.filter(u => u.IsActive !== 0).length,
  };

  const avatarUrl = (id) =>
    `https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-${(id % 24) + 1}.webp`;

  const getRoleFilters = (t) => [
    { key: "all", label: t("filter_all", "Tất cả") },
    { key: "admin", label: t("filter_admin", "Admin") },
    { key: "customer", label: t("filter_customer", "Khách hàng") },
  ];

  return (
    <div className="flex h-full min-h-screen bg-[#F4F6F8] font-sans">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ===== MAIN CONTENT ===== */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${panelOpen ? "mr-[420px]" : ""}`}>
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-[#F4F6F8]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#212B36] tracking-tight">{t("users")}</h1>
              <p className="text-gray-400 text-sm mt-1">{t("user_management_sub")}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: t("total_users", "Tổng người dùng"), value: stats.total, icon: "pi-users", color: "from-violet-500 to-purple-600" },
              { label: t("admins_count", "Quản trị viên"), value: stats.admins, icon: "pi-shield", color: "from-orange-400 to-red-500" },
              { label: t("customers_count", "Khách hàng"), value: stats.customers, icon: "pi-user", color: "from-cyan-500 to-blue-600" },
              { label: t("active_users_count", "Đang hoạt động"), value: stats.active, icon: "pi-check-circle", color: "from-emerald-500 to-teal-600" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                  <i className={`pi ${s.icon} text-white text-lg`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#212B36]">{s.value}</p>
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-violet-200 focus-within:border-violet-400 transition-all">
              <i className="pi pi-search text-gray-400 text-sm" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search_user_placeholder")}
                className="bg-transparent flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <i className="pi pi-times text-xs" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {getRoleFilters(t).map(f => (
                <button
                  key={f.key}
                  onClick={() => setRoleFilter(f.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    roleFilter === f.key
                      ? "bg-[#212B36] text-white border-[#212B36] shadow-md"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Grid */}
        <div className="px-8 pb-10 flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <i className="pi pi-users text-4xl text-gray-300" />
              <p className="text-gray-400">{t("no_users_found", "Không tìm thấy người dùng nào")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const isSelected = selectedUser?.UserID === user.UserID && panelOpen;
                const isAdminUser = user.Role === "Admin";
                return (
                  <div
                    key={user.UserID}
                    onClick={() => openUserDetail(user)}
                    className={`bg-white rounded-2xl border-2 p-5 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                      isSelected ? "border-violet-400 ring-2 ring-violet-200" : "border-gray-100 hover:border-gray-200"
                    } ${!canViewDetail ? "cursor-default" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={avatarUrl(user.UserID)}
                            alt={user.FullName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.FullName)}&background=6366f1&color=fff`; }}
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${user.IsActive !== 0 ? "bg-emerald-500" : "bg-gray-400"}`} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#212B36] leading-tight">{user.FullName}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{user.Email}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <i className="pi pi-trash text-sm" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                        isAdminUser ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {isAdminUser ? t("role_admin_badge", "Admin") : t("role_customer_badge", "Khách hàng")}
                      </span>
                      <span className="text-xs text-gray-400">{t("created_at", "Tạo")} {formatDate(user.CreatedAt)}</span>
                    </div>

                    {user.PhoneNumber && (
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                        <i className="pi pi-phone text-xs" />
                        <span>{user.PhoneNumber}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            {t("showing_users", "Hiển thị")} {filteredUsers.length} / {users.length} {t("users_count_label", "người dùng")}
          </p>
        </div>
      </div>

      {/* ===== SLIDE-IN DETAIL PANEL ===== */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-[420px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {!selectedUser ? null : (
          <>
            {/* Panel Header */}
            <div className="relative bg-gradient-to-br from-[#212B36] to-[#37474F] p-6 text-white flex-shrink-0">
              <button
                onClick={closePanel}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <i className="pi pi-times text-xs" />
              </button>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarUrl(selectedUser.UserID)}
                    alt={selectedUser.FullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.FullName)}&background=6366f1&color=fff`; }}
                  />
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#212B36] ${selectedUser.IsActive !== 0 ? "bg-emerald-500" : "bg-gray-400"}`} />
                </div>
                <div>
                  <h3 className="font-black text-lg">{selectedUser.FullName}</h3>
                  <p className="text-white/60 text-xs mt-0.5">{selectedUser.Email}</p>
                  <span className={`mt-1.5 inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                    selectedUser.Role === "Admin" ? "bg-orange-400/20 text-orange-300" : "bg-blue-400/20 text-blue-300"
                  }`}>
                    {selectedUser.Role === "Admin" ? t("role_admin_badge", "Quản trị viên") : t("role_customer_badge", "Khách hàng")}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto">
              {/* Thông tin cá nhân */}
              <div className="p-5">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 flex items-center gap-2">
                  <i className="pi pi-id-card" /> {t("personal_info", "Thông tin cá nhân")}
                </h4>
                <div className="space-y-3">
                  {[
                    { icon: "pi-at", label: "Email", value: selectedUser.Email },
                    { icon: "pi-phone", label: t("phone_label", "Điện thoại"), value: selectedUser.PhoneNumber || t("not_provided", "Chưa cung cấp") },
                    { icon: "pi-map-marker", label: t("address_label", "Địa chỉ"), value: selectedUser.Address || t("not_provided", "Chưa cung cấp") },
                    { icon: "pi-calendar", label: t("register_date_label", "Ngày đăng ký"), value: formatDate(selectedUser.CreatedAt) },
                    { icon: "pi-circle", label: t("status_label", "Trạng thái"), value: selectedUser.IsActive !== 0 ? t("active_status", "Đang hoạt động") : t("locked_status", "Đã khóa"),
                      chip: true, chipColor: selectedUser.IsActive !== 0 ? "text-emerald-700 bg-emerald-100" : "text-red-700 bg-red-100" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`pi ${item.icon} text-gray-500 text-xs`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                        {item.chip ? (
                          <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${item.chipColor}`}>{item.value}</span>
                        ) : (
                          <p className="text-sm font-semibold text-gray-700 truncate">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lịch sử đơn hàng */}
              <div className="px-5 pb-6">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 flex items-center gap-2">
                  <i className="pi pi-shopping-bag" /> {t("order_history", "Lịch sử đơn hàng")}
                  {userOrders.length > 0 && (
                    <span className="ml-auto bg-[#212B36] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {userOrders.length}
                    </span>
                  )}
                </h4>

                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-3 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <i className="pi pi-inbox text-gray-300 text-xl" />
                    </div>
                    <p className="text-sm text-gray-400">{t("no_orders", "Chưa có đơn hàng nào")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((order) => {
                      const cfg = getStatusCfg(order.Status, t);
                      return (
                        <div key={order.OrderID} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-all bg-white shadow-sm">
                          {/* Order header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                            <div>
                              <p className="text-xs font-black text-gray-700">{t("order_hash", "Đơn #")}<span className="text-violet-600">{order.OrderID}</span></p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(order.CreatedAt)}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          {/* Order body */}
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <i className="pi pi-box text-xs" />
                              <span>{order.itemCount} {t("products_count_label", "sản phẩm")}</span>
                              <span className="text-gray-300">·</span>
                              <span className="capitalize">{order.PaymentMethod}</span>
                            </div>
                            <p className="font-black text-sm text-[#212B36]">{formatCurrency(order.TotalAmount)}</p>
                          </div>
                          {order.ShippingAddress && (
                            <div className="px-4 pb-3 flex items-start gap-1.5 text-[10px] text-gray-400">
                              <i className="pi pi-map-marker mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{order.ShippingAddress}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Panel Footer — chỉ Admin 1 được xóa */}
            {isAdmin1 && (
              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => handleDelete(selectedUser)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <i className="pi pi-trash text-xs" />
                  {t("delete_this_account", "Xóa tài khoản này")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Overlay khi panel mở trên mobile */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-30 md:hidden"
          onClick={closePanel}
        />
      )}
    </div>
  );
}
