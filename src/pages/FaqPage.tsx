import {
  CalendarDays,
  ChevronDown,
  CircleHelp,
  PackageSearch,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Seo } from "../components/Seo";
import { LinkButton } from "../components/ui";

const faqSections = [
  {
    id: "shopping-shipping",
    title: "Shopping & shipping",
    icon: Truck,
    questions: [
      {
        question: "What can I purchase from Heardtastic?",
        answer:
          "Our catalog includes two kinds of products: frozen genetics that ship to you and ranch services that you reserve for a specific day. Each product page clearly shows whether the item ships or is booked by date.",
      },
      {
        question: "Where do you ship?",
        answer:
          "Heardtastic cryo-ships frozen genetics to all 50 states. Available shipping options and the final order total are shown during checkout.",
      },
      {
        question: "How do I track an order?",
        answer:
          "Open Track an Order and enter the order ID together with the email address used at checkout. Those details help keep guest orders private while giving you quick access to the latest order status.",
      },
    ],
  },
  {
    id: "daily-bookings",
    title: "Daily bookings",
    icon: CalendarDays,
    questions: [
      {
        question: "How does daily availability work?",
        answer:
          "Bookable products show available dates from tomorrow through the next 90 days in America/Chicago time. Each product can be reserved once per calendar day, so a date becomes unavailable as soon as another customer completes that booking.",
      },
      {
        question: "Do I pay when I make a booking?",
        answer:
          "No. Daily bookings are created directly and are not charged through Stripe in this version. We collect your name, email, and phone number so the ranch can identify and coordinate your reservation.",
      },
      {
        question: "Can I cancel or reschedule a booking?",
        answer:
          "You can cancel from the booking confirmation page in the same browser used to reserve the date. Cancellation releases the day for someone else. Rescheduling is not available yet, so cancel the existing booking and choose a new available date.",
      },
      {
        question: "Why did my selected date become unavailable?",
        answer:
          "Another customer may have completed the reservation moments before you. The calendar prevents double-booking; refresh availability and select another open date.",
      },
    ],
  },
  {
    id: "checkout-privacy",
    title: "Checkout & privacy",
    icon: ShieldCheck,
    questions: [
      {
        question: "Do I need an account?",
        answer:
          "No. You can place a shipping order or reserve a booking as a guest. Keep your confirmation details handy so you can return to your order or booking later.",
      },
      {
        question: "How are shipping purchases paid for?",
        answer:
          "Shipping products use Stripe's secure hosted checkout. Bookable products stay outside the cart and do not use Stripe checkout.",
      },
      {
        question: "Why should I use the same browser for a booking?",
        answer:
          "For guest bookings, this browser stores a private ownership token. That token is what lets you view or cancel your reservation later without creating an account.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqSections.flatMap((section) =>
    section.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  ),
};

export function FaqPage() {
  return (
    <>
      <Seo
        title="Frequently Asked Questions"
        description="Answers about Heardtastic shipping, daily cattle bookings, guest checkout, order tracking, and cancellations."
        path="/faq"
        jsonLd={faqJsonLd}
      />

      <div className="mx-auto max-w-6xl py-8 sm:py-12">
        <section className="relative overflow-hidden rounded-2xl border border-cream-200 bg-navy-900 px-5 py-10 text-cream-50 shadow-raised sm:px-10 sm:py-14">
          <CircleHelp className="absolute -right-7 -top-8 h-44 w-44 text-white/[0.04]" aria-hidden="true" />
          <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-cream-100">
            Heardtastic help center
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Straight answers, from pasture to purchase.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-navy-100 sm:text-lg">
            Learn how frozen genetics ship, how daily ranch bookings work, and how to find your
            confirmation after checkout.
          </p>
        </section>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          <aside className="rounded-xl border border-cream-200 bg-cream-50 p-5 shadow-soft lg:sticky lg:top-28">
            <h2 className="font-display text-xl text-navy-900">Find your topic</h2>
            <nav aria-label="FAQ sections" className="mt-3 flex flex-col gap-1">
              {faqSections.map((section) => {
                const Icon = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 font-condensed text-sm font-semibold uppercase tracking-caps text-navy-800 no-underline transition-colors duration-200 hover:bg-white hover:text-red-700"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {section.title}
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-10">
            {faqSections.map((section) => {
              const Icon = section.icon;
              return (
                <section key={section.id} id={section.id} className="scroll-mt-28" aria-labelledby={`${section.id}-title`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 id={`${section.id}-title`} className="font-display text-2xl text-navy-900 sm:text-3xl">
                      {section.title}
                    </h2>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-cream-200 bg-white shadow-soft">
                    {section.questions.map((item) => (
                      <details key={item.question} className="group border-b border-cream-200 last:border-b-0">
                        <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 font-condensed text-base font-semibold text-navy-900 marker:content-none sm:px-5 [&::-webkit-details-marker]:hidden">
                          <span>{item.question}</span>
                          <ChevronDown
                            className="h-5 w-5 flex-none text-red-700 transition-transform duration-200 group-open:rotate-180"
                            aria-hidden="true"
                          />
                        </summary>
                        <p className="max-w-3xl px-4 pb-5 pr-12 text-sm leading-7 text-ink-600 sm:px-5 sm:pr-14 sm:text-base">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <section className="mt-12 rounded-2xl border border-tan-300 bg-cream-100 p-6 shadow-soft sm:p-8">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
                Ready for the next step?
              </p>
              <h2 className="mt-2 font-display text-2xl text-navy-900 sm:text-3xl">
                Browse proven genetics or find an existing order.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/catalog" size="lg">
                Browse sires &amp; services
              </LinkButton>
              <LinkButton to="/orders/lookup" variant="secondary" size="lg">
                <PackageSearch className="h-4 w-4" aria-hidden="true" />
                Track an order
              </LinkButton>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
