import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Cart,
  Checkout,
  ForgotPassword,
  HomeLayout,
  Landing,
  Login,
  OrderConfirmation,
  OrderHistory,
  Register,
  Search,
  Shop,
  SingleOrderHistory,
  SingleProduct,
  UserProfile,
} from "./pages";
import MaintenancePage from "./pages/MaintenancePage";
import { useSystemConfig } from "./hooks/useSystemConfig";

import { checkoutAction, searchAction } from "./actions/index";
import { shopCategoryLoader } from "./pages/Shop";
import { loader as orderHistoryLoader } from "./pages/OrderHistory";
import { loader as singleOrderLoader } from "./pages/SingleOrderHistory";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "shop", element: <Shop /> },
      { path: "shop/:category", element: <Shop />, loader: shopCategoryLoader },
      { path: "product/:id", element: <SingleProduct /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout />, action: checkoutAction },
      { path: "search", action: searchAction, element: <Search /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "order-confirmation", element: <OrderConfirmation /> },
      { path: "user-profile", element: <UserProfile /> },
      { path: "order-history", element: <OrderHistory />, loader: orderHistoryLoader },
      { path: "order-history/:id", element: <SingleOrderHistory />, loader: singleOrderLoader },
    ],
  },
]);

// Guard: kiểm tra maintenance_mode trước khi render app
function SystemConfigGuard({ children }: { children: React.ReactNode }) {
  const { config, loading } = useSystemConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (config.maintenance_mode) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <SystemConfigGuard>
      <RouterProvider router={router} />
    </SystemConfigGuard>
  );
}

export default App;

