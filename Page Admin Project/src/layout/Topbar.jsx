import React, { useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { Badge } from "primereact/badge";
import { useTranslation } from "react-i18next";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";
import { MdMenu } from "react-icons/md";
import UserPopover from "./UserPopover";

export default function Topbar({ isMobile, onToggle, collapsed }) {
  const { t, i18n } = useTranslation();
  const langMenu = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
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
      code: "en",
      template: () => (
        <div className="px-2 py-1">
          <button
            onClick={() => changeLanguage("en")}
            className={`w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg transition-all group ${
              i18n.language === "en" ? "bg-cyan-50" : ""
            }`}
          >
            <img
              src="https://tse3.mm.bing.net/th/id/OIP.Vl31Jsp3HIaUHMcHXW85NgHaE8?pid=Api&P=0&h=180"
              alt="en"
              className="w-6 h-4 mr-3 object-cover rounded-sm shadow-sm"
            />
            <span
              className={`text-sm group-hover:text-cyan-600 ${
                i18n.language === "en"
                  ? "font-bold text-cyan-600"
                  : "text-gray-700"
              }`}
            >
              English
            </span>
          </button>
        </div>
      ),
    },
    {
      label: "Tiếng Việt",
      code: "vi",
      template: () => (
        <div className="px-2 py-1">
          <button
            onClick={() => changeLanguage("vi")}
            className={`w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg transition-all group ${
              i18n.language === "vi" ? "bg-cyan-50" : ""
            }`}
          >
            <img
              src="http://tse2.mm.bing.net/th/id/OIP.SKfx68RFKkcBBF0JF9RqPwHaEK?pid=Api&P=0&h=180"
              alt="vi"
              className="w-6 h-4 mr-3 object-cover rounded-sm shadow-sm"
            />
            <span
              className={`text-sm group-hover:text-cyan-600 ${
                i18n.language === "vi"
                  ? "font-bold text-cyan-600"
                  : "text-gray-700"
              }`}
            >
              Tiếng Việt
            </span>
          </button>
        </div>
      ),
    },
  ];

  return (
    /* THAY ĐỔI: Thêm dark:bg-[#1C252E] để Header tối đi khi bật Dark Mode */
    <header className="h-16 bg-white/80 dark:bg-[#1C252E]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-50 transition-colors">
      <div className="flex items-center gap-2">
        <Button
          icon={toggleIcon}
          text
          rounded
          onClick={onToggle}
          /* THAY ĐỔI: text-gray-600 dark:text-gray-400 để icon sáng lên trong nền tối */
          className="text-gray-600 dark:text-gray-400 focus:shadow-none hover:bg-gray-100 dark:hover:bg-gray-800"
        />

        {/* THAY ĐỔI: ÉP CỨNG bg-gray-100 và focus-within:bg-white để thanh tìm kiếm LUÔN SÁNG */}
        <div className="hidden md:flex items-center ml-2 bg-gray-100 px-3 py-1.5 rounded-xl border border-transparent focus-within:ring-1 focus-within:ring-cyan-400 transition-all focus-within:bg-white shadow-inner">
          <i className="pi pi-search text-gray-400 mr-2 text-sm" />
          <InputText
            placeholder={t("search")}
            /* ÉP CỨNG text-gray-700 để chữ không bao giờ bị trắng trong nền tối */
            className="p-inputtext-sm border-none bg-transparent focus:ring-0 w-48 lg:w-64 p-0 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Menu
          model={languageItems}
          popup
          ref={langMenu}
          className="w-48 border-none shadow-2xl rounded-2xl p-0 overflow-hidden mt-2 dark:bg-[#212B36]"
        />
        <Button
          icon="pi pi-globe"
          text
          rounded
          className="text-gray-600 dark:text-gray-400 focus:shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 w-10 h-10"
          onClick={(e) => langMenu.current.toggle(e)}
        />

        <div className="relative">
          <Button
            icon="pi pi-bell"
            text
            rounded
            className="text-gray-600 dark:text-gray-400 focus:shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 w-10 h-10"
          />
          <Badge
            value="2"
            severity="danger"
            className="absolute top-1 right-1 scale-75 border-2 border-white dark:border-gray-800"
          />
        </div>

        <div className="ml-2 pl-2 border-l border-gray-100 dark:border-gray-800 flex items-center">
          <UserPopover />
        </div>
      </div>
    </header>
  );
}
