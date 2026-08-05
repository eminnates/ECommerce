import { QuantityInput } from "../../components/QuantityInput";
import { formatCurrency } from "../../lib/format";
import { ProductThumbnail } from "../products/ProductThumbnail";
import type { OrderDraftLine } from "./useOrderDraft";

interface OrderDraftListProps {
  lines: OrderDraftLine[];
  lineErrors?: Record<number, string>;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

/** Sepetteki kalemler. Sağdaki dar panele sığacak şekilde liste olarak dizilir. */
export function OrderDraftList({
  lines,
  lineErrors,
  onQuantityChange,
  onRemove,
}: OrderDraftListProps) {
  return (
    <ul className="divide-y divide-ink-100">
      {lines.map((line) => {
        const error = lineErrors?.[line.product.id];
        return (
          <li key={line.product.id} className="flex gap-4 px-5 py-5">
            <ProductThumbnail productId={line.product.id} name={line.product.name} size="sm" />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="label-caps text-ink-300">{line.product.stockCode}</p>
                  <p className="mt-1 truncate text-sm font-medium text-ink-900">
                    {line.product.name}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-ink-400">
                    {formatCurrency(line.product.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(line.product.id)}
                  aria-label={`${line.product.name} ürününü sepetten kaldır`}
                  className="shrink-0 text-ink-300 transition-colors hover:text-red-700"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
                    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <QuantityInput
                  value={line.quantity}
                  max={line.product.stockQuantity}
                  onChange={(quantity) => onQuantityChange(line.product.id, quantity)}
                />
                <span className="text-sm font-bold tabular-nums text-ink-900">
                  {formatCurrency(line.product.price * line.quantity)}
                </span>
              </div>

              {error && <p className="mt-2.5 text-xs font-medium text-red-700">{error}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
