import React, { useRef, useState, useEffect } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthStore, FIXED_ADMINS } from "../stores/auth";
import {
  RiShieldStarFill,
  RiStore2Fill,
  RiTruckFill,
  RiCheckFill,
  RiLoaderLine,
} from "react-icons/ri";

const ADMIN_ICONS = {
  "admin1@fashionstyle.com": { icon: <RiShieldStarFill size={16} />, color: "bg-violet-500", ring: "ring-violet-300" },
  "admin2@fashionstyle.com": { icon: <RiStore2Fill size={16} />, color: "bg-cyan-500", ring: "ring-cyan-300" },
  "admin3@fashionstyle.com": { icon: <RiTruckFill size={16} />, color: "bg-emerald-500", ring: "ring-emerald-300" },
};

const AVATAR_INITIALS = {
  "admin1@fashionstyle.com": "A1",
  "admin2@fashionstyle.com": "A2",
  "admin3@fashionstyle.com": "A3",
};

export default function UserPopover() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const switchAccount = useAuthStore((state) => state.switchAccount);
  const isSwitching = useAuthStore((state) => state.isSwitching);
  const { t } = useTranslation();
  const op = useRef(null);
  const navigate = useNavigate();

  const [visibleProfile, setVisibleProfile] = useState(false);
  const [visibleSettings, setVisibleSettings] = useState(false);
  const [switchingTo, setSwitchingTo] = useState(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  const handleLogout = () => {
    logout();
    if (op.current) op.current.hide();
    navigate("/login");
  };

  const handleSwitchAccount = async (email) => {
    if (email === user?.email || isSwitching) return;
    setSwitchingTo(email);
    const result = await switchAccount(email);
    setSwitchingTo(null);
    if (result.success) {
      if (op.current) op.current.hide();
      navigate("/");
    }
  };

  const currentEmail = user?.email || "";
  const currentInfo = ADMIN_ICONS[currentEmail];
  const otherAdmins = FIXED_ADMINS.filter((a) => a.email !== currentEmail);

  return (
    <div className="flex items-center">
      {/* NÚT AVATAR TRÊN TOPBAR */}
      <div
        className="relative flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100 cursor-pointer transition-all active:scale-95"
        onClick={(e) => op.current?.toggle(e)}
      >
        {/* Avatar với màu theo cấp độ */}
        <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white ${currentInfo?.color || "bg-gray-500"}`}>
          {AVATAR_INITIALS[currentEmail] || "AD"}
          {/* Dot online */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
        </div>
      </div>

      {/* OVERLAY PANEL */}
      <OverlayPanel
        ref={op}
        className="p-0 shadow-2xl border-none rounded-[20px] overflow-hidden mt-2"
      >
        <div className="w-[300px]">
          {/* Header — Info tài khoản hiện tại */}
          <div className={`px-5 py-4 bg-gradient-to-r ${FIXED_ADMINS.find(a => a.email === currentEmail)?.color || "from-gray-600 to-gray-700"} text-white`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm shadow-inner`}>
                {AVATAR_INITIALS[currentEmail] || "AD"}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{user?.name || "Admin"}</div>
                <div className="text-white/70 text-xs truncate">{user?.email || ""}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span className="text-white/60 text-[11px]">Đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACCOUNT SWITCHER */}
          {otherAdmins.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chuyển sang tài khoản</p>
              </div>
              <div className="px-3 pb-2 flex flex-col gap-1">
                {otherAdmins.map((admin) => {
                  const info = ADMIN_ICONS[admin.email];
                  const isLoading = switchingTo === admin.email;
                  return (
                    <button
                      key={admin.email}
                      onClick={() => handleSwitchAccount(admin.email)}
                      disabled={isSwitching}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
                        hover:bg-gray-100 disabled:opacity-60 disabled:cursor-wait`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${info?.color}`}>
                        {isLoading ? (
                          <RiLoaderLine className="animate-spin" size={16} />
                        ) : (
                          info?.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{admin.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">{admin.email}</div>
                      </div>
                      {!isLoading && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${info?.color} opacity-20`}>
                          <RiCheckFill size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-dashed border-gray-200 mx-3"></div>
            </>
          )}

          {/* Menu actions */}
          <div className="flex flex-col p-2 gap-0.5">
            <button
              onClick={() => { navigate("/"); op.current?.hide(); }}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-all font-medium"
            >
              <i className="pi pi-home text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span>Trang chủ</span>
            </button>
            <button
              onClick={() => { setVisibleProfile(true); op.current?.hide(); }}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-all font-medium"
            >
              <i className="pi pi-user text-gray-400 group-hover:text-violet-500 transition-colors" />
              <span>Hồ sơ</span>
            </button>
            <button
              onClick={() => { setVisibleSettings(true); op.current?.hide(); }}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-all font-medium"
            >
              <i className="pi pi-cog text-gray-400 group-hover:text-amber-500 transition-colors" />
              <span>Cài đặt</span>
            </button>
          </div>

          <div className="border-t border-dashed border-gray-200 mx-3"></div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 font-bold hover:bg-red-50 transition-all"
            >
              <i className="pi pi-sign-out" />
              Đăng xuất
            </button>
          </div>
        </div>
      </OverlayPanel>

      {/* DIALOG HỒ SƠ */}
      <Dialog
        visible={visibleProfile}
        onHide={() => setVisibleProfile(false)}
        header="Hồ sơ nhân sự"
        style={{ width: "480px" }}
        modal draggable={false} resizable={false}
        className="custom-profile-dialog"
        footer={
          <div className="flex justify-end px-6 pb-6 pt-2">
            <button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2 rounded-xl transition-all" 
              onClick={() => setVisibleProfile(false)}
            >
              Đóng
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-6 py-4 font-inter">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white ${currentInfo?.color || "bg-gray-500"}`}>
            {AVATAR_INITIALS[currentEmail] || "AD"}
          </div>
          <div className="w-full flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-2">
              <label className="font-extrabold text-[11px] text-gray-400 uppercase tracking-widest ml-1">HỌ TÊN</label>
              <InputText value={user?.name || ""} disabled className="p-3.5 border-none bg-gray-50 text-gray-800 font-bold rounded-2xl w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-extrabold text-[11px] text-gray-400 uppercase tracking-widest ml-1">EMAIL HỆ THỐNG</label>
              <InputText value={user?.email || ""} disabled className="p-3.5 border-none bg-gray-50 rounded-2xl w-full text-gray-500 font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-extrabold text-[11px] text-gray-400 uppercase tracking-widest ml-1">VAI TRÒ QUẢN TRỊ</label>
              <div className="p-3.5 bg-blue-50 text-blue-700 font-extrabold rounded-2xl text-center text-sm uppercase border border-blue-100 tracking-widest">
                {user?.role || "ADMIN"}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* DIALOG CÀI ĐẶT */}
      <Dialog
        visible={visibleSettings}
        onHide={() => setVisibleSettings(false)}
        header="Cài đặt hệ thống"
        style={{ width: "400px" }}
        modal className="rounded-[32px] overflow-hidden"
      >
        <div className="flex flex-col gap-6 py-4 font-inter">
          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <i className="pi pi-desktop text-blue-500 text-xl"></i>
              <span className="font-bold text-slate-700">Giao diện mặc định</span>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Premium Light</span>
          </div>
          <p className="text-center text-xs text-gray-400 font-medium px-4 leading-relaxed">
            Hệ thống đã được tối ưu hóa cho phong cách trắng sáng. Chế độ tối hiện không khả dụng để đảm bảo trải nghiệm thương hiệu tốt nhất.
          </p>
        </div>
      </Dialog>

      <style jsx="true">{`
        .custom-profile-dialog .p-dialog-header { padding: 1.5rem 1.5rem 0.5rem 1.5rem !important; border: none !important; background: #ffffff !important; }
        .custom-profile-dialog .p-dialog-content { padding: 0 1.5rem 1rem 1.5rem !important; background: #ffffff !important; }
        .p-overlaypanel-content { padding: 0 !important; }
        .p-dialog-mask { background-color: rgba(33, 43, 54, 0.4) !important; backdrop-filter: blur(4px); }
        .p-dialog-title { font-weight: 800 !important; color: #1e293b !important; }
      `}</style>
    </div>
  );
}
