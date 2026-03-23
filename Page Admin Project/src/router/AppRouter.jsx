import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import AppLayout from "../layout/AppLayout";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Roles from "../pages/Roles";
import { useAuthStore } from "../stores/auth";
import Product from "../pages/Product";
import Promotions from "../pages/Promotions";
import Orders from "../pages/Orders";

function RoleProtectedRoute({ children, allowedEmails }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const currentEmail = user?.email || "";
  
  if (allowedEmails && !allowedEmails.includes(currentEmail)) {
    return <Navigate to="/" replace />; 
  }

  return children;
}

export default function AppRouter() {
  const user = useAuthStore((state) => state.user);
  const currentEmail = user?.email || "";

  // Component redirect sau khi login: Mọi admin đều về Dashboard
  const DefaultRedirect = () => {
    return <Navigate to="/" replace />;
  };

  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* APP */}
      <Route element={<RoleProtectedRoute><AppLayout /></RoleProtectedRoute>}>
        
        {/* Dashboard: Tất cả Admin đều vào được */}
        <Route path="/" element={<Dashboard />} />

        {/* Cả 3 Admin đều xem được trang Roles (để theo dõi lịch sử và trạng thái) */}
        <Route path="/roles" element={<Roles />} />

        {/* Users: Admin 1 và Admin 3 */}
        <Route path="/users" element={
          <RoleProtectedRoute allowedEmails={["admin1@fashionstyle.com", "admin3@fashionstyle.com"]}>
            <Users />
          </RoleProtectedRoute>
        } />

        {/* Product: Admin 1 và Admin 2 */}
        <Route path="/product" element={
          <RoleProtectedRoute allowedEmails={["admin1@fashionstyle.com", "admin2@fashionstyle.com"]}>
            <Product />
          </RoleProtectedRoute>
        } />

        {/* Khuyến Mãi (Promotions): Chỉ Admin 2 */}
        <Route path="/promotions" element={
          <RoleProtectedRoute allowedEmails={["admin2@fashionstyle.com"]}>
            <Promotions />
          </RoleProtectedRoute>
        } />

        {/* Cấu hình Route Đơn hàng: Chỉ Admin 3 */}
        <Route path="/orders" element={
          <RoleProtectedRoute allowedEmails={["admin3@fashionstyle.com"]}>
            <Orders />
          </RoleProtectedRoute>
        } />

      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<DefaultRedirect />} />

    </Routes>
  );
}
