import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { ApiError, toErrorMessage } from "../../lib/apiClient";
import { formatCurrency } from "../../lib/format";
import { OrderDraftList } from "./OrderDraftList";
import { ProductPicker, StepBadge, type ProductPickerHandle } from "./ProductPicker";
import { createOrder } from "./ordersApi";
import { DEFAULT_CUSTOMER_NAME, useOrderDraft } from "./useOrderDraft";

type SubmitState = "idle" | "submitting";

interface SubmitFailure {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export function CreateOrderPage() {
  const draft = useOrderDraft();
  const productPickerRef = useRef<ProductPickerHandle>(null);

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [failure, setFailure] = useState<SubmitFailure | null>(null);

  const isSubmitting = submitState === "submitting";
  const itemCount = draft.lines.reduce((total, line) => total + line.quantity, 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setCreatedOrderId(null);
    setFailure(null);

    // Doğrulama başarısızsa istek hiç atılmaz; hatalar alanların altında çıkar.
    const payload = draft.validate();
    if (!payload) return;

    setSubmitState("submitting");
    try {
      const order = await createOrder(payload);
      setCreatedOrderId(order.id);
      draft.clear();
      // Sipariş stokları düşürdüğü için ürün listesi tazelenir.
      productPickerRef.current?.refetch();
    } catch (caught) {
      setFailure({
        message: toErrorMessage(caught),
        fieldErrors: caught instanceof ApiError ? caught.fieldErrors : undefined,
      });
    } finally {
      setSubmitState("idle");
    }
  };

  return (
    <>
      <div className="mb-10 border-b border-ink-200 pb-6">
        <p className="label-caps text-ink-400">Sipariş</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-ink-900 sm:text-4xl">
          Sipariş Oluştur
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-500">
          Ürünleri sepete ekleyin, miktarları belirleyin ve siparişi tamamlayın. Sipariş{" "}
          {DEFAULT_CUSTOMER_NAME.toLocaleLowerCase("tr-TR")} adına oluşturulur.
        </p>
      </div>

      {createdOrderId !== null && (
        <div className="mb-8">
          <Alert
            variant="success"
            title={`Sipariş #${createdOrderId} başarıyla oluşturuldu`}
            onClose={() => setCreatedOrderId(null)}
          >
            <Link
              to={`/orders/${createdOrderId}`}
              className="label-caps underline underline-offset-4"
            >
              Sipariş detayını gör
            </Link>
          </Alert>
        </div>
      )}

      {failure && (
        <div className="mb-8">
          <Alert variant="error" title={failure.message} onClose={() => setFailure(null)}>
            {failure.fieldErrors && (
              <ul className="list-inside list-disc">
                {Object.entries(failure.fieldErrors).map(([field, messages]) => (
                  <li key={field}>{messages.join(" ")}</li>
                ))}
              </ul>
            )}
          </Alert>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <ProductPicker
          ref={productPickerRef}
          quantityByProductId={draft.quantityByProductId}
          onSelect={draft.addProduct}
        />

        <form onSubmit={handleSubmit} noValidate className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-ink-900">
            <div className="flex items-center justify-between gap-3 bg-ink-900 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <StepBadge>2</StepBadge>
                <h2 className="label-caps">Sepetim</h2>
              </div>
              {itemCount > 0 && <span className="label-caps tabular-nums">{itemCount} adet</span>}
            </div>

            {draft.lines.length === 0 ? (
              <p className="px-5 py-14 text-center text-sm text-ink-400">
                Sepetiniz boş. Soldaki listeden ürün ekleyin.
              </p>
            ) : (
              <>
                <OrderDraftList
                  lines={draft.lines}
                  lineErrors={draft.errors.lines}
                  onQuantityChange={draft.setQuantity}
                  onRemove={draft.removeProduct}
                />

                <dl className="space-y-2.5 border-t border-ink-200 bg-ink-50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <dt className="label-caps text-ink-400">Ürün adedi</dt>
                    <dd className="text-sm tabular-nums text-ink-600">{itemCount}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="label-caps text-ink-900">Tahmini toplam</dt>
                    <dd className="text-xl font-black tabular-nums text-ink-900">
                      {formatCurrency(draft.estimatedTotal)}
                    </dd>
                  </div>
                </dl>
              </>
            )}

            {draft.errors.items && (
              <p className="border-t border-ink-200 px-5 pt-4 text-xs font-medium text-red-700">
                {draft.errors.items}
              </p>
            )}

            <div className="space-y-5 border-t border-ink-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="label-caps text-ink-400">Müşteri</span>
                <span className="text-sm font-medium text-ink-900">{DEFAULT_CUSTOMER_NAME}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="label-caps w-full bg-ink-900 px-4 py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-ink-700"
              >
                {isSubmitting ? "Gönderiliyor…" : "Siparişi Oluştur"}
              </button>

              {draft.lines.length > 0 && (
                <button
                  type="button"
                  onClick={draft.clear}
                  disabled={isSubmitting}
                  className="label-caps w-full text-center text-ink-400 transition-colors hover:text-ink-900 disabled:opacity-50"
                >
                  Sepeti temizle
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
