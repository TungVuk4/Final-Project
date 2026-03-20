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

function RoleProtectedRoute({ children, allowedEmails }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const currentEmail = user?.email || "";
  
  if (allowedEmails && !allowedEmails.includes(currentEmail)) {
    // Nếu không có quyền, redirect về trang mặc định của Admin đó
    if (currentEmail === "admin2@fashionstyle.com") return <Navigate to="/product" replace />;
    if (currentEmail === "admin3@fashionstyle.com") return <Navigate to="/users" replace />;
    return <Navigate to="/" replace />; // Default cho Admin 1
  }

  return children;
}

export default function AppRouter() {
  const user = useAuthStore((state) => state.user);
  const currentEmail = user?.email || "";

  // Tạo component redirect sau khi login
  const DefaultRedirect = () => {
    if (currentEmail === "admin2@fashionstyle.com") return <Navigate to="/product" replace />;
    if (currentEmail === "admin3@fashionstyle.com") return <Navigate to="/users" replace />;
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
        
        {/* Dashboard: Chỉ Admin 1 */}
        <Route path="/" element={
          <RoleProtectedRoute allowedEmails={["admin1@fashionstyle.com"]}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

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

        {/* Khuyến Mãi (Promotions): Admin 1 và Admin 2 */}
        <Route path="/promotions" element={
          <RoleProtectedRoute allowedEmails={["admin1@fashionstyle.com", "admin2@fashionstyle.com"]}>
            <Promotions />
          </RoleProtectedRoute>
        } />

      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<DefaultRedirect />} />

    </Routes>
  );
}
