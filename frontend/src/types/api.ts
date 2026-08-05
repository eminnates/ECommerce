// Backend DTO'larının birebir karşılığı (ECommerce.API/Dtos).
// JSON camelCase olarak serialize edilir, alan adları burada da camelCase.

export interface Product {
  id: number;
  stockCode: string;
  name: string;
  price: number;
  stockQuantity: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  customerName: string;
  /** ISO-8601 UTC (örn. "2026-08-04T13:10:47.123Z") */
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
}

/** POST /api/orders gövdesi. Fiyat gönderilmez; sunucu kendi hesaplar. */
export interface CreateOrderRequest {
  customerName: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

/** Liste endpoint'lerinin ortak zarfı. `totalPages` alanı yok, hesaplanır. */
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}
