import React from "react";
import { Tooltip } from "primereact/tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RiDashboardFill,
  RiUser3Fill,
  RiShieldUserFill,
  RiShoppingBag3Fill,
  RiPriceTag3Fill,
  RiFileList3Fill,
} from "react-icons/ri";
import { useAuthStore } from "../stores/auth";

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const currentEmail = user?.email || "";

  const isActive = (path) => location.pathname === path;

  // Phân quyền menu theo email
  // admin1: tất cả
  // admin2: chỉ /product + /roles
  // admin3: chỉ /users + /roles
  const ALL_MENU = [
    {
      label: t("dashboard"),
      icon: <RiDashboardFill size={22} />,
      path: "/",
      allowed: ["admin1@fashionstyle.com", "admin2@fashionstyle.com", "admin3@fashionstyle.com"],
    },
    {
      label: t("users"),
      icon: <RiUser3Fill size={22} />,
      path: "/users",
      allowed: ["admin1@fashionstyle.com", "admin3@fashionstyle.com"],
    },
    {
      label: t("roles"),
      icon: <RiShieldUserFill size={22} />,
      path: "/roles",
      allowed: ["admin1@fashionstyle.com", "admin2@fashionstyle.com", "admin3@fashionstyle.com"],
    },
    {
      label: t("product"),
      icon: <RiShoppingBag3Fill size={22} />,
      path: "/product",
      allowed: ["admin1@fashionstyle.com", "admin2@fashionstyle.com"],
    },
    {
      label: t("promotions_menu", "Khuyến Mãi"),
      icon: <RiPriceTag3Fill size={22} />,
      path: "/promotions",
      allowed: ["admin2@fashionstyle.com"],
    },
    {
      label: t("orders_menu", "Đơn hàng"),
      icon: <RiFileList3Fill size={22} />,
      path: "/orders",
      allowed: ["admin3@fashionstyle.com"],
    },
  ];

  const menuItems = ALL_MENU.filter((item) =>
    item.allowed.includes(currentEmail)
  );

  // Tinh chỉnh màu sắc cho Active và Normal (Chỉ giữ Light Mode Premium)
  const activeStyles =
    "bg-cyan-50 text-cyan-600 font-bold shadow-sm";
  const normalStyles =
    "text-gray-500 hover:bg-gray-50 hover:text-gray-800";

  return (
    <aside
      className={`
        transition-all duration-300
        bg-white border-r border-gray-100
        flex flex-col h-screen sticky top-0
        ${collapsed ? "w-22" : "w-72"}
      `}
    >
      {/* Logo Section */}
      <div
        onClick={() => navigate("/")} 
        className="h-20 flex items-center px-6 mb-2"
      >
        <div className="bg-cyan-50 p-2.5 rounded-xl mr-3 flex items-center justify-center shadow-sm text-cyan-600">
          <i className="pi pi-prime text-xl"></i>
        </div>
        {!collapsed && (
          <span className="font-extrabold text-2xl tracking-tight text-slate-800 transition-colors">
            JimVu
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="px-7 mb-3">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
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


      </div>

      {/* Footer Account Section */}
      <div className="p-4 mt-auto">
        <div
          className={`flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-3 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm flex-shrink-0 ${
            currentEmail === "admin1@fashionstyle.com" ? "bg-gradient-to-r from-violet-600 to-purple-700" :
            currentEmail === "admin2@fashionstyle.com" ? "bg-gradient-to-r from-cyan-500 to-blue-600" :
            currentEmail === "admin3@fashionstyle.com" ? "bg-gradient-to-r from-emerald-500 to-teal-600" :
            "bg-cyan-600"
          }`}>
            {currentEmail === "admin1@fashionstyle.com" ? "A1" :
             currentEmail === "admin2@fashionstyle.com" ? "A2" :
             currentEmail === "admin3@fashionstyle.com" ? "A3" : "JV"}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 truncate transition-colors">
                {currentEmail === "admin1@fashionstyle.com" ? t("role_admin1_name", "Admin Chính") : currentEmail === "admin2@fashionstyle.com" ? t("role_admin2_name", "Admin Kho") : currentEmail === "admin3@fashionstyle.com" ? t("role_admin3_name", "Admin Vận Hành") : user?.name || "Admin"}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate transition-colors">
                {currentEmail === "admin1@fashionstyle.com" ? t("role_admin1_desc", "Quản trị viên") :
                 currentEmail === "admin2@fashionstyle.com" ? t("role_admin2_desc", "Quản lý kho") :
                 currentEmail === "admin3@fashionstyle.com" ? t("role_admin3_desc", "Vận hành") : "Admin"}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
