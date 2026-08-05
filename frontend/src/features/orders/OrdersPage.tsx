import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { Spinner } from "../../components/Spinner";
import { formatCurrency, formatDateTime } from "../../lib/format";
import type { Order } from "../../types/api";
import { useOrders } from "./useOrders";

const PAGE_SIZE = 10;

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error, refetch } = useOrders({ page, pageSize: PAGE_SIZE });

  const newOrderLink = (
    <Link
      to="/orders/new"
      className="label-caps border border-ink-900 bg-ink-900 px-6 py-3 text-white transition-colors hover:bg-ink-700"
    >
      Yeni Sipariş
    </Link>
  );

  return (
    <>
      <PageHeader
        eyebrow="Hesabım"
        title="Siparişler"
        description="En yeni siparişler üstte listelenir."
        actions={newOrderLink}
      />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : isLoading && !data ? (
        <Spinner label="Siparişler yükleniyor…" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          message="Henüz sipariş oluşturulmadı. İlk siparişinizi oluşturarak başlayın."
          action={newOrderLink}
        />
      ) : (
        <div className={isLoading ? "opacity-40 transition-opacity" : "transition-opacity"}>
          <ul className="border-t border-ink-200">
            {data.items.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>

          <div className="mt-10">
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              onPageChange={(nextPage) => setSearchParams({ page: String(nextPage) })}
            />
          </div>
        </div>
      )}
    </>
  );
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const productNames = order.items.map((item) => item.productName).join(", ");

  return (
    <li className="border-b border-ink-200">
      <Link
        to={`/orders/${order.id}`}
        className="group flex flex-wrap items-center gap-x-8 gap-y-4 py-6 transition-colors hover:bg-ink-50"
      >
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <span className="flex size-14 shrink-0 items-center justify-center bg-ink-900 text-sm font-bold text-white">
            #{order.id}
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-ink-900">{order.customerName}</p>
            <p className="mt-0.5 truncate text-xs text-ink-400">{productNames}</p>
          </div>
        </div>

        <Field label="Tarih" value={formatDateTime(order.createdAt)} />
        <Field label="Kalem" value={`${order.items.length} ürün · ${itemCount} adet`} />

        <div className="text-right">
          <p className="label-caps text-ink-400">Toplam</p>
          <p className="mt-1 text-lg font-black tabular-nums text-ink-900">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>

        <span className="text-ink-300 transition-transform group-hover:translate-x-1" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5">
            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-caps text-ink-400">{label}</p>
      <p className="mt-1 text-sm tabular-nums text-ink-600">{value}</p>
    </div>
  );
}
