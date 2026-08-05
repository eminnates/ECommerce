import type { ReactNode } from "react";
import { formatCurrency } from "../../lib/format";
import type { Product } from "../../types/api";
import { ProductThumbnail } from "./ProductThumbnail";
import { StockBadge } from "./StockBadge";

interface ProductCardProps {
  product: Product;
  /** Karta özel aksiyon (örn. "Sepete Ekle"), görselin alt kenarında durur. */
  action?: ReactNode;
  /**
   * Katalogda aksiyon ikincil olduğu için masaüstünde hover ile açılır.
   * Sipariş ekranında ana aksiyon olduğundan hep görünür tutulur.
   */
  alwaysShowAction?: boolean;
}

export function ProductCard({ product, action, alwaysShowAction }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <article className="group">
      {/* İnce çerçeve, beyaz zeminli ürün fotoğraflarının kenarını belirgin tutar. */}
      <div className="relative overflow-hidden border border-ink-100 bg-ink-50">
        <div className="transition-transform duration-500 group-hover:scale-[1.03]">
          <ProductThumbnail productId={product.id} name={product.name} size="lg" />
        </div>

        {isOutOfStock && (
          <span className="label-caps absolute left-0 top-3 bg-ink-900 px-3 py-1.5 text-white">
            Tükendi
          </span>
        )}

        {action && (
          <div
            className={`absolute inset-x-0 bottom-0 p-3 transition-all duration-300 ${
              alwaysShowAction
                ? ""
                : "sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            }`}
          >
            {action}
          </div>
        )}
      </div>

      <div className="pt-3.5">
        <p className="label-caps text-ink-300">{product.stockCode}</p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-medium text-ink-900">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-bold tabular-nums text-ink-900">
            {formatCurrency(product.price)}
          </p>
          <StockBadge quantity={product.stockQuantity} />
        </div>
      </div>
    </article>
  );
}

/** Yükleme sırasında grid'in yerinde durması için iskelet kart. */
export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-3/4 w-full animate-pulse bg-ink-100" />
      <div className="space-y-2 pt-3.5">
        <div className="h-2.5 w-16 animate-pulse bg-ink-100" />
        <div className="h-3.5 w-3/4 animate-pulse bg-ink-100" />
        <div className="h-3.5 w-20 animate-pulse bg-ink-100" />
      </div>
    </div>
  );
}
