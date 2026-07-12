import { Link } from "react-router-dom";

const headingClass =
  "mb-1 font-condensed text-xs font-semibold uppercase tracking-wide2 text-cream-100";
const linkClass = "text-navy-100 no-underline hover:text-white";

export function Footer() {
  return (
    <footer className="mt-14 bg-navy-900 px-4 pb-7 pt-10 text-cream-50 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-12">
        <div className="flex max-w-xs flex-col gap-2">
          <span className="font-display text-xl text-cream-50">Heardtastic</span>
          <span className="leading-relaxed text-navy-100">
            Family-owned in Texas. Proven genetics, cryo-shipped nationwide.
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className={headingClass}>Shop</span>
          <Link to="/catalog" className={linkClass}>
            All Sires
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className={headingClass}>Support</span>
          <Link to="/orders/lookup" className={linkClass}>
            Track an Order
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-7 max-w-6xl border-t border-navy-700 pt-4 font-condensed text-[11px] uppercase tracking-caps text-navy-100">
        &copy; {new Date().getFullYear()} Heardtastic &middot; Texas All-American Cattle Co. &middot; Ships to
        all 50 states
      </div>
    </footer>
  );
}
