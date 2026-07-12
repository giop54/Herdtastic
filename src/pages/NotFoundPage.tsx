import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { Seo } from "../components/Seo";

export function NotFoundPage() {
  return (
    <div className="py-24 text-center">
      <Seo title="Page Not Found" description="This page doesn't exist." noindex />
      <h1 className="font-display text-3xl font-normal text-navy-800">Page not found</h1>
      <p className="mt-2 text-ink-600">We couldn&rsquo;t find what you were looking for.</p>
      <Link to="/catalog" className="mt-6 inline-block">
        <Button variant="secondary">Back to Catalog</Button>
      </Link>
    </div>
  );
}
