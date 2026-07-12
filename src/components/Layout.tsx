import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream-50 text-ink-900">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-sm bg-navy-900 px-4 py-3 font-condensed text-sm font-semibold uppercase tracking-caps text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-9 sm:px-8 lg:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
