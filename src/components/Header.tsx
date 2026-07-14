import { NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { IconButton } from "./ui";
import { BrandMedallion } from "./BrandMedallion";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 pb-1.5 pt-1 font-condensed text-[13px] font-semibold uppercase tracking-caps transition-colors duration-200 ease-out ${
    isActive ? "border-red-700 text-red-700" : "border-transparent text-navy-800 hover:text-red-700"
  }`;

export function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <div>
      <div className="bg-navy-800 px-4 py-2 text-center font-condensed text-xs uppercase tracking-wide2 text-cream-50">
        &#9733; Cryo-shipped to all 50 states &middot; Family-owned in Texas &#9733;
      </div>

      <header className="sticky top-0 z-40 border-b border-cream-200 bg-white/95 px-4 py-2 shadow-soft backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2">
          <NavLink to="/" className="group flex items-center gap-3">
            <BrandMedallion className="h-12 w-12 flex-shrink-0 border border-cream-200 shadow-soft sm:h-14 sm:w-14" decorative priority />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg text-navy-800 sm:text-xl">Herdtastic</span>
              <span className="mt-1 hidden font-condensed text-[10px] uppercase tracking-wide2 text-red-700 sm:block">
                Texas All-American Cattle Co.
              </span>
            </span>
          </NavLink>

          <nav className="order-last flex w-full flex-wrap gap-x-5 gap-y-2 sm:order-none sm:ml-3 sm:w-auto">
            <NavLink to="/catalog" className={navLinkClass}>
              Sires &amp; Services
            </NavLink>
            <NavLink to="/orders/lookup" className={navLinkClass}>
              Track an Order
            </NavLink>
            <NavLink to="/faq" className={navLinkClass}>
              FAQ
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <IconButton
              icon={CalendarDays}
              label="Book a bull"
              variant="ghost"
              onClick={() => navigate("/catalog")}
            />
            <IconButton
              icon={ShoppingCart}
              label="Cart"
              badge={itemCount}
              onClick={() => navigate("/cart")}
            />
          </div>
        </div>
      </header>
    </div>
  );
}
