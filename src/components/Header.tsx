import { NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { IconButton } from "./ui";

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

      <header className="border-b border-cream-200 bg-white px-4 py-3.5 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-7 gap-y-3">
          <NavLink to="/" className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-navy-800 font-display text-base text-navy-800"
            >
              H
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl text-navy-800">Heardtastic</span>
              <span className="font-condensed text-[10px] uppercase tracking-wide2 text-red-700">
                Texas All-American Cattle Co.
              </span>
            </span>
          </NavLink>

          <nav className="order-last flex w-full gap-5 sm:order-none sm:ml-3 sm:w-auto">
            <NavLink to="/catalog" className={navLinkClass}>
              Shop Sires
            </NavLink>
            <NavLink to="/orders/lookup" className={navLinkClass}>
              Track an Order
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <IconButton icon={Search} label="Search" variant="ghost" />
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
