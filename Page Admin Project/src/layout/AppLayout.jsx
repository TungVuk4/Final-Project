import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileDrawer from "./MobileDrawer";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");

    const handleChange = () => {
      setIsMobile(mq.matches);
      if (mq.matches) {
        setCollapsed(false);
      }
    };

    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    // Thay đổi bg-slate-50 sang màu xám nhạt hơn hoặc trắng để đồng bộ mẫu
    <div className="flex min-h-screen bg-gray-50/50 text-slate-900">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer
          visible={drawerOpen}
          onHide={() => setDrawerOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Topbar: Đã thêm các icon tìm kiếm, thông báo, ngôn ngữ và avatar */}
        <Topbar
          isMobile={isMobile}
          collapsed={collapsed}
          onToggle={() =>
            isMobile ? setDrawerOpen(true) : setCollapsed((v) => !v)
          }
        />

        {/* Nội dung chính: Thêm hiệu ứng cuộn mượt và padding phù hợp */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* max-w-7xl giúp nội dung không quá rộng trên màn hình cực lớn */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
