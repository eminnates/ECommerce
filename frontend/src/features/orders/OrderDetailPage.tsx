import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/ErrorState";
import { Spinner } from "../../components/Spinner";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { ProductThumbnail } from "../products/ProductThumbnail";
import { useOrder } from "./useOrder";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { order, isLoading, error, refetch } = useOrder(Number.isInteger(orderId) ? orderId : null);

  const backLink = (
    <Link
      to="/orders"
      className="label-caps inline-flex items-center gap-2 text-ink-500 transition-colors hover:text-ink-900"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
        <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Siparişlere dön
    </Link>
  );

  if (isLoading) return <Spinner label="Sipariş yükleniyor…" />;
  if (error || !order) {
    return <ErrorState message={error ?? "Sipariş bulunamadı."} onRetry={refetch} action={backLink} />;
  }

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">{backLink}</div>

      <article className="border border-ink-900">
        <header className="bg-ink-900 px-6 py-8 text-white sm:px-8">
          <p className="label-caps text-white/50">Sipariş Özeti</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">Sipariş #{order.id}</h1>

          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            <SummaryField label="Müşteri" value={order.customerName} />
            <SummaryField label="Oluşturulma" value={formatDateTime(order.createdAt)} />
            <SummaryField label="Toplam Tutar" value={formatCurrency(order.totalAmount)} emphasized />
          </dl>
        </header>

        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-5 sm:px-8">
          <h2 className="label-caps text-ink-900">Sipariş Kalemleri</h2>
          <span className="label-caps text-ink-400 tabular-nums">
            {order.items.length} ürün · {itemCount} adet
          </span>
        </div>

        <ul className="divide-y divide-ink-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-5 px-6 py-5 sm:px-8">
              <ProductThumbnail productId={item.productId} name={item.productName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{item.productName}</p>
                <p className="mt-1 text-xs tabular-nums text-ink-400">
                  {item.quantity} adet × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-bold tabular-nums text-ink-900">
                {formatCurrency(item.lineTotal)}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between border-t border-ink-900 px-6 py-6 sm:px-8">
          <span className="label-caps text-ink-900">Genel Toplam</span>
          <span className="text-2xl font-black tabular-nums text-ink-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </article>
    </div>
  );
}

interface SummaryFieldProps {
  label: string;
  value: string;
  emphasized?: boolean;
}

function SummaryField({ label, value, emphasized }: SummaryFieldProps) {
  return (
    <div>
      <dt className="label-caps text-white/50">{label}</dt>
      <dd className={`mt-1.5 ${emphasized ? "text-xl font-black tabular-nums" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
