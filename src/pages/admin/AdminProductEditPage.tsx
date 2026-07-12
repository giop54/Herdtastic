import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  addAdminVariant,
  adjustAdminStock,
  createAdminProduct,
  listAdminProducts,
  updateAdminProduct,
  updateAdminVariant,
} from "../../api/admin";
import { Button, Input, Select, Toast } from "../../components/ui";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { AdminPageHeader } from "./AdminLayout";
import type { AdminProduct, AdminVariantInput } from "../../types";

interface DetailRow {
  key: string;
  value: string;
}

interface VariantDraft extends AdminVariantInput {
  /** Dollar string for the price input; converted to cents on save. */
  price: string;
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function toCents(price: string): number {
  const parsed = Number.parseFloat(price);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid price "${price}"`);
  return Math.round(parsed * 100);
}

function detailRows(details: Record<string, unknown>): DetailRow[] {
  return Object.entries(details).map(([key, value]) => ({ key, value: String(value) }));
}

function emptyVariant(): VariantDraft {
  return { sku: "", name: "", price: "", price_cents: 0, inventory_quantity: 0 };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-cream-200 bg-white p-4 shadow-card">
      <h2 className="mb-3 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AdminProductEditPage() {
  const { productId } = useParams();
  const isNew = !productId;
  const navigate = useNavigate();
  const { describeError } = useAdminAuth();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loaded, setLoaded] = useState(isNew);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [fulfillment, setFulfillment] = useState<"shipping" | "booking">("shipping");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [images, setImages] = useState("");
  const [categories, setCategories] = useState("");
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [newVariants, setNewVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    listAdminProducts()
      .then((all) => {
        const found = all.find((p) => p.id === productId);
        if (!found) {
          setError("Product not found.");
          return;
        }
        applyProduct(found);
        setLoaded(true);
      })
      .catch((err) => setError(describeError(err)));
  }, [productId, isNew, describeError]);

  function applyProduct(p: AdminProduct) {
    setProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setFulfillment(p.fulfillment_type);
    setStatus(p.status);
    setImages(p.images.join("\n"));
    setCategories(p.category_ids.join(", "));
    setDetails(detailRows(p.details));
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  function collectShared() {
    return {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description,
      fulfillment_type: fulfillment,
      status,
      images: images
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      category_ids: categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      details: Object.fromEntries(
        details.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value]),
      ),
    };
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (isNew) {
        const created = await createAdminProduct({
          ...collectShared(),
          variants: newVariants
            .filter((v) => v.sku.trim() && v.name.trim())
            .map((v) => ({
              sku: v.sku.trim(),
              name: v.name.trim(),
              price_cents: toCents(v.price),
              inventory_quantity: v.inventory_quantity ?? 0,
            })),
        });
        navigate(`/admin/products/${created.id}`, { replace: true });
        notify("Product created");
      } else if (product) {
        applyProduct(await updateAdminProduct(product.id, collectShared()));
        notify("Saved");
      }
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveVariant(variantId: string, draft: VariantDraft) {
    if (!product) return;
    try {
      applyProduct(
        await updateAdminVariant(product.id, variantId, {
          sku: draft.sku.trim(),
          name: draft.name.trim(),
          price_cents: toCents(draft.price),
          track_inventory: draft.track_inventory,
          active: draft.active,
        }),
      );
      notify("Variant saved");
    } catch (err) {
      notify(describeError(err));
    }
  }

  async function addVariant(draft: VariantDraft) {
    if (!product) return;
    try {
      applyProduct(
        await addAdminVariant(product.id, {
          sku: draft.sku.trim(),
          name: draft.name.trim(),
          price_cents: toCents(draft.price),
          inventory_quantity: draft.inventory_quantity ?? 0,
        }),
      );
      setNewVariants([emptyVariant()]);
      notify("Variant added");
    } catch (err) {
      notify(describeError(err));
    }
  }

  async function stepStock(variantId: string, delta: number) {
    if (!product) return;
    try {
      applyProduct(await adjustAdminStock(product.id, variantId, { op: "adjust", quantity: delta }));
    } catch (err) {
      notify(describeError(err));
    }
  }

  if (error && !loaded) return <p className="text-red-700">{error}</p>;
  if (!loaded) return <p className="text-ink-600">Loading product…</p>;

  return (
    <div className="max-w-4xl">
      <AdminPageHeader title={isNew ? "New product" : `Edit: ${product?.name ?? ""}`}>
        {!isNew && product && (
          <a
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="font-condensed text-xs font-semibold uppercase tracking-caps text-navy-700 hover:text-red-700"
          >
            View in store ↗
          </a>
        )}
        <Button onClick={save} disabled={busy || !name.trim()}>
          {busy ? "Saving…" : isNew ? "Create product" : "Save"}
        </Button>
      </AdminPageHeader>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4">
        <Section title="Basics">
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              hint={isNew ? "Leave blank to derive from the name." : undefined}
            />
            <Select
              label="Fulfillment"
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value as "shipping" | "booking")}
              options={[
                { value: "shipping", label: "Shipping" },
                { value: "booking", label: "Booking" },
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "archived")}
              options={[
                { value: "active", label: "Active (visible in store)" },
                { value: "archived", label: "Archived (hidden)" },
              ]}
            />
          </div>
          <label className="mt-3 flex flex-col gap-1.5">
            <span className="font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="rounded-sm border border-tan-300 bg-white px-3 py-2.5 font-body text-base text-ink-900 outline-none focus:outline-2 focus:outline-navy-600 focus:outline-offset-1"
            />
          </label>
        </Section>

        <Section title="Attributes (details)">
          <div className="grid gap-2">
            {details.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  aria-label="Attribute name"
                  placeholder="e.g. duration"
                  value={row.key}
                  onChange={(e) =>
                    setDetails((rows) =>
                      rows.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)),
                    )
                  }
                  className="w-48"
                />
                <Input
                  aria-label="Attribute value"
                  placeholder="e.g. 2 hours"
                  value={row.value}
                  onChange={(e) =>
                    setDetails((rows) =>
                      rows.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)),
                    )
                  }
                  className="flex-1"
                />
                <button
                  onClick={() => setDetails((rows) => rows.filter((_, i) => i !== index))}
                  aria-label="Remove attribute"
                  className="rounded-sm p-1.5 text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setDetails((rows) => [...rows, { key: "", value: "" }])}
            className="mt-2 text-sm font-semibold text-navy-700 hover:text-red-700"
          >
            + Add attribute
          </button>
          <p className="mt-1 text-xs text-ink-400">
            Free-form key/value pairs shown on the product page. Remember to Save.
          </p>
        </Section>

        <Section title="Media & categories">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
                Image URLs (one per line, first = cover)
              </span>
              <textarea
                value={images}
                onChange={(e) => setImages(e.target.value)}
                rows={3}
                className="rounded-sm border border-tan-300 bg-white px-3 py-2.5 font-body text-sm text-ink-900 outline-none focus:outline-2 focus:outline-navy-600 focus:outline-offset-1"
              />
            </label>
            <Input
              label="Category IDs (comma-separated)"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
          </div>
        </Section>

        <Section title={isNew ? "Variants" : "Variants · stock & pricing"}>
          {!isNew && product && (
            <div className="mb-4 grid gap-3">
              {product.variants.map((variant) => (
                <ExistingVariantRow
                  key={variant.variant_id}
                  initial={{
                    sku: variant.sku,
                    name: variant.name,
                    price: dollars(variant.price_cents),
                    price_cents: variant.price_cents,
                    track_inventory: variant.track_inventory,
                    active: variant.active,
                  }}
                  stock={variant.inventory_quantity}
                  onSave={(draft) => saveVariant(variant.variant_id, draft)}
                  onStep={(delta) => stepStock(variant.variant_id, delta)}
                />
              ))}
            </div>
          )}
          {(isNew ? newVariants : newVariants.slice(0, 1)).map((draft, index) => (
            <div key={index} className="rounded-sm border border-dashed border-tan-300 p-3">
              <div className="mb-2 font-condensed text-[11px] font-semibold uppercase tracking-caps text-ink-400">
                {isNew ? `Variant ${index + 1}` : "Add a variant"}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <Input
                  label="SKU"
                  value={draft.sku}
                  onChange={(e) => updateDraft(index, { sku: e.target.value })}
                  className="w-36"
                />
                <Input
                  label="Name"
                  value={draft.name}
                  onChange={(e) => updateDraft(index, { name: e.target.value })}
                  className="w-44"
                />
                <Input
                  label="Price (USD)"
                  inputMode="decimal"
                  placeholder="45.00"
                  value={draft.price}
                  onChange={(e) => updateDraft(index, { price: e.target.value })}
                  className="w-28"
                />
                <Input
                  label="Initial stock"
                  type="number"
                  min={0}
                  value={String(draft.inventory_quantity ?? 0)}
                  onChange={(e) =>
                    updateDraft(index, { inventory_quantity: Number(e.target.value) || 0 })
                  }
                  className="w-28"
                />
                {!isNew && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!draft.sku.trim() || !draft.name.trim() || !draft.price.trim()}
                    onClick={() => addVariant(draft)}
                  >
                    Add variant
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isNew && (
            <button
              onClick={() => setNewVariants((rows) => [...rows, emptyVariant()])}
              className="mt-2 text-sm font-semibold text-navy-700 hover:text-red-700"
            >
              + Another variant
            </button>
          )}
        </Section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Toast tone="info">{toast}</Toast>
        </div>
      )}
    </div>
  );

  function updateDraft(index: number, patch: Partial<VariantDraft>) {
    setNewVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }
}

function ExistingVariantRow({
  initial,
  stock,
  onSave,
  onStep,
}: {
  initial: VariantDraft;
  stock: number;
  onSave: (draft: VariantDraft) => void;
  onStep: (delta: number) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [initialSnapshot, setInitialSnapshot] = useState(initial);
  if (JSON.stringify(initial) !== JSON.stringify(initialSnapshot)) {
    // Server responded with fresh data (e.g. after save) — resync the row.
    setDraft(initial);
    setInitialSnapshot(initial);
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(initialSnapshot);

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-sm border border-cream-200 bg-cream-50/60 p-3">
      <Input
        label="SKU"
        value={draft.sku}
        onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
        className="w-36"
      />
      <Input
        label="Name"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        className="w-44"
      />
      <Input
        label="Price (USD)"
        inputMode="decimal"
        value={draft.price}
        onChange={(e) => setDraft({ ...draft, price: e.target.value })}
        className="w-28"
      />
      <div className="flex flex-col gap-1.5">
        <span className="font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
          Stock
        </span>
        <span className="inline-flex h-[46px] items-center gap-1.5 rounded-sm border border-tan-300 bg-white px-2">
          <button
            onClick={() => onStep(-1)}
            aria-label="Decrease stock"
            className="rounded-sm p-0.5 text-red-700 hover:bg-cream-100"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-8 text-center tabular-nums">{stock}</span>
          <button
            onClick={() => onStep(1)}
            aria-label="Increase stock"
            className="rounded-sm p-0.5 text-navy-800 hover:bg-cream-100"
          >
            <Plus size={14} />
          </button>
        </span>
      </div>
      <label className="flex items-center gap-1.5 pb-3 text-sm text-ink-900">
        <input
          type="checkbox"
          checked={draft.active ?? true}
          onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
        />
        Active
      </label>
      <label className="flex items-center gap-1.5 pb-3 text-sm text-ink-900">
        <input
          type="checkbox"
          checked={draft.track_inventory ?? true}
          onChange={(e) => setDraft({ ...draft, track_inventory: e.target.checked })}
        />
        Track stock
      </label>
      <Button variant="secondary" size="sm" disabled={!dirty} onClick={() => onSave(draft)}>
        Save variant
      </Button>
    </div>
  );
}
