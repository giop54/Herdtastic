import {
  ArrowRight,
  CalendarDays,
  CircleHelp,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { LinkButton } from "../components/ui";

const supportPaths = [
  {
    icon: CalendarDays,
    title: "Booking help",
    body: "Check current availability, select an open day, or return to a booking confirmation to cancel.",
    label: "Browse bookable services",
    to: "/catalog",
  },
  {
    icon: PackageSearch,
    title: "Order support",
    body: "Use your order ID and checkout email to see the latest status of a shipping order.",
    label: "Track an order",
    to: "/orders/lookup",
  },
  {
    icon: CircleHelp,
    title: "Quick answers",
    body: "Learn how shipping, daily availability, guest ownership, payments, and cancellations work.",
    label: "Read the FAQ",
    to: "/faq",
  },
];

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@heardtastic.com",
    href: "mailto:hello@heardtastic.com",
  },
  {
    icon: Phone,
    label: "Call",
    value: "(512) 555-0147",
    href: "tel:+15125550147",
  },
  {
    icon: MapPin,
    label: "Ranch office",
    value: "1845 Longhorn Trail, Brenham, TX 77833",
  },
];

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contact Us"
        description="Get Heardtastic help with daily cattle bookings, shipping orders, checkout, and common questions."
        path="/contact"
      />

      <div className="mx-auto max-w-6xl space-y-12 py-4 sm:space-y-16 sm:py-8">
        <section className="relative overflow-hidden rounded-2xl border border-cream-200 bg-white px-6 py-12 shadow-raised sm:px-10 sm:py-16 lg:px-14">
          <Send className="absolute -right-8 -top-8 h-52 w-52 -rotate-12 text-navy-900/[0.035]" aria-hidden="true" />
          <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
            Contact Heardtastic
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-navy-900 sm:text-5xl lg:text-6xl">
            Let&rsquo;s get you to the right place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-600 sm:text-lg">
            Choose what you need help with below. We&rsquo;ll take you directly to booking
            availability, order tracking, or the answers breeders ask us most often.
          </p>
        </section>

        <section aria-label="Contact details" className="grid gap-4 md:grid-cols-3">
          {contactDetails.map(({ icon: Icon, label, value, href }) => {
            const content = (
              <>
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-navy-900 text-cream-50">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
                    {label}
                  </span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-navy-900">
                    {value}
                  </span>
                </span>
              </>
            );

            return href ? (
              <a
                key={label}
                href={href}
                className="flex min-h-[92px] items-center gap-4 rounded-xl border border-cream-200 bg-white p-5 text-ink-900 no-underline shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-tan-300 hover:shadow-lift"
              >
                {content}
              </a>
            ) : (
              <div
                key={label}
                className="flex min-h-[92px] items-center gap-4 rounded-xl border border-cream-200 bg-white p-5 shadow-soft"
              >
                {content}
              </div>
            );
          })}
        </section>

        <section aria-labelledby="support-title">
          <div className="max-w-2xl">
            <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
              How can we help?
            </p>
            <h2 id="support-title" className="mt-3 font-display text-3xl text-navy-900 sm:text-4xl">
              Start with your type of request.
            </h2>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {supportPaths.map(({ icon: Icon, title, body, label, to }) => (
              <Link
                key={title}
                to={to}
                className="group flex min-h-[280px] flex-col rounded-2xl border border-cream-200 bg-white p-6 text-ink-900 no-underline shadow-soft transition duration-200 hover:-translate-y-1 hover:border-tan-300 hover:shadow-lift"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-2xl text-navy-900">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-ink-600">{body}</p>
                <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-caps text-red-700">
                  {label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid overflow-hidden rounded-2xl bg-navy-900 text-cream-50 shadow-raised lg:grid-cols-[1fr_0.85fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-600">
              Before you begin
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Keep these details nearby.</h2>
            <p className="mt-4 max-w-xl leading-7 text-navy-100">
              The right confirmation details help you get an answer faster while protecting guest
              purchases and reservations.
            </p>
          </div>
          <ul className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-1">
            <li className="bg-navy-800 p-6 sm:p-8">
              <span className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-cream-100">
                For shipping orders
              </span>
              <p className="mt-2 text-sm leading-6 text-navy-100">
                Have your order ID and the email address used during checkout.
              </p>
            </li>
            <li className="bg-navy-800 p-6 sm:p-8">
              <span className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-cream-100">
                For daily bookings
              </span>
              <p className="mt-2 text-sm leading-6 text-navy-100">
                Use the same browser that created the booking to view or cancel it.
              </p>
            </li>
          </ul>
        </section>

        <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-tan-300 bg-cream-100 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-display text-2xl text-navy-900 sm:text-3xl">Want to know who we are?</h2>
            <p className="mt-2 leading-7 text-ink-600">Meet the Texas cattle company behind Heardtastic.</p>
          </div>
          <LinkButton to="/about" variant="secondary" size="lg">
            About Heardtastic
          </LinkButton>
        </section>
      </div>
    </>
  );
}
