import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { Toast } from "primereact/toast";

const API_URL = "http://localhost:8080/api";

export default function Promotions() {
  const { t } = useTranslation();
  
  const toastRef = useRef(null);
  const toast = {
    success: (msg) => toastRef.current?.show({ severity: "success", summary: "Thành công", detail: msg }),
    error: (msg) => toastRef.current?.show({ severity: "error", summary: "Lỗi", detail: msg })
  };
  
  const [promotions, setPromotions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPromo, setCurrentPromo] = useState({
    Code: "",
    DiscountPercent: 0,
    StartDate: null,
    EndDate: null,
    IsActive: true,
  });

  // Phân quyền
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  // Cho phép admin2 và bất kỳ ai có role Admin truy cập các tính năng này
  const isAdmin2 = currentUser?.email === "admin2@fashionstyle.com" || currentUser?.role === "Admin";

  // Data gán mã VIP
  const [vipDialogVisible, setVipDialogVisible] = useState(false);
  const [topUsers, setTopUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // Data sinh mã dùng 1 lần (Single-Use Promo Codes)
  const [codesDialogVisible, setCodesDialogVisible] = useState(false);
  const [selectedPromoForCodes, setSelectedPromoForCodes] = useState(null);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [codeQuantity, setCodeQuantity] = useState(1);
  const [codePrefix, setCodePrefix] = useState("");

  // Data gán mã cho VIP (VIP Voucher Assignment)
  const [vipCodes, setVipCodes] = useState([]);
  const [selectedVipCode, setSelectedVipCode] = useState(null);
  const [loadingVipCodes, setLoadingVipCodes] = useState(false);

  // Fetch Promotions
  const loadPromotions = async () => {
    try {
      const res = await axios.get(`${API_URL}/promotions/admin`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) {
        // Parse date strings to Date objects
        const formatted = res.data.data.map(p => ({
          ...p,
          StartDate: new Date(p.StartDate),
          EndDate: new Date(p.EndDate),
          IsActive: Boolean(p.IsActive)
        }));
        setPromotions(formatted);
      }
    } catch (e) { console.error("Lỗi lấy promotions", e); }
  };

  useEffect(() => { loadPromotions(); }, [token]);

  // Fetch Top Users
  const loadTopUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats/top-customers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) setTopUsers(res.data.data);
    } catch (e) {}
  };

  const openVipDialog = () => {
    loadTopUsers();
    setSelectedUser(null);
    setSelectedPromo(null);
    setSelectedVipCode(null);
    setVipCodes([]);
    setVipDialogVisible(true);
  };

  const loadVipCodes = async (promoId) => {
    if (!promoId) return;
    setLoadingVipCodes(true);
    try {
      const res = await axios.get(`${API_URL}/promotions/${promoId}/codes`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) {
        // Chỉ lấy mã chưa dùng (IsUsed = 0)
        const available = res.data.data.filter(c => !c.IsUsed);
        setVipCodes(available);
      }
    } catch (e) {
      console.error("Lỗi lấy danh sách mã con cho VIP:", e);
    } finally {
      setLoadingVipCodes(false);
    }
  };


  const openNew = () => {
    setCurrentPromo({ Code: "", DiscountPercent: 0, StartDate: null, EndDate: null, IsActive: true });
    setIsEdit(false);
    setDialogVisible(true);
  };

  const openEdit = (promo) => {
    setCurrentPromo({ ...promo });
    setIsEdit(true);
    setDialogVisible(true);
  };

  const deletePromo = async (id) => {
    if(!window.confirm(t("msg_confirm_delete_promo", "Bạn có chắc muốn xóa khuyến mãi này?"))) return;
    try {
      const res = await axios.delete(`${API_URL}/promotions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success(t("msg_promo_deleted", "Đã xóa mã khuyến mãi"));
        loadPromotions();
      }
    } catch (e) { toast.error(t("msg_error_delete", "Có lỗi xảy ra khi xóa.")); }
  };

  const savePromo = async () => {
    if (!currentPromo.Code || !currentPromo.DiscountPercent || !currentPromo.StartDate || !currentPromo.EndDate) {
      toast.error(t("msg_fill_info", "Vui lòng điền đủ thông tin."));
      return;
    }
    const payload = {
      ...currentPromo,
      // Chuyển Date object thành YYYY-MM-DD
      StartDate: currentPromo.StartDate.toISOString().split('T')[0],
      EndDate: currentPromo.EndDate.toISOString().split('T')[0],
      IsActive: currentPromo.IsActive ? 1 : 0
    };
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/promotions/${currentPromo.PromotionID}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t("msg_promo_updated", "Đã cập nhật mã khuyến mãi"));
      } else {
        await axios.post(`${API_URL}/promotions`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t("msg_promo_created", "Đã tạo mã khuyến mãi thành công"));
      }
      setDialogVisible(false);
      loadPromotions();
    } catch (e) {
      toast.error(e.response?.data?.message || t("msg_error_save", "Có lỗi xảy ra khi lưu mã."));
    }
  };

  const assignVipPromo = async () => {
    if (!selectedUser || !selectedPromo) {
      toast.error(t("msg_select_user_promo", "Vui lòng chọn đủ Khách hàng và Chiến dịch"));
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/promotions/assign-to-user`, {
        UserID: selectedUser.UserID,
        PromotionID: selectedPromo.PromotionID,
        CodeValue: selectedVipCode ? selectedVipCode.CodeValue : null // Gửi kèm mã cụ thể nếu có chọn
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.data?.success) {
        toast.success(res.data.message);
        setVipDialogVisible(false);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể gán mã khuyến mãi.");
    }
  };

  const loadGeneratedCodes = async (promoId) => {
    try {
      const res = await axios.get(`${API_URL}/promotions/${promoId}/codes`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) {
        setGeneratedCodes(res.data.data);
      }
    } catch (e) { toast.error(t("msg_fetch_code_error", "Có lỗi xảy ra khi lấy danh sách mã.")); }
  };

  const openCodesDialog = (promo) => {
    console.log("DEBUG: openCodesDialog called with:", promo);
    setSelectedPromoForCodes(promo);
    setCodePrefix(promo.Code);
    setCodeQuantity(10);
    loadGeneratedCodes(promo.PromotionID);
    setCodesDialogVisible(true);
    console.log("DEBUG: setCodesDialogVisible(true) executed");
  };

  const generateSingleUseCodes = async () => {
    if (!selectedPromoForCodes) return;
    try {
      const res = await axios.post(`${API_URL}/promotions/${selectedPromoForCodes.PromotionID}/generate-codes`, {
        quantity: codeQuantity,
        prefix: codePrefix
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.data?.success) {
        toast.success(res.data.message);
        loadGeneratedCodes(selectedPromoForCodes.PromotionID);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể sinh mã.");
    }
  };

  const statusBodyTemplate = (rowData) => {
    const isPast = rowData.EndDate < new Date();
    return rowData.IsActive && !isPast ? (
      <Tag value={t("status_running", "Đang chạy")} className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-extrabold px-4 py-1.5 rounded-full shadow-[0_4px_10px_rgba(16,185,129,0.3)] border border-emerald-300 transform hover:scale-105 transition-all" />
    ) : (
      <Tag value={t("status_stopped", "Đã Dừng/Hết Hạn")} className="bg-gradient-to-r from-slate-200 to-gray-300 text-gray-600 font-extrabold px-4 py-1.5 rounded-full shadow-inner border border-gray-200" />
    );
  };

  const codeBodyTemplate = (rowData) => (
    <div className="flex items-center gap-2">
      <i className="pi pi-ticket text-amber-500 text-xl drop-shadow-md"></i>
      <span className="font-black text-[#1C252E] tracking-widest bg-gradient-to-br from-amber-50 to-orange-100 px-4 py-1.5 rounded-lg shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05)] border border-amber-200/50">
        {rowData.Code}
      </span>
    </div>
  );

  const discountBodyTemplate = (rowData) => (
    <div className="flex flex-col">
      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-400 text-2xl drop-shadow-sm">
        -{rowData.DiscountPercent}%
      </span>
      <span className="text-[10px] text-gray-400 font-bold uppercase">{t("discount_amount_label", "Mức giảm")}</span>
    </div>
  );

  const dateBodyTemplate = (rowData, field) => {
    return <span className="text-gray-700 font-bold bg-slate-50 px-3 py-1 rounded-md shadow-sm border border-slate-100">{rowData[field].toLocaleDateString('vi-VN')}</span>;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-3 justify-center">
        <Button icon="pi pi-pencil" className="p-button-rounded bg-gradient-to-b from-blue-50 to-blue-100 text-blue-600 hover:from-blue-500 hover:to-blue-600 hover:text-white border-none shadow-sm hover:shadow-[0_8px_15px_rgba(59,130,246,0.3)] transition-all duration-300" aria-label="Edit" onClick={() => openEdit(rowData)} tooltip="Sửa" tooltipOptions={{ position: 'top' }} />
        <Button icon="pi pi-qrcode" className="p-button-rounded bg-gradient-to-b from-purple-50 to-purple-100 text-purple-600 hover:from-purple-500 hover:to-purple-600 hover:text-white border-none shadow-sm hover:shadow-[0_8px_15px_rgba(168,85,247,0.3)] transition-all duration-300" aria-label="Generate Codes" onClick={() => openCodesDialog(rowData)} tooltip="Mã dùng 1 lần" tooltipOptions={{ position: 'top' }} />
        <Button icon="pi pi-trash" className="p-button-rounded bg-gradient-to-b from-red-50 to-red-100 text-red-500 hover:from-red-500 hover:to-red-600 hover:text-white border-none shadow-sm hover:shadow-[0_8px_15px_rgba(239,68,68,0.3)] transition-all duration-300" aria-label="Delete" onClick={() => deletePromo(rowData.PromotionID)} tooltip="Xóa" tooltipOptions={{ position: 'top' }} />
      </div>
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row justify-between items-center bg-transparent pb-6 pt-2">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 m-0 drop-shadow-sm tracking-tight mb-4 md:mb-0">{t("running_codes_list", "Danh Sách Mã Chạy")}</h2>
      <span className="p-input-icon-left w-full md:w-auto relative group">
        <i className="pi pi-search text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder={t("search_code_placeholder", "Tìm mã Code...")}
          className="w-full md:w-80 pl-11 py-3 bg-white/70 backdrop-blur-md rounded-2xl border-2 border-transparent focus:border-blue-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 font-medium"
        />
      </span>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-[#F4F6F8] to-[#E2E8F0] min-h-screen font-sans relative overflow-hidden">
      <Toast ref={toastRef} />
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between flex-wrap items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-slate-600 tracking-tight drop-shadow-sm">
            {t("promotions_title_big", "Quản Lý Khuyến Mãi")}
          </h1>
          <p className="text-gray-500 mt-2 font-semibold italic flex items-center gap-2">
            <i className="pi pi-sparkles text-amber-500"></i>
            {t("promotions_desc_big", "Tạo và thiết lập chiến dịch Voucher siêu hấp dẫn")}
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button
            label={t("assign_vip", "Gán Mã Cho VIP")} 
            icon="pi pi-gift" 
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl px-6 py-4 font-extrabold shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.4)] transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-orange-400" 
            onClick={openVipDialog} 
          />
          <Button
            label={t("create_campaign", "Tạo Chiến Dịch")} 
            icon="pi pi-plus" 
            className="bg-gradient-to-r from-gray-900 via-slate-800 to-black text-white rounded-2xl px-6 py-4 font-extrabold shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-gray-700/50" 
            onClick={openNew} 
          />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 overflow-hidden relative p-2 md:p-6 mb-16">
        <DataTable
          value={promotions}
          paginator
          rows={10}
          dataKey="PromotionID"
          globalFilter={globalFilter}
          header={header}
          emptyMessage={t("empty_promotions", "Chưa có chương trình khuyến mãi nào được tạo.")}
          className="custom-table"
          rowHover
        >
          <Column field="Code" header={t("ticket_code", "MÃ TICKET")} body={codeBodyTemplate} sortable style={{ minWidth: '14rem' }} />
          <Column field="DiscountPercent" header={t("discount_percent", "MỨC GIẢM")} body={discountBodyTemplate} sortable style={{ minWidth: '10rem' }} />
          <Column header={t("start_date", "NGÀY BẮT ĐẦU")} body={(r) => dateBodyTemplate(r, "StartDate")} sortable field="StartDate" style={{ minWidth: '12rem' }} />
          <Column header={t("end_date", "NGÀY KẾT THÚC")} body={(r) => dateBodyTemplate(r, "EndDate")} sortable field="EndDate" style={{ minWidth: '12rem' }} />
          <Column field="IsActive" header={t("status", "TRẠNG THÁI")} body={statusBodyTemplate} sortable align="center" style={{ minWidth: '12rem' }} />
          <Column header={t("actions", "THAO TÁC")} body={actionBodyTemplate} exportable={false} align="center" style={{ minWidth: '10rem' }} />
        </DataTable>
      </div>

      {/* Dialog Thêm/Sửa */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '90vw', maxWidth: '560px' }}
        header={<span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">{isEdit ? t("edit_ticket", "✨ Cập Nhật Ticket") : t("new_ticket", "🎟 Tạo Ticket Mới")}</span>}
        modal
        className="rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/20"
        contentClassName="bg-gradient-to-br from-white to-gray-50/80"
        headerClassName="bg-white/80 backdrop-blur-sm border-b border-gray-100 p-6"
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="p-5 bg-white/50 backdrop-blur-md border-t border-gray-100 flex justify-end gap-3 rounded-b-[32px]">
            <Button label={t("cancel_btn", "Hủy Bỏ")} className="p-button-text text-gray-400 font-extrabold hover:bg-gray-100 rounded-xl px-4 py-3 transition-colors" onClick={() => setDialogVisible(false)} />
            <Button label={isEdit ? t("update_now_btn", "Cập Nhật Ngay") : t("publish_ticket_btn", "Phát Hành Ticket")} icon="pi pi-verified" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold px-8 py-3 rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 transition-all border-none" onClick={savePromo} />
          </div>
        }
      >
        <div className="flex flex-col gap-8 py-6 px-2">
          <div className="flex flex-col gap-3 relative group">
            <label className="font-extrabold text-[13px] text-gray-500 uppercase tracking-widest pl-1">{t("coupon_code_label", "🏷 Mã Coupon Đặc Biệt")}</label>
            <div className="relative shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] rounded-2xl transition-all duration-300 group-focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]">
              <i className="pi pi-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"></i>
              <InputText
                value={currentPromo.Code}
                onChange={(e) => setCurrentPromo({ ...currentPromo, Code: e.target.value.toUpperCase() })}
                className="w-full pl-12 py-4 bg-white/80 backdrop-blur border-2 border-gray-100 hover:border-indigo-300 focus:border-indigo-500 rounded-2xl font-black uppercase tracking-[0.2em] text-xl text-indigo-900 transition-colors placeholder:text-gray-300 placeholder:font-medium placeholder:tracking-normal"
                placeholder={t("eg_megasale", "VD: MEGASALE")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 group">
            <label className="font-extrabold text-[13px] text-gray-500 uppercase tracking-widest pl-1">{t("discount_percent_label", "✂️ Số % Sẽ Giảm")}</label>
            <div className="relative shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] rounded-2xl transition-all duration-300 group-focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]">
              <InputNumber
                value={currentPromo.DiscountPercent}
                onValueChange={(e) => setCurrentPromo({ ...currentPromo, DiscountPercent: e.value })}
                suffix={t("percent_sale", " % SALE")}
                min={0} max={100}
                className="w-full"
                inputClassName="w-full py-4 pl-6 bg-white/80 backdrop-blur border-2 border-gray-100 hover:border-red-300 focus:border-red-500 rounded-2xl font-black text-2xl text-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex flex-col gap-3 flex-1">
              <label className="font-extrabold text-[13px] text-gray-500 uppercase tracking-widest pl-1">{t("start_label", "⏳ Khởi Đầu")}</label>
              <Calendar
                value={currentPromo.StartDate}
                onChange={(e) => setCurrentPromo({ ...currentPromo, StartDate: e.value })}
                dateFormat="dd/mm/yy"
                className="w-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] rounded-2xl"
                inputClassName="py-4 pl-4 bg-white/80 font-bold text-gray-800 border-2 border-gray-100 hover:border-blue-300 focus:border-blue-500 rounded-l-2xl transition-colors"
                showIcon
              />
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <label className="font-extrabold text-[13px] text-gray-500 uppercase tracking-widest pl-1">{t("end_label", "🛑 Kết Thúc")}</label>
              <Calendar
                value={currentPromo.EndDate}
                onChange={(e) => setCurrentPromo({ ...currentPromo, EndDate: e.value })}
                dateFormat="dd/mm/yy"
                className="w-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] rounded-2xl"
                inputClassName="py-4 pl-4 bg-white/80 font-bold text-gray-800 border-2 border-gray-100 hover:border-blue-300 focus:border-blue-500 rounded-l-2xl transition-colors"
                showIcon
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl mt-4 border border-blue-100/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-[64px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative z-10">
              <p className="font-black text-lg text-indigo-900 mb-1">{t("unlock_usage", "Mở Khóa Sử Dụng?")}</p>
              <p className="text-sm text-indigo-600/70 font-medium">{t("turn_on_desc", "Bật công tắc để chiến dịch chạy ngay lập tức")}</p>
            </div>
            <InputSwitch checked={currentPromo.IsActive} onChange={(e) => setCurrentPromo({ ...currentPromo, IsActive: e.value })} className="relative z-10 scale-125 origin-right drop-shadow-md" />
          </div>
        </div>
      </Dialog>

      {/* Dialog Gán Mã Cho VIP - PREMIUM REDESIGN */}
      <Dialog
        visible={vipDialogVisible}
        style={{ width: '90vw', maxWidth: '520px' }}
        header={<div className="flex items-center gap-4 py-1">
          <div className="w-12 h-12 rounded-[20px] bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-100 ring-4 ring-orange-50/50">
            <i className="pi pi-gift text-2xl text-white"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl text-slate-800 tracking-tight leading-none mb-1">{t("vip_gift_title", "Tặng Quà VIP")}</span>
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">{t("vip_gift_subtitle", "Tri ân khách hàng thân thiết")}</span>
          </div>
        </div>}
        modal
        className="rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] border-none"
        contentClassName="bg-[#F8FAFC]/95 backdrop-blur-xl p-8"
        headerClassName="bg-white/80 backdrop-blur-md border-b border-slate-100 p-8"
        onHide={() => setVipDialogVisible(false)}
        footer={
          <div className="px-8 pb-8 pt-2 bg-[#F8FAFC]/95 flex justify-end gap-3 border-none">
            <Button 
                label={t("cancel", "Hủy")} 
                className="p-button-text text-slate-400 font-black text-xs tracking-widest hover:text-slate-600 active:scale-95 transition-all" 
                onClick={() => setVipDialogVisible(false)} 
            />
            <Button 
                label={t("send_gift_now", "GỬI TẶNG NGAY")} 
                icon="pi pi-send" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 border-none rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all text-sm tracking-tight" 
                onClick={assignVipPromo} 
            />
          </div>
        }
      >
        <div className="flex flex-col gap-8">
          <p className="text-slate-500 text-[13px] leading-relaxed font-medium bg-white/50 p-5 rounded-2xl border border-slate-100 shadow-sm">
            {t("vip_gift_desc_1", "Chọn 1 khách hàng từ ")}<span className="text-indigo-600 font-bold">{t("vip_gift_desc_top", "Top mua hàng")}</span>{t("vip_gift_desc_2", " và một mã ")}<span className="text-orange-600 font-bold">{t("vip_gift_desc_voucher", "Voucher Đặc quyền")}</span>{t("vip_gift_desc_3", " để gửi trực tiếp cho họ.")}
          </p>
          
          {/* User Selection */}
          <div className="flex flex-col gap-2.5">
            <label className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] ml-1">
              <i className="pi pi-user mr-1"></i> {t("gift_recipient", "Đối tượng nhận quà")}
            </label>
            <Dropdown 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.value)} 
              options={topUsers} 
              optionLabel="FullName" 
              placeholder={t("search_vip", "Tìm kiếm khách hàng VIP...")} 
              filter 
              className="premium-dropdown w-full"
              panelClassName="premium-dropdown-panel"
              itemTemplate={(user) => (
                <div className="flex items-center gap-4 py-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm">
                    {user.FullName.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-slate-700 leading-tight">{user.FullName}</span>
                    <span className="text-[10px] text-slate-400">{user.Email}</span>
                  </div>
                  <div className="bg-indigo-50 px-2 py-1 rounded-lg text-[10px] font-black text-indigo-600 whitespace-nowrap">
                    {user.orderCount} {t("orders_count", "đơn")}
                  </div>
                </div>
              )}
              valueTemplate={(user, props) => {
                if (!user) return <span className="text-slate-400 font-bold text-sm tracking-tight">{props.placeholder}</span>;
                return (
                  <div className="flex items-center gap-2 font-black text-slate-700 text-sm tracking-tight">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] text-indigo-500">
                      {user.FullName.charAt(0)}
                    </div>
                    {user.FullName} ({user.orderCount} {t("orders_count", "đơn")})
                  </div>
                );
              }}
            />
          </div>

          {/* Promo Selection */}
          <div className="flex flex-col gap-2.5">
            <label className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] ml-1">
              <i className="pi pi-ticket mr-1"></i> {t("voucher_type", "Loại Voucher gán tặng")}
            </label>
            <Dropdown 
              value={selectedPromo} 
              onChange={(e) => {
                setSelectedPromo(e.value);
                setSelectedVipCode(null);
                if (e.value) loadVipCodes(e.value.PromotionID);
              }} 
              options={promotions.filter(p => p.IsActive)} 
              optionLabel="Code" 
              placeholder={t("select_promo_code", "Chọn mã khuyến mãi...")} 
              className="premium-dropdown w-full"
              panelClassName="premium-dropdown-panel"
              itemTemplate={(promo) => (
                <div className="flex items-center justify-between gap-4 py-1">
                  <div className="flex flex-col">
                    <span className="font-black text-indigo-600 tracking-widest text-sm">{promo.Code}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{promo.Description || t("special_promo", "Khuyến mãi đặc biệt")}</span>
                  </div>
                  <div className="bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-black text-rose-500 border border-rose-100/50">
                    -{promo.DiscountPercent}%
                  </div>
                </div>
              )}
              valueTemplate={(promo, props) => {
                if (!promo) return <span className="text-slate-400 font-bold text-sm tracking-tight">{props.placeholder}</span>;
                return (
                  <div className="flex items-center gap-2 font-black text-indigo-700 text-sm tracking-widest">
                    <i className="pi pi-ticket text-rose-500"></i> {promo.Code} (-{promo.DiscountPercent}%)
                  </div>
                );
              }}
            />
          </div>

          {/* Specific Code Selection (Optional) - ONLY SHOW IF VIP CODES EXIST */}
          {selectedPromo && vipCodes.length > 0 && (
            <div className="flex flex-col gap-2.5 animate-fade-in">
              <label className="font-black text-[10px] text-amber-500 uppercase tracking-[0.2em] ml-1">
                <i className="pi pi-star-fill mr-1"></i> {t("specific_code_opt", "Chọn mã cụ thể (Tùy chọn)")}
              </label>
              <Dropdown 
                value={selectedVipCode} 
                onChange={(e) => setSelectedVipCode(e.value)} 
                options={vipCodes} 
                optionLabel="CodeValue" 
                placeholder={t("select_specific_code", "Chọn một mã Ticket riêng...")} 
                filter 
                loading={loadingVipCodes}
                className="premium-dropdown w-full border-amber-200 bg-amber-50/20"
                panelClassName="premium-dropdown-panel"
                itemTemplate={(code) => (
                  <div className="flex items-center gap-2 font-black text-indigo-600 tracking-widest text-xs">
                    <i className="pi pi-ticket"></i> {code.CodeValue}
                  </div>
                )}
                valueTemplate={(code, props) => {
                  if (!code) return <span className="text-amber-400/60 font-medium text-sm italic">{props.placeholder}</span>;
                  return <span className="font-black text-indigo-700 tracking-widest text-sm">{code.CodeValue}</span>;
                }}
              />
              <p className="text-[10px] text-amber-600 font-bold italic ml-1">{t("specific_code_note", "* Nếu bỏ trống, hệ thống sẽ tự động gán chiến dịch chung.")}</p>
            </div>
          )}
        </div>
      </Dialog>

      {/* Dialog Kho Mã Random (Single-Use Codes) - ADVANCED CUSTOMIZATION */}
      <Dialog
        visible={codesDialogVisible}
        style={{ width: '95vw', maxWidth: '720px' }}
        header={<div className="flex items-center gap-5 w-full pr-8">
          <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-200">
            <i className="pi pi-qrcode text-3xl text-white"></i>
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-black text-2xl text-slate-800 tracking-tight leading-none mb-1.5 pt-1">{t("random_code_vault", "Kho Mã Random")}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{t("single_use_system", "Hệ thống phát hành mã dùng 1 lần")}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] font-bold text-slate-400">{selectedPromoForCodes?.Code}</span>
            </div>
          </div>
        </div>}
        modal
        className="rounded-[48px] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.2)] border-none"
        contentClassName="bg-[#F8FAFC] p-0 overflow-hidden flex flex-col"
        headerClassName="bg-white border-b border-slate-100 p-8"
        onHide={() => setCodesDialogVisible(false)}
      >
        {/* Fixed Header: Quick Stats & Form */}
        <div className="bg-white p-8 pb-10 border-b border-slate-100/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] z-10">
          <div className="flex flex-col gap-8">
            {/* Usage Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("total_codes", "Tổng số mã")}</p>
                <p className="text-xl font-black text-slate-700">{generatedCodes.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{t("used_codes", "Đã dùng")}</p>
                <p className="text-xl font-black text-emerald-600">{generatedCodes.filter(c => c.IsUsed).length}</p>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t("available_codes", "Khả dụng")}</p>
                <p className="text-xl font-black text-indigo-600">{generatedCodes.filter(c => !c.IsUsed).length}</p>
              </div>
            </div>

            {/* Quick Create Form */}
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-5">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1.5 ml-1">
                  <i className="pi pi-pencil text-[10px]"></i> {t("code_prefix", "Tiền tố mã (Prefix)")}
                </label>
                <InputText 
                  value={codePrefix} 
                  onChange={(e) => setCodePrefix(e.target.value)} 
                  placeholder={t("eg_prefix", "VD: KM-")}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-[20px] font-black text-slate-700 focus:border-indigo-400 focus:bg-white transition-all shadow-inner" 
                />
              </div>

              <div className="w-full md:w-36 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1.5 ml-1">
                  <i className="pi pi-plus text-[10px]"></i> {t("quantity", "Số lượng")}
                </label>
                <InputNumber 
                  value={codeQuantity} 
                  onValueChange={(e) => setCodeQuantity(e.value)} 
                  min={1} max={500} 
                  showButtons 
                  buttonLayout="horizontal"
                  className="w-full h-[52px]" 
                  inputClassName="bg-slate-50 text-center font-black text-indigo-600 border-2 border-slate-100 rounded-l-[20px] rounded-r-none w-full"
                  incrementButtonClassName="bg-slate-100 border-y-2 border-r-2 border-slate-100 text-slate-600 rounded-r-[20px]"
                  decrementButtonClassName="bg-slate-100 border-y-2 border-l-2 border-slate-100 text-slate-600 rounded-l-[20px]"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                />
              </div>

              <Button 
                label={t("generate_codes", "TẠO MÃ")} 
                icon="pi pi-bolt" 
                className="w-full md:w-auto px-10 h-[52px] bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[20px] border-none shadow-lg shadow-indigo-100 transform active:scale-95 transition-all" 
                onClick={generateSingleUseCodes} 
              />
            </div>
          </div>
        </div>

        {/* Scrolling Section: Table List */}
        <div className="flex-1 overflow-y-auto p-8 pt-6 max-h-[50vh] scrollbar-thin scrollbar-thumb-slate-200">
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <DataTable 
              value={generatedCodes} 
              paginator 
              rows={6} 
              emptyMessage={<div className="py-20 flex flex-col items-center gap-5 text-slate-300">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-4xl mt-4">
                  <i className="pi pi-ticket"></i>
                </div>
                <span className="font-bold text-sm tracking-tight text-slate-400">{t("no_sub_codes", "Chiến dịch này chưa phát hành mã con nào.")}</span>
              </div>}
              className="random-codes-table no-border-table" 
              rowHover
              responsiveLayout="scroll"
            >
              <Column field="CodeValue" header={t("random_ticket_code", "MÃ TICKET RANDOM")} body={(r) => (
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-700 tracking-[0.1em] text-sm select-all bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{r.CodeValue}</span>
                </div>
              )} />
              <Column field="IsUsed" header={t("status", "TRẠNG THÁI")} body={(r) => (
                r.IsUsed ? (
                  <div className="inline-flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t("code_used", "Đã dùng")}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t("code_ready", "Sẵn sàng")}</span>
                  </div>
                )
              )} align="center" />
              <Column field="CreatedAt" header={t("created_at", "NGÀY TẠO")} body={(r) => (
                <span className="text-slate-400 font-black text-[11px] uppercase tracking-tighter">{new Date(r.CreatedAt).toLocaleDateString('vi-VN')}</span>
              )} align="right" />
            </DataTable>
          </div>
        </div>
      </Dialog>

      <style jsx="true">{`
        .custom-table .p-datatable-header {
          background: transparent;
          border-bottom: 2px solid rgba(241, 245, 249, 0.8);
          padding-bottom: 1rem;
        }
        .custom-table .p-datatable-thead > tr > th {
          background: rgba(248, 250, 252, 0.6);
          backdrop-filter: blur(10px);
          color: #475569;
          font-weight: 900;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-bottom: 2px solid #E2E8F0;
          padding: 1.5rem 1rem;
        }
        .custom-table .p-datatable-tbody > tr {
          transition: all 0.2s ease;
        }
        .custom-table .p-datatable-tbody > tr:hover {
          background: rgba(241, 245, 249, 0.8) !important;
          transform: scale(1.002);
          box-shadow: inset 4px 0 0 0 #3b82f6;
        }
        .custom-table .p-datatable-tbody > tr > td {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          color: #0F172A;
          font-weight: 600;
        }
        .p-inputswitch.p-inputswitch-checked .p-inputswitch-slider {
          background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
        }
        .p-calendar .p-button {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 2px solid #f1f5f9;
          color: #64748b;
          border-left: none;
          border-radius: 0 1rem 1rem 0;
          transition: all 0.3s ease;
        }
        .p-calendar:hover .p-button {
          background: #e2e8f0;
          color: #3b82f6;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .random-codes-table .p-datatable-thead > tr > th {
          background: #F1F5F9 !important;
          color: #64748B !important;
          font-weight: 900 !important;
          font-size: 10px !important;
          letter-spacing: 0.15em !important;
          padding: 1.25rem 1rem !important;
          border: none !important;
        }
        .random-codes-table .p-datatable-tbody > tr > td {
          border-bottom: 1px solid #F1F5F9;
          padding: 1rem !important;
        }
        .premium-dropdown {
          background: #f8fafc !important;
          border: 2px solid #f1f5f9 !important;
          border-radius: 20px !important;
          padding: 0.5rem 0.75rem !important;
          transition: all 0.3s ease !important;
        }
        .premium-dropdown:hover {
          border-color: #e2e8f0 !important;
          background: #fff !important;
        }
        .premium-dropdown.p-inputwrapper-focus {
          border-color: #6366f1 !important;
          background: #fff !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
        }
        .premium-dropdown-panel {
          border-radius: 24px !important;
          border: none !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1) !important;
          padding: 0.5rem !important;
          margin-top: 0.5rem !important;
          overflow: hidden !important;
        }
        .premium-dropdown-panel .p-dropdown-items {
          padding: 0.5rem !important;
        }
        .premium-dropdown-panel .p-dropdown-item {
          border-radius: 14px !important;
          margin-bottom: 0.25rem !important;
          padding: 0.75rem 1rem !important;
          transition: all 0.2s ease !important;
        }
        .premium-dropdown-panel .p-dropdown-item.p-highlight {
          background: #f5f3ff !important;
          color: #6366f1 !important;
        }
      `}</style>
    </div>
  );
}
