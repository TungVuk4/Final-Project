import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useTranslation } from "react-i18next";
import { RiMenuFoldLine, RiMenuUnfoldLine, RiShoppingBagLine, RiStarLine, RiShieldLine, RiAlertLine } from "react-icons/ri";
import { MdMenu } from "react-icons/md";
import UserPopover from "./UserPopover";
import axios from "axios";
import { useAuthStore } from "../stores/auth";

const API_URL = "http://localhost:8080/api";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  return `${Math.floor(diff / 86400)}d trước`;
}

const CATEGORY_CONFIG = {
  order: { icon: <RiShoppingBagLine size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Đơn hàng" },
  review: { icon: <RiStarLine size={16} />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Đánh giá" },
  admin: { icon: <RiShieldLine size={16} />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "Admin" },
  system: { icon: <RiAlertLine size={16} />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Hệ thống" },
};

export default function Topbar({ isMobile, onToggle, collapsed }) {
  const { t, i18n } = useTranslation();
  const langMenu = useRef(null);
  const notifRef = useRef(null);
  const token = useAuthStore((state) => state.token);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !readIds.has(n.uniqueKey)).length);
      }
    } catch (err) {
      // Silent fail — không làm gián đoạn UI
    }
  }, [token]);

  // Polling mỗi 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside đóng panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map(n => n.uniqueKey));
    setReadIds(allIds);
    setUnreadCount(0);
  };

  const toggleIcon = isMobile ? (
    <MdMenu size={24} />
  ) : collapsed ? (
    <RiMenuUnfoldLine size={24} />
  ) : (
    <RiMenuFoldLine size={24} />
  );

  const languageItems = [
    {
      label: "English",
      template: () => (
        <div className="px-2 py-1">
          <button
            onClick={() => i18n.changeLanguage("en")}
            className={`w-full flex items-center px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all group ${
              i18n.language === "en" ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
          >
            <span className="w-6 h-4 mr-3 text-lg">🇺🇸</span>
            <span className={`text-sm font-semibold ${i18n.language === "en" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
              English
            </span>
            {i18n.language === "en" && <i className="pi pi-check ml-auto text-blue-500 text-xs" />}
          </button>
        </div>
      ),
    },
    {
      label: "Tiếng Việt",
      template: () => (
        <div className="px-2 py-1">
          <button
            onClick={() => i18n.changeLanguage("vi")}
            className={`w-full flex items-center px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all group ${
              i18n.language === "vi" ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
          >
            <span className="w-6 h-4 mr-3 text-lg">🇻🇳</span>
            <span className={`text-sm font-semibold ${i18n.language === "vi" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
              Tiếng Việt
            </span>
            {i18n.language === "vi" && <i className="pi pi-check ml-auto text-blue-500 text-xs" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <header className="h-16 bg-white/80 dark:bg-[#1C252E]/90 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-700/50 flex items-center justify-between px-4 sticky top-0 z-50 transition-colors shadow-sm">
      {/* Left — Toggle menu */}
      <div className="flex items-center">
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          {toggleIcon}
        </button>
      </div>

      {/* Right — Language, Notification, User */}
      <div className="flex items-center gap-1">
        {/* Language Switcher */}
        <Menu
          model={languageItems}
          popup
          ref={langMenu}
          className="w-52 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-2xl p-1.5 overflow-hidden mt-2 bg-white dark:bg-[#212B36]"
        />
        <button
          onClick={(e) => langMenu.current.toggle(e)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          title={i18n.language === "vi" ? "Tiếng Việt" : "English"}
        >
          <span className="text-lg">{i18n.language === "vi" ? "🇻🇳" : "🇺🇸"}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); if (!showNotif) fetchNotifications(); }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <i className="pi pi-bell text-lg" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-[#1C252E] animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotif && (
            <div
              className="absolute right-0 top-12 w-96 max-h-[520px] flex flex-col rounded-2xl overflow-hidden z-50 shadow-2xl border"
              style={{ background: "linear-gradient(135deg, #1a1a35 0%, #0f0f23 100%)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div>
                  <h3 className="text-white font-black text-base">{t("notifications")}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Đã đọc tất cả"}
                  </p>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {t("mark_all_read")}
                </button>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1 divide-y" style={{ divideColor: "rgba(255,255,255,0.04)" }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                      <i className="pi pi-bell text-2xl text-purple-400" />
                    </div>
                    <p className="text-gray-500 text-sm">{t("notification_empty")}</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const cfg = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.admin;
                    const isUnread = !readIds.has(n.uniqueKey);
                    return (
                      <div
                        key={n.uniqueKey}
                        onClick={() => {
                          setReadIds(prev => new Set([...prev, n.uniqueKey]));
                          setUnreadCount(prev => Math.max(0, prev - (isUnread ? 1 : 0)));
                        }}
                        className="flex gap-3 px-5 py-3.5 cursor-pointer transition-all hover:bg-white/5 relative"
                      >
                        {/* Unread dot */}
                        {isUnread && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        )}

                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center border ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-tight ${isUnread ? "text-white" : "text-gray-400"}`}>
                            {n.message}
                          </p>
                          {n.detail && (
                            <p className="text-gray-500 text-xs mt-0.5 truncate">{n.detail}</p>
                          )}
                          <p className="text-gray-600 text-[10px] mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Panel Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <button
                    onClick={fetchNotifications}
                    className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="pi pi-refresh text-xs" />
                    Làm mới thông báo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider + User */}
        <div className="ml-1 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center">
          <UserPopover />
        </div>
      </div>
    </header>
  );
}
