import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { useAuthStore } from "../stores/auth";
import axios from "axios";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

const API_URL = "http://localhost:8080/api";

// [Templates & Helpers]
const getStatusCfg = (status) => {
  if (!status) return { label: "—", color: "bg-gray-500/15 text-gray-500 border-gray-500/30", icon: "pi-question-circle" };
  const configs = {
    PENDING_COD: { label: "Chờ xác nhận (COD)", color: "bg-amber-500/10 text-amber-600 border-amber-200/50", icon: "pi-clock" },
    AWAITING_PAYMENT: { label: "Chờ thanh toán", color: "bg-orange-500/10 text-orange-600 border-orange-200/50", icon: "pi-credit-card" },
    PROCESSING: { label: "Đang xử lý", color: "bg-blue-500/10 text-blue-600 border-blue-200/50", icon: "pi-sync" },
    SHIPPING: { label: "Đang giao", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200/50", icon: "pi-truck" },
    DELIVERED: { label: "Đã giao", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50", icon: "pi-check-circle" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-500/10 text-red-600 border-red-200/50", icon: "pi-times-circle" }
  };
  
  // Map Tiếng Việt sang Key
  const vnMap = { "Đang giao": "SHIPPING", "Đã giao": "DELIVERED", "Đã hủy": "CANCELLED", "Chờ xử lý": "PROCESSING" };
  const key = vnMap[status] || Object.keys(configs).find(k => status.toUpperCase().includes(k.toUpperCase())) || status;
  return configs[key] || { label: status, color: "bg-gray-500/15 text-gray-500 border-gray-500/30", icon: "pi-info-circle" };
};

export default function Orders() {
  const toast = useRef(null);
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  
  const isSuperAdmin = currentUser?.email === "admin1@fashionstyle.com";
  const isOpsAdmin = currentUser?.email === "admin3@fashionstyle.com";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [approveDialog, setApproveDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, PENDING, SHIPPING, COMPLETED
  const [deleteDialog, setDeleteDialog] = useState(false);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders/admin`, config);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Không thể tải danh sách đơn hàng" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleApproveReject = async (action) => {
    try {
      if (action === "REJECT" && !rejectReason.trim()) {
         toast.current?.show({ severity: "warn", summary: "Lưu ý", detail: "Vui lòng nhập lý do từ chối" });
         return;
      }
      await axios.put(`${API_URL}/orders/admin/${selectedOrder.OrderID}/approve`, {
        Action: action,
        Reason: rejectReason
      }, config);
      toast.current?.show({ severity: "success", summary: "Thành công", detail: `Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} đơn hàng` });
      setApproveDialog(false);
      loadOrders();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Thao tác thất bại" });
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`${API_URL}/orders/admin/${selectedOrder.OrderID}/status`, {
        Status: newStatus
      }, config);
      toast.current?.show({ severity: "success", summary: "Thành công", detail: "Cập nhật trạng thái thành công" });
      setStatusDialog(false);
      loadOrders();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Cập nhật thất bại" });
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await axios.delete(`${API_URL}/orders/admin/${selectedOrder.OrderID}`, config);
      toast.current?.show({ severity: "success", summary: "Thành công", detail: "Đã xóa đơn hàng" });
      setDeleteDialog(false);
      loadOrders();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Xóa đơn hàng thất bại" });
    }
  };

  // Logic lọc theo Tab
  const getFilteredOrders = () => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "PENDING") return orders.filter(o => o.Status.includes("PENDING") || o.Status.includes("AWAITING") || o.Status === "Chờ xử lý");
    if (activeTab === "SHIPPING") return orders.filter(o => o.Status === "SHIPPING" || o.Status === "Đang giao");
    if (activeTab === "COMPLETED") return orders.filter(o => o.Status === "DELIVERED" || o.Status === "Đã giao");
    return orders;
  };

  // Templates
  const customerBodyTemplate = (rowData) => {
    const isGuest = rowData.UserID === null;
    let name = rowData.FullName || "Khách Vãng Lai";
    let sub = rowData.PhoneNumber || rowData.Email || "";
    
    if (isGuest) {
      const parts = rowData.ShippingAddress.split(" - ");
      name = parts[0] || "Khách Vãng Lai";
      sub = parts[1] || "";
    }

    return (
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${isGuest ? 'bg-orange-100 text-orange-600' : 'bg-cyan-100 text-cyan-600'}`}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 leading-tight">{name}</span>
          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[150px]">{sub}</span>
        </div>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    const cfg = getStatusCfg(rowData.Status);
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border ${cfg.color}`}>
        <i className={`pi ${cfg.icon} text-[12px]`}></i>
        {cfg.label}
      </div>
    );
  };

  const amountBodyTemplate = (rowData) => {
    return (
      <span className="font-black text-slate-900 tracking-tighter">
        {Number(rowData.TotalAmount).toLocaleString("vi-VN")}₫
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex items-center gap-2 justify-end pr-2">
        <Button
          icon="pi pi-eye"
          rounded text
          className="w-9 h-9 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
          tooltip="Chi tiết"
          onClick={() => {
            setSelectedOrder(rowData);
            setDetailDialog(true);
          }}
        />
        <Button
          icon="pi pi-trash"
          rounded text
          className="w-9 h-9 text-slate-300 hover:text-red-500 hover:bg-red-50"
          tooltip="Xóa đơn"
          onClick={() => {
            setSelectedOrder(rowData);
            setDeleteDialog(true);
          }}
        />
        <Button
          icon="pi pi-ellipsis-v"
          rounded text
          className="w-9 h-9 text-slate-300"
          onClick={(e) => {
            setSelectedOrder(rowData);
          }}
        />
      </div>
    );
  };

  const statusOptions = [
    { label: "Chờ xử lý", value: "Chờ xử lý" },
    { label: "Đang giao", value: "Đang giao" },
    { label: "Đã giao", value: "Đã giao" },
    { label: "Đã hủy", value: "Đã hủy" }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-inter">
      <Toast ref={toast} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="px-3 py-1 bg-cyan-100 text-cyan-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3 inline-block">Management</span>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            Danh sách Đơn hàng
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Hệ thống xử lý và vận hành đơn hàng chuyên nghiệp.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
             <InputText
               value={globalFilterValue}
               onChange={onGlobalFilterChange}
               placeholder="Tìm mã ĐH, khách hàng..."
               className="pl-12 w-full md:w-72 h-12 rounded-2xl border-slate-100 focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold text-sm"
             />
           </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng đơn</p>
                <h3 className="text-3xl font-black text-slate-800">{orders.length}</h3>
             </div>
             <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shadow-inner"><i className="pi pi-shopping-bag text-2xl"></i></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Cần xử lý</p>
                <h3 className="text-3xl font-black text-slate-800">
                  {orders.filter(o => o.Status.includes("PENDING") || o.Status === "Chờ xử lý").length}
                </h3>
             </div>
             <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner"><i className="pi pi-clock text-2xl"></i></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Đang giao</p>
                <h3 className="text-3xl font-black text-slate-800">
                  {orders.filter(o => o.Status.includes("SHIPPING") || o.Status === "Đang giao").length}
                </h3>
             </div>
             <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner"><i className="pi pi-truck text-2xl"></i></div>
          </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
         {[
           { id: "ALL", label: "Tất cả", icon: "pi-list" },
           { id: "PENDING", label: "Chờ xử lý", icon: "pi-clock" },
           { id: "SHIPPING", label: "Đang giao", icon: "pi-truck" },
           { id: "COMPLETED", label: "Đã hoàn thành", icon: "pi-check-circle" }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border-2 
               ${activeTab === tab.id 
                 ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                 : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"}`}
           >
              <i className={`pi ${tab.icon} text-[14px]`}></i>
              {tab.label}
           </button>
         ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <DataTable
          value={getFilteredOrders()}
          paginator rows={8}
          loading={loading}
          dataKey="OrderID"
          filters={filters}
          globalFilterFields={["OrderID", "FullName", "ShippingAddress", "Email", "PhoneNumber"]}
          emptyMessage={<div className="py-10 text-center text-slate-400 font-bold">Không tìm thấy đơn hàng nào</div>}
          className="p-datatable-modern"
          rowHover
          responsiveLayout="stack"
          breakpoint="960px"
        >
          <Column field="OrderID" header="MÃ ĐH" sortable style={{ width: '12%' }}
            body={(r) => <span className="font-black text-cyan-600">#{r.OrderID}</span>} />
          <Column header="KHÁCH HÀNG" body={customerBodyTemplate} style={{ width: '28%' }} />
          <Column field="OrderDate" header="NGÀY ĐẶT" sortable 
             body={(r) => <span className="text-xs font-bold text-slate-500">{r.OrderDate ? new Date(r.OrderDate).toLocaleDateString("vi-VN") : "—"}</span>} />
          <Column field="TotalAmount" header="TỔNG TIỀN" sortable body={amountBodyTemplate} />
          <Column field="PaymentMethod" header="P.THỨC" sortable 
            body={(r) => <span className="text-[10px] font-black text-slate-400 border border-slate-100 px-2 py-1 rounded-lg uppercase tracking-wider">{r.PaymentMethod}</span>} />
          <Column header="TRẠNG THÁI" body={statusBodyTemplate} sortable field="Status" style={{ width: '18%' }} />
          <Column body={actionBodyTemplate} align="center" style={{ width: '10%' }} />
        </DataTable>
      </div>

      {/* Detail Dialog */}
      <Dialog 
        visible={detailDialog} 
        style={{ width: "90vw", maxWidth: "800px" }} 
        header="Chi tiết Đơn hàng" 
        modal 
        onHide={() => setDetailDialog(false)}
        className="detail-dialog"
        headerClassName="p-6 border-b border-slate-100"
        contentClassName="p-0"
      >
        {selectedOrder && (
          <div className="flex flex-col bg-slate-50/50 min-h-[500px]">
             {/* Info Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                   <h3 className="text-[10px] font-black text-cyan-600 uppercase tracking-[2px] mb-4">Thông tin khách</h3>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"><i className="pi pi-user"></i></div>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-700 uppercase">{selectedOrder.FullName || "Khách vãng lai"}</span>
                            <span className="text-[10px] font-bold text-slate-400">Tên khách hàng</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"><i className="pi pi-phone"></i></div>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-700">{selectedOrder.PhoneNumber || "—"}</span>
                            <span className="text-[10px] font-bold text-slate-400">Số điện thoại</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"><i className="pi pi-envelope"></i></div>
                         <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-slate-700 truncate">{selectedOrder.Email || "—"}</span>
                            <span className="text-[10px] font-bold text-slate-400">Email</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                   <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px] mb-4">Địa chỉ giao hàng</h3>
                   <div className="flex gap-3 items-start flex-1 min-h-[80px]">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mt-1 flex-shrink-0"><i className="pi pi-map-marker"></i></div>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                         {selectedOrder.ShippingAddress}
                      </p>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phương thức</span>
                      <span className="text-xs font-black text-slate-800">{selectedOrder.PaymentMethod}</span>
                   </div>
                </div>
             </div>

             {/* Items Section */}
             <div className="px-6 pb-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                   <div className="bg-slate-50 px-6 py-3 border-b border-slate-50">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Sản phẩm đã đặt</h3>
                   </div>
                   <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
                      {/* Giả định có API hoặc data OrderDetails ở đây, tạm thời dùng placeholder nếu chưa có */}
                      <div className="flex flex-col items-center justify-center py-10 opacity-30">
                         <i className="pi pi-box text-5xl mb-2"></i>
                         <p className="text-xs font-black tracking-widest uppercase">Mở rộng xem chi tiết Items...</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Action Section */}
             <div className="mt-auto bg-white p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái:</span>
                   {statusBodyTemplate(selectedOrder)}
                </div>
                <div className="flex gap-3">
                   {isSuperAdmin && (selectedOrder.Status.includes("PENDING") || selectedOrder.Status === "Chờ xử lý") && (
                      <Button 
                        label="Duyệt Đơn" 
                        severity="success" 
                        size="small" 
                        className="rounded-2xl font-black px-6 bg-emerald-500 border-none shadow-md shadow-emerald-500/20"
                        onClick={() => { setDetailDialog(false); setApproveDialog(true); }}
                      />
                   )}
                   {(isSuperAdmin || isOpsAdmin) && !selectedOrder.Status.includes("CANCEL") && (
                      <Button 
                        label="Cập nhật vận chuyển" 
                        severity="info" 
                        size="small" 
                        outlined 
                        className="rounded-2xl font-black px-6"
                        onClick={() => { setDetailDialog(false); setStatusDialog(true); }}
                      />
                   )}
                </div>
             </div>
          </div>
        )}
      </Dialog>

      {/* Approve Dialog */}
      <Dialog visible={approveDialog} style={{ width: "450px" }} header="Phê duyệt Đơn hàng" modal onHide={() => setApproveDialog(false)} className="shadow-2xl rounded-3xl overflow-hidden">
        <div className="flex flex-col gap-6 mt-4 p-2">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
             <p className="text-emerald-700 text-sm font-bold">Bạn đang phê duyệt đơn hàng <b className="text-lg">#{selectedOrder?.OrderID}</b></p>
             <p className="text-xs text-emerald-600/70 mt-1">Hành động này sẽ thông báo cho khách qua Email.</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Lý do từ chối (Chỉ điền nếu Hủy đơn)</label>
            <InputTextarea
               id="reason"
               value={rejectReason}
               onChange={(e) => setRejectReason(e.target.value)}
               rows={3}
               className="w-full border-slate-200 rounded-2xl focus:ring-emerald-500 text-sm font-medium"
               placeholder="Khách sẽ nhận email giải thích này..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button label="Hủy Bỏ Đơn" icon="pi pi-times" outlined severity="danger" onClick={() => handleApproveReject("REJECT")} className="rounded-2xl font-black px-6" />
            <Button label="Duyệt Ngay" icon="pi pi-check" severity="success" onClick={() => handleApproveReject("APPROVE")} className="rounded-2xl font-black bg-emerald-500 hover:bg-emerald-600 border-none px-8 shadow-lg shadow-emerald-500/30" />
          </div>
        </div>
      </Dialog>

      {/* Status Dialog */}
      <Dialog visible={statusDialog} style={{ width: "400px" }} header="Cập nhật Vận chuyển" modal onHide={() => setStatusDialog(false)} className="shadow-2xl rounded-3xl overflow-hidden">
        {/* ... (phần code cũ giữ nguyên) */}
        <div className="flex flex-col gap-6 mt-4 p-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-xs font-bold text-slate-500">Đơn hàng: <b className="text-slate-900">#{selectedOrder?.OrderID}</b></p>
             <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Trạng thái: {getStatusCfg(selectedOrder?.Status).label}</p>
          </div>
          <div className="flex flex-col gap-2">
             <label htmlFor="status" className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Chọn trạng thái mới</label>
             <Dropdown
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.value)}
                options={statusOptions}
                optionLabel="label"
                className="w-full rounded-2xl border-slate-200"
                placeholder="Ví dụ: Đang giao, Đã hoàn thành..."
             />
          </div>
          <div className="flex justify-end mt-4">
            <Button label="Lưu & Cập nhật" icon="pi pi-save" onClick={handleUpdateStatus} className="rounded-2xl font-black bg-cyan-600 hover:bg-cyan-700 border-none px-10 shadow-lg shadow-cyan-500/30" />
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog visible={deleteDialog} style={{ width: "400px" }} header="Xác nhận xóa" modal onHide={() => setDeleteDialog(false)} className="rounded-3xl">
        <div className="flex flex-col gap-4 p-2">
          <div className="flex items-center gap-4 text-red-500">
             <i className="pi pi-exclamation-triangle text-4xl"></i>
             <p className="font-bold">Bạn có chắc chắn muốn xóa đơn hàng <b>#{selectedOrder?.OrderID}</b>?</p>
          </div>
          <p className="text-sm text-slate-500">Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn dữ liệu đơn hàng.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button label="Hủy" text severity="secondary" onClick={() => setDeleteDialog(false)} className="font-bold" />
            <Button label="Xóa Vĩnh Viễn" severity="danger" onClick={handleDeleteOrder} className="rounded-2xl font-bold bg-red-500 border-none px-6" />
          </div>
        </div>
      </Dialog>

      <style jsx="true">{`
        .p-datatable-modern .p-datatable-thead > tr > th {
          background: transparent !important;
          color: #94a3b8 !important;
          font-weight: 900 !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
          padding: 1.5rem 1rem !important;
          border-bottom: 2px solid #f8fafc !important;
        }
        .p-datatable-modern .p-datatable-tbody > tr {
          transition: all 0.2s ease;
        }
        .p-datatable-modern .p-datatable-tbody > tr:hover {
          background: #f8fafc !important;
        }
        .p-datatable-modern .p-datatable-tbody > tr > td {
          padding: 1.25rem 1rem !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}
