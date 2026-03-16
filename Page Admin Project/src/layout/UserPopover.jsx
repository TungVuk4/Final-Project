import React, { useRef, useState, useEffect } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export default function UserPopover() {
  // Lấy dữ liệu user và hàm logout từ Auth Store đã kết nối API
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { t } = useTranslation();
  const op = useRef(null);
  const navigate = useNavigate();

  const [visibleProfile, setVisibleProfile] = useState(false);
  const [visibleSettings, setVisibleSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Xử lý chuyển đổi giao diện Sáng/Tối
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    op.current.hide();
    navigate("/login");
  };

  // Logic hiển thị Avatar: Ưu tiên ảnh từ DB, nếu không có dùng ảnh placeholder
  const defaultAvatar =
    "https://scontent-sin6-2.xx.fbcdn.net/v/t39.30808-1/456085326_1629435794569402_8130330138360519485_n.jpg?stp=cp6_dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=1d2534&_nc_ohc=HwFVWdP9l8AQ7kNvwF3JaQe&_nc_oc=Adm9idEanr5QPPtcwuR4GnjgCSoJo9E3CN3tSDHUEwZyn6kkmh4cm4mcRDiBNhU2urI&_nc_zt=24&_nc_ht=scontent-sin6-2.xx&_nc_gid=xOrX9XiWwZvsYrVhuahU4g&oh=00_AfqSm2L0ufs73HAXet3w6LhZOxVIksNRtXa_Qigh1RrD1g&oe=6963BB1C";
  const displayAvatar = user?.avatar || defaultAvatar;

  return (
    <div className="flex items-center">
      {/* NÚT AVATAR TRÊN TOPBAR */}
      <div
        className="relative flex items-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all active:scale-95"
        onClick={(e) => op.current.toggle(e)}
      >
        <img
          src={displayAvatar}
          alt="avatar"
          className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover"
        />
        <span
          className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-2 border-white rounded-full ${
            isDarkMode ? "bg-gray-500" : "bg-green-500"
          }`}
        ></span>
      </div>

      {/* MENU NHỎ KHI CLICK VÀO AVATAR */}
      <OverlayPanel
        ref={op}
        className="p-0 shadow-2xl border-none rounded-[20px] overflow-hidden mt-2 dark:bg-[#1C252E]"
      >
        <div className="w-[240px]">
          <div className="px-6 py-5 flex flex-col bg-gray-50/50 dark:bg-[#212B36]">
            <span className="font-bold text-[#212B36] dark:text-white text-[16px] truncate">
              {user?.name || "Người dùng"}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-[13px] truncate">
              {user?.email || "Chưa có email"}
            </span>
          </div>
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <div className="flex flex-col p-2 gap-1">
            <Button
              label={t("home")}
              icon="pi pi-home"
              className="p-button-text text-[#212B36] dark:text-gray-300 text-sm text-left px-4 py-3 border-none hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              onClick={() => {
                navigate("/");
                op.current.hide();
              }}
            />
            <Button
              label={t("profile")}
              icon="pi pi-user"
              className="p-button-text text-[#212B36] dark:text-gray-300 text-sm text-left px-4 py-3 border-none hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              onClick={() => {
                setVisibleProfile(true);
                op.current.hide();
              }}
            />
            <Button
              label={t("settings")}
              icon="pi pi-cog"
              className="p-button-text text-[#212B36] dark:text-gray-300 text-sm text-left px-4 py-3 border-none hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              onClick={() => {
                setVisibleSettings(true);
                op.current.hide();
              }}
            />
          </div>
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700"></div>
          <div className="p-2">
            <Button
              label={t("logout")}
              className="w-full p-button-text text-red-500 font-bold text-sm py-3 border-none hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
              onClick={handleLogout}
            />
          </div>
        </div>
      </OverlayPanel>

      {/* DIALOG THÔNG TIN HỒ SƠ CHI TIẾT */}
      <Dialog
        visible={visibleProfile}
        onHide={() => setVisibleProfile(false)}
        header="Hồ sơ"
        style={{ width: "480px" }}
        modal
        draggable={false}
        resizable={false}
        className="custom-profile-dialog"
        footer={
          <div className="flex justify-end items-center gap-4 px-6 pb-6 pt-2">
            <span
              className="text-[#637381] dark:text-gray-400 font-bold cursor-pointer hover:text-[#212B36] dark:hover:text-white transition-colors"
              onClick={() => setVisibleProfile(false)}
            >
              Đóng
            </span>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <img
            src={displayAvatar}
            className="w-24 h-24 rounded-full border-4 border-white dark:border-[#212B36] shadow-xl object-cover"
            alt="user-profile"
          />

          <div className="w-full flex flex-col gap-6 px-4">
            <div className="flex flex-col gap-2">
              <label className="font-extrabold text-[11px] text-[#637381] dark:text-[#919EAB] uppercase tracking-widest ml-1">
                HỌ TÊN
              </label>
              <InputText
                value={user?.name || ""}
                disabled
                className="p-3.5 border-none bg-gray-50 dark:bg-[#212B36] text-[#212B36] dark:text-white font-bold rounded-2xl w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-extrabold text-[11px] text-[#637381] dark:text-[#919EAB] uppercase tracking-widest ml-1">
                EMAIL
              </label>
              <InputText
                value={user?.email || user?.Email || ""}
                disabled
                className="p-3.5 border-none bg-gray-50 dark:bg-[#212B36] rounded-2xl w-full text-[#454F5B] dark:text-gray-400 font-bold italic"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-extrabold text-[11px] text-[#637381] dark:text-[#919EAB] uppercase tracking-widest ml-1">
                VAI TRÒ
              </label>
              <div className="p-3.5 bg-blue-50/50 dark:bg-[#00B8D914] text-[#006C9C] dark:text-[#00B8D9] font-extrabold rounded-2xl text-center text-sm uppercase border border-blue-100 dark:border-[#00B8D93D] tracking-widest">
                {user?.role || "GUEST"}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* DIALOG CÀI ĐẶT DARK MODE */}
      <Dialog
        visible={visibleSettings}
        onHide={() => setVisibleSettings(false)}
        header="Cài đặt"
        style={{ width: "400px" }}
        modal
        className="rounded-[32px] overflow-hidden dark:bg-[#161C24]"
      >
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-[#212B36] rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <i
                className={`pi ${
                  isDarkMode
                    ? "pi-moon text-yellow-400"
                    : "pi-sun text-orange-400"
                } text-xl`}
              ></i>
              <span className="font-bold dark:text-white">
                Chế độ tối (Dark Mode)
              </span>
            </div>
            <InputSwitch
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.value)}
            />
          </div>
        </div>
      </Dialog>

      <style jsx="true">{`
        .custom-profile-dialog .p-dialog-header {
          padding: 1.5rem 1.5rem 0.5rem 1.5rem !important;
          border: none !important;
          background: #ffffff !important;
        }
        .dark .custom-profile-dialog .p-dialog-header {
          background: #161c24 !important;
        }
        .custom-profile-dialog .p-dialog-header-title {
          font-size: 1.25rem !important;
          font-weight: 900 !important;
          color: #212b36 !important;
        }
        .dark .custom-profile-dialog .p-dialog-header-title {
          color: white !important;
        }
        .custom-profile-dialog .p-dialog-content {
          padding: 0 1.5rem 1rem 1.5rem !important;
          background: #ffffff !important;
        }
        .dark .custom-profile-dialog .p-dialog-content {
          background: #161c24 !important;
        }
        .dark .custom-profile-dialog {
          background-color: #161c24 !important;
          border: 1px solid #212b36 !important;
        }
        .p-dialog-mask {
          background-color: rgba(33, 43, 54, 0.6) !important;
          backdrop-filter: blur(8px);
        }
        .p-overlaypanel-content {
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}
