import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Archive, Copy, ExternalLink, Minus, Plus, RotateCcw } from "lucide-react";
import {
  adjustAdminStock,
  archiveAdminProduct,
  createAdminProduct,
  listAdminProducts,
  updateAdminProduct,
} from "../../api/admin";
import { Badge, Button, DataPageSkeleton, Dialog, Input, Toast } from "../../components/ui";
import { formatCents } from "../../lib/money";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { AdminPageHeader } from "./AdminLayout";
import type { AdminProduct } from "../../types";

export function AdminProductsPage() {
  const { describeError } = useAdminAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [toArchive, setToArchive] = useState<AdminProduct | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    listAdminProducts()
      .then(setProducts)
      .catch((err) => setError(describeError(err)));
  }, [describeError]);

  const visible = useMemo(() => {
    if (!products) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.slug.includes(needle) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(needle)),
    );
  }, [products, query]);

  function replaceProduct(updated: AdminProduct) {
    setProducts((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? prev);
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  async function step(product: AdminProduct, variantId: string, delta: number) {
    try {
      replaceProduct(await adjustAdminStock(product.id, variantId, { op: "adjust", quantity: delta }));
    } catch (err) {
      notify(describeError(err));
    }
  }

  async function archive(product: AdminProduct) {
    setToArchive(null);
    try {
      replaceProduct(await archiveAdminProduct(product.id));
      notify(`Archived "${product.name}"`);
    } catch (err) {
      notify(describeError(err));
    }
  }

  async function restore(product: AdminProduct) {
    try {
      replaceProduct(await updateAdminProduct(product.id, { status: "active" }));
      notify(`Restored "${product.name}"`);
    } catch (err) {
      notify(describeError(err));
    }
  }

  async function duplicate(product: AdminProduct) {
    try {
      const copy = await createAdminProduct({
        name: `${product.name} (copy)`,
        description: product.description,
        images: product.images,
        category_ids: product.category_ids,
        details: product.details,
        fulfillment_type: product.fulfillment_type,
        status: "archived",
        variants: product.variants.map((v) => ({
          sku: `${v.sku}-COPY`,
          name: v.name,
          price_cents: v.price_cents,
          inventory_quantity: 0,
          track_inventory: v.track_inventory,
          active: v.active,
        })),
      });
      navigate(`/admin/products/${copy.id}`);
    } catch (err) {
      notify(describeError(err));
    }
  }

  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <div>
      <AdminPageHeader title="Products">
        <Input
          placeholder="Search name, slug, SKU…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <Button onClick={() => navigate("/admin/products/new")}>New product</Button>
      </AdminPageHeader>

      {!products ? (
        <DataPageSkeleton />
      ) : visible.length === 0 ? (
        <p className="text-ink-600">
          {products.length === 0
            ? "No products yet — create the first one."
            : "Nothing matches that search."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-cream-200 bg-white shadow-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-tan-300 bg-cream-100 text-left font-condensed text-[11px] font-semibold uppercase tracking-caps text-ink-400">
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Variant</th>
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5 text-right">Price</th>
                <th className="px-4 py-2.5">Stock</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {visible.flatMap((product) =>
                product.variants.map((variant, index) => (
                  <tr key={variant.variant_id} className={index > 0 ? "bg-cream-50/50" : ""}>
                    <td className="px-4 py-2">
                      {index === 0 && (
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="font-semibold text-navy-800 hover:text-red-700"
                        >
                          {product.name}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-2 text-ink-900">{variant.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-ink-600">{variant.sku}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatCents(variant.price_cents)}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => step(product, variant.variant_id, -1)}
                          aria-label={`Decrease stock for ${variant.sku}`}
                          className="rounded-sm border border-tan-300 p-0.5 text-red-700 hover:bg-cream-100"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-8 text-center tabular-nums">
                          {variant.inventory_quantity}
                        </span>
                        <button
                          onClick={() => step(product, variant.variant_id, 1)}
                          aria-label={`Increase stock for ${variant.sku}`}
                          className="rounded-sm border border-tan-300 p-0.5 text-navy-800 hover:bg-cream-100"
                        >
                          <Plus size={13} />
                        </button>
                        {!variant.track_inventory && (
                          <span className="ml-1 text-[10px] text-ink-400">untracked</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {index === 0 && (
                        <Badge tone={product.status === "active" ? "success" : "neutral"}>
                          {product.status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {index === 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <a
                            href={`/products/${product.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View in store"
                            className="rounded-sm p-1 text-navy-700 hover:bg-cream-100"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            onClick={() => duplicate(product)}
                            title="Duplicate"
                            className="rounded-sm p-1 text-navy-700 hover:bg-cream-100"
                          >
                            <Copy size={15} />
                          </button>
                          {product.status === "active" ? (
                            <button
                              onClick={() => setToArchive(product)}
                              title="Archive"
                              className="rounded-sm p-1 text-red-700 hover:bg-red-50"
                            >
                              <Archive size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => restore(product)}
                              title="Restore"
                              className="rounded-sm p-1 text-navy-700 hover:bg-cream-100"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={Boolean(toArchive)}
        title="Archive product?"
        onClose={() => setToArchive(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToArchive(null)}>
              Keep it
            </Button>
            <Button onClick={() => toArchive && archive(toArchive)}>Archive</Button>
          </>
        }
      >
        “{toArchive?.name}” will disappear from the storefront but stays in order history. You can
        restore it any time.
      </Dialog>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Toast tone="info">{toast}</Toast>
        </div>
      )}
    </div>
  );
}
