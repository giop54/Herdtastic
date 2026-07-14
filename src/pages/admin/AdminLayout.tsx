import type { ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { Seo } from "../../components/Seo";
import { useAdminAuth } from "../../context/AdminAuthContext";

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/activity", label: "Activity", icon: ScrollText },
];

export function AdminLayout() {
  const { authenticated, logout } = useAdminAuth();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 md:flex-row">
      <Seo title="Admin" description="Herdtastic back office." noindex />
      <aside className="flex shrink-0 flex-row items-center gap-1 overflow-x-auto bg-navy-800 px-3 py-2 md:sticky md:top-0 md:h-screen md:w-52 md:flex-col md:items-stretch md:gap-0 md:overflow-visible md:px-0 md:py-4">
        <div className="px-2 font-display text-lg text-cream-50 md:px-5 md:pb-4">
          Heard<span className="text-red-600">tastic</span>
        </div>
        <nav className="flex flex-row gap-1 md:flex-col md:gap-0" aria-label="Admin">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2 font-condensed text-xs font-semibold uppercase tracking-caps md:rounded-none md:px-5 ${
                  isActive
                    ? "bg-red-700 text-white"
                    : "text-navy-100 hover:bg-navy-700 hover:text-white"
                }`
              }
            >
              <Icon size={15} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto md:mt-auto md:ml-0 md:border-t md:border-navy-700 md:pt-2">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-100 hover:bg-navy-700 hover:text-white md:w-full md:rounded-none md:px-5"
          >
            <LogOut size={15} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl text-navy-800">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
