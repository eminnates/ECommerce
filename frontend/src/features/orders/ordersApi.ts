import { api } from "../../lib/apiClient";
import type { CreateOrderRequest, Order, PagedResult } from "../../types/api";

export interface OrderQuery {
  page?: number;
  pageSize?: number;
}

function buildQueryString({ page, pageSize }: OrderQuery): string {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function getOrders(query: OrderQuery, signal?: AbortSignal) {
  return api.get<PagedResult<Order>>(`/api/orders${buildQueryString(query)}`, signal);
}

export function getOrderById(id: number, signal?: AbortSignal) {
  return api.get<Order>(`/api/orders/${id}`, signal);
}

export function createOrder(payload: CreateOrderRequest) {
  return api.post<Order>("/api/orders", payload);
}
