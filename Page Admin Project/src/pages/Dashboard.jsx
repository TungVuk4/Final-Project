import React from "react";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();

  // Dữ liệu mẫu cho các thẻ
  const stats = [
    {
      title: t("weekly_sales"),
      value: "714k",
      color: "bg-blue-100 text-blue-700",
      icon: "pi-shopping-bag",
    },
    {
      title: t("new_users"),
      value: "1.35m",
      color: "bg-purple-100 text-purple-700",
      icon: "pi-users",
    },
    {
      title: t("purchase_orders"),
      value: "1.72m",
      color: "bg-yellow-100 text-yellow-700",
      icon: "pi-tag",
    },
    {
      title: t("messages"),
      value: "234",
      color: "bg-red-100 text-red-700",
      icon: "pi-envelope",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("welcome")} 👋</h1>

      {/* Grid thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl shadow-sm border border-white ${stat.color} flex flex-col items-center text-center`}
          >
            <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-4 text-xl">
              <i className={`pi ${stat.icon}`}></i>
            </div>
            <h3 className="text-3xl font-bold">{stat.value}</h3>
            <p className="text-sm font-medium opacity-70">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Phần biểu đồ (Ví dụ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold mb-4">{t("visits_by_source")}</h2>
          {/* Component Chart của PrimeReact sẽ đặt ở đây */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Pie Chart
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold mb-4">{t("website_visits")}</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Bar Chart
          </div>
        </div>
      </div>
    </div>
  );
}
