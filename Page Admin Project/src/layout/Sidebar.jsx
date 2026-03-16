import React from "react";
import { Tooltip } from "primereact/tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RiDashboardFill,
  RiUser3Fill,
  RiShieldUserFill,
  RiShoppingBag3Fill,
  RiLoginCircleLine,
} from "react-icons/ri";

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: t("dashboard"), icon: <RiDashboardFill size={22} />, path: "/" },
    { label: t("users"), icon: <RiUser3Fill size={22} />, path: "/users" },
    { label: t("roles"), icon: <RiShieldUserFill size={22} />, path: "/roles" },
    {
      label: t("product"),
      icon: <RiShoppingBag3Fill size={22} />,
      path: "/product",
    },
  ];

  // Tinh chỉnh màu sắc cho Active và Normal ở cả 2 chế độ
  const activeStyles =
    "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm";
  const normalStyles =
    "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200";

  return (
    <aside
      className={`
        transition-all duration-300
        bg-white dark:bg-[#1C252E] border-r border-gray-100 dark:border-gray-800
        flex flex-col h-screen sticky top-0
        ${collapsed ? "w-22" : "w-72"}
      `}
    >
      {/* Logo Section */}
      <div
        onClick={() => navigate("/")} // Thêm sự kiện click để về trang chủ
        className="h-20 flex items-center px-6 mb-2"
      >
        <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2.5 rounded-xl mr-3 flex items-center justify-center shadow-sm text-cyan-600 dark:text-cyan-400">
          <i className="pi pi-prime text-xl"></i>
        </div>
        {!collapsed && (
          <span className="font-extrabold text-2xl tracking-tight text-slate-800 dark:text-white transition-colors">
            JimVu
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="px-7 mb-3">
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Overview
          </span>
        </div>
      )}

      {/* Menu Content */}
      <div className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const itemKey = item.path.replace("/", "") || "dashboard";

          return (
            <div key={item.path} className="w-full">
              {collapsed && (
                <Tooltip
                  target={`.menu-icon-${itemKey}`}
                  content={item.label}
                  position="right"
                  className="dark:bg-gray-800"
                />
              )}
              <button
                onClick={() => navigate(item.path)}
                className={`
                  menu-icon-${itemKey}
                  w-full flex items-center p-3.5 rounded-xl transition-all duration-200
                  ${isActive(item.path) ? activeStyles : normalStyles}
                  ${collapsed ? "justify-center" : "px-4"}
                `}
              >
                <div className={`${!collapsed && "mr-4"} flex items-center`}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="text-[14px] transition-colors">
                    {item.label}
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Separator & Login Button */}
        <div
          className={`my-4 border-t border-gray-50 dark:border-gray-800 pt-4`}
        >
          <button
            onClick={() => navigate("/login")}
            className={`
              w-full flex items-center p-3.5 rounded-xl text-gray-500 dark:text-gray-400
              hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-all duration-200
              ${collapsed ? "justify-center" : "px-4"}
            `}
          >
            <div className={`${!collapsed && "mr-4"} flex items-center`}>
              <RiLoginCircleLine size={22} />
            </div>
            {!collapsed && (
              <span className="text-[14px] font-semibold transition-colors">
                {t("login")}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Footer Account Section */}
      <div className="p-4 mt-auto">
        <div
          className={`flex items-center bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800 rounded-2xl p-3 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-100 dark:shadow-none">
            JV
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 dark:text-gray-200 truncate transition-colors">
                JimVu
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter truncate transition-colors">
                Fashion JimVu
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
