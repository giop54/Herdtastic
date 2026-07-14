import { Award, CalendarDays, MapPin, ShieldCheck, Snowflake, Truck } from "lucide-react";
import { BrandMedallion } from "../components/BrandMedallion";
import { Seo } from "../components/Seo";
import { LinkButton } from "../components/ui";

const principles = [
  {
    icon: Award,
    title: "Proven genetics",
    body: "We make registered cattle genetics easier to explore, compare, and purchase with the details breeders need close at hand.",
  },
  {
    icon: Snowflake,
    title: "Handled for the journey",
    body: "Frozen genetics are prepared for cryogenic shipment, extending access to breeders across all 50 states.",
  },
  {
    icon: CalendarDays,
    title: "Simple ranch bookings",
    body: "Bookable services show daily availability up front, making it easier to reserve a day without back-and-forth scheduling.",
  },
];

export function AboutPage() {
  return (
    <>
      <Seo
        title="About Us"
        description="Meet Herdtastic, a family-owned Texas cattle company connecting breeders with registered genetics, nationwide cryogenic shipping, and daily ranch bookings."
        path="/about"
      />

      <div className="mx-auto max-w-6xl space-y-14 py-4 sm:space-y-20 sm:py-8">
        <section className="grid overflow-hidden rounded-2xl bg-navy-900 text-cream-50 shadow-raised lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-navy-600 px-3 py-1 font-condensed text-xs font-semibold uppercase tracking-wide2 text-cream-100">
              <MapPin className="h-4 w-4 text-red-600" aria-hidden="true" />
              Family-owned in Texas
            </div>
            <h1 className="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Cattle know-how, made easier to access.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-navy-100 sm:text-lg">
              Herdtastic is Texas All-American Cattle Co.&mdash;a family-owned operation built to
              connect cattle breeders with proven genetics and dependable ways to buy or book.
            </p>
          </div>
          <div className="relative grid min-h-[320px] place-items-center overflow-hidden border-t border-white/10 bg-white/[0.05] p-10 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_62%)]" />
            <BrandMedallion
              className="relative w-full max-w-[350px] border-4 border-white shadow-2xl ring-8 ring-white/10"
              priority
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
              What we do
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-navy-900 sm:text-4xl">
              One dependable storefront for shipping and scheduling.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-ink-600">
            <p>
              Our storefront brings two sides of the cattle business together. Breeders can shop
              frozen genetics for nationwide cryogenic shipping or reserve bookable ranch services
              on an available calendar day.
            </p>
            <p>
              Product details, availability, checkout, and guest order tracking are designed to be
              straightforward. That means less time navigating a complicated process and more time
              focused on the breeding decisions that matter.
            </p>
          </div>
        </section>

        <section aria-labelledby="principles-title">
          <div className="max-w-2xl">
            <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
              Our approach
            </p>
            <h2 id="principles-title" className="mt-3 font-display text-3xl text-navy-900 sm:text-4xl">
              Built around clarity and access.
            </h2>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-cream-200 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-2xl text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-tan-300 bg-cream-100 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <span className="hidden h-12 w-12 flex-none place-items-center rounded-full bg-navy-900 text-cream-50 sm:grid">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl text-navy-900 sm:text-3xl">
                Find the right fit for your operation.
              </h2>
              <p className="mt-2 max-w-2xl leading-7 text-ink-600">
                Browse shippable genetics and bookable services in the Herdtastic catalog.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/catalog" size="lg">
              <Truck className="h-4 w-4" aria-hidden="true" />
              Browse catalog
            </LinkButton>
            <LinkButton to="/contact" size="lg" variant="secondary">
              Contact us
            </LinkButton>
          </div>
        </section>
      </div>
    </>
  );
}
