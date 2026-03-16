import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export default function MobileDrawer({ visible, onHide }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const items = [
    { label: "Dashboard", icon: "pi pi-home", path: "/" },
    { label: "Users", icon: "pi pi-users", path: "/users" },
    { label: "Roles", icon: "pi pi-users", path: "/roles" },
  ];

  return (
    <PrimeSidebar
      visible={visible}
      onHide={onHide}
      position="left"
      className="w-64"
    >
      <div className="font-semibold mb-4 text-lg">Admin</div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              onHide();
            }}
            className={`
              flex items-center gap-3 px-3 py-2 rounded
              transition-colors
              ${
                isActive(item.path)
                  ? "bg-slate-200 font-medium"
                  : "hover:bg-slate-100"
              }
            `}
          >
            <i className={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </PrimeSidebar>
  );
}
