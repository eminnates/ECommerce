import { useCallback, useMemo, useState } from "react";
import type { CreateOrderRequest, Product } from "../../types/api";

export interface OrderDraftLine {
  /** Ürünün eklendiği andaki hali; fiyat sadece tahmini toplam için kullanılır. */
  product: Product;
  quantity: number;
}

export interface OrderDraftErrors {
  items?: string;
  /** productId -> hata mesajı */
  lines?: Record<number, string>;
}

/**
 * Uygulamada oturum/kimlik doğrulama yok, kullanıcıya müşteri adı sorulmuyor.
 * Backend `CustomerName` alanını zorunlu tuttuğu için sipariş bu sabit adla
 * gönderilir.
 */
export const DEFAULT_CUSTOMER_NAME = "Misafir Müşteri";

/**
 * Sipariş taslağının state'i ve iş kuralları. Component'ler sadece bu hook'un
 * döndürdüğü fonksiyonları çağırır; miktar/stok mantığı ekranlara dağılmaz.
 *
 * Kurallar backend'deki OrderService doğrulamalarının aynasıdır; amaç gereksiz
 * istek atmamaktır. Sunucudan gelen hata her durumda ayrıca gösterilir.
 */
export function useOrderDraft() {
  const [lines, setLines] = useState<OrderDraftLine[]>([]);
  const [errors, setErrors] = useState<OrderDraftErrors>({});

  const addProduct = useCallback((product: Product) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      // Backend aynı productId'li kalemleri birleştirdiği için UI de ikinci
      // satır açmak yerine miktarı artırır.
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: Math.min(line.quantity + 1, product.stockQuantity) }
            : line,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.product.id === productId
          ? { ...line, quantity: clampQuantity(quantity, line.product.stockQuantity) }
          : line,
      ),
    );
  }, []);

  const removeProduct = useCallback((productId: number) => {
    setLines((current) => current.filter((line) => line.product.id !== productId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setErrors({});
  }, []);

  /** Sadece ön izleme içindir; kesin tutarı sunucu hesaplar. */
  const estimatedTotal = useMemo(
    () => lines.reduce((total, line) => total + line.product.price * line.quantity, 0),
    [lines],
  );

  /** Ürün listesinde "sepette kaç adet var" rozetini göstermek için. */
  const quantityByProductId = useMemo(
    () => new Map(lines.map((line) => [line.product.id, line.quantity])),
    [lines],
  );

  /** Geçerliyse gönderilecek payload'ı, değilse null döner. */
  const validate = useCallback((): CreateOrderRequest | null => {
    const nextErrors: OrderDraftErrors = {};

    if (lines.length === 0) {
      nextErrors.items = "En az bir ürün seçmelisiniz.";
    }

    const lineErrors: Record<number, string> = {};
    for (const line of lines) {
      if (line.quantity < 1) {
        lineErrors[line.product.id] = "Miktar 0'dan büyük olmalıdır.";
      } else if (line.quantity > line.product.stockQuantity) {
        lineErrors[line.product.id] =
          `Stok yetersiz (mevcut: ${line.product.stockQuantity}).`;
      }
    }
    if (Object.keys(lineErrors).length > 0) nextErrors.lines = lineErrors;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      customerName: DEFAULT_CUSTOMER_NAME,
      items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
    };
  }, [lines]);

  return {
    lines,
    quantityByProductId,
    estimatedTotal,
    errors,
    addProduct,
    setQuantity,
    removeProduct,
    clear,
    validate,
  };
}

function clampQuantity(quantity: number, stockQuantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.trunc(quantity), 1), Math.max(stockQuantity, 1));
}
