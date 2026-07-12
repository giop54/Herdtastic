import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "../../context/AdminAuthContext";
import { AdminLayout } from "./AdminLayout";
import { AdminLoginPage } from "./AdminLoginPage";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { AdminProductsPage } from "./AdminProductsPage";
import { AdminProductEditPage } from "./AdminProductEditPage";
import { AdminBookingsPage } from "./AdminBookingsPage";
import { AdminOrdersPage } from "./AdminOrdersPage";
import { AdminOrderDetailPage } from "./AdminOrderDetailPage";
import { AdminActivityPage } from "./AdminActivityPage";

/**
 * The whole back office ships as one lazy chunk (see App.tsx) so shoppers never
 * download it. Everything under /admin renders inside AdminAuthProvider and,
 * except for /admin/login, behind AdminLayout's auth guard.
 */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductEditPage />} />
          <Route path="products/:productId" element={<AdminProductEditPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="activity" element={<AdminActivityPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
