import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutSuccessPage } from "./pages/CheckoutSuccessPage";
import { CheckoutCancelPage } from "./pages/CheckoutCancelPage";
import { OrderLookupPage } from "./pages/OrderLookupPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { BookingPage } from "./pages/BookingPage";
import { FaqPage } from "./pages/FaqPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";

// The back office is its own lazy chunk so shoppers never download it.
const AdminApp = lazy(() => import("./pages/admin"));

function App() {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense
            fallback={<div className="p-10 text-center text-ink-600">Loading admin…</div>}
          >
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="bookings/:bookingId" element={<BookingPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="checkout/cancel" element={<CheckoutCancelPage />} />
        <Route path="orders/lookup" element={<OrderLookupPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
