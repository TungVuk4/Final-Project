import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import { Tag } from "primereact/tag";

export default function Promotions() {
  const { t } = useTranslation();
  
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

  // Giả lập Dữ liệu (Do API chưa nối thực tế)
  useEffect(() => {
    setPromotions([
      { PromotionID: 1, Code: "SUMMER2026", DiscountPercent: 20, StartDate: new Date("2026-05-01"), EndDate: new Date("2026-08-31"), IsActive: true },
      { PromotionID: 2, Code: "NEWYEAR50", DiscountPercent: 50, StartDate: new Date("2025-12-25"), EndDate: new Date("2026-01-05"), IsActive: false },
      { PromotionID: 3, Code: "FREESHIPVIP", DiscountPercent: 100, StartDate: new Date("2026-01-01"), EndDate: new Date("2026-12-31"), IsActive: true },
    ]);
  }, []);

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
        <Button icon="pi pi-pencil" className="p-button-rounded bg-gradient-to-b from-blue-50 to-blue-100 text-blue-600 hover:from-blue-500 hover:to-blue-600 hover:text-white border-none shadow-sm hover:shadow-[0_8px_15px_rgba(59,130,246,0.3)] transition-all duration-300" aria-label="Edit" onClick={() => openEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded bg-gradient-to-b from-red-50 to-red-100 text-red-500 hover:from-red-500 hover:to-red-600 hover:text-white border-none shadow-sm hover:shadow-[0_8px_15px_rgba(239,68,68,0.3)] transition-all duration-300" aria-label="Delete" />
      </div>
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row justify-between items-center bg-transparent pb-6 pt-2">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 m-0 drop-shadow-sm tracking-tight mb-4 md:mb-0">Danh Sách Mã Chạy</h2>
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
        <Button
          label={t("create_campaign", "Tạo Chiến Dịch")} 
          icon="pi pi-plus" 
          className="bg-gradient-to-r from-gray-900 via-slate-800 to-black text-white rounded-2xl px-8 py-4 font-extrabold shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-gray-700/50" 
          onClick={openNew} 
        />
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
            <Button label={isEdit ? t("update_now_btn", "Cập Nhật Ngay") : t("publish_ticket_btn", "Phát Hành Ticket")} icon="pi pi-verified" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold px-8 py-3 rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 transition-all border-none" onClick={() => setDialogVisible(false)} />
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
      `}</style>
    </div>
  );
}
