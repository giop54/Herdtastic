import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 text-ink-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-9 sm:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
