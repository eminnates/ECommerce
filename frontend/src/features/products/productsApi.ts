import { api } from "../../lib/apiClient";
import type { PagedResult, Product } from "../../types/api";

export interface ProductQuery {
  /** Ürün adı veya stok kodunda aranır. */
  search?: string;
  page?: number;
  pageSize?: number;
}

function buildQueryString({ search, page, pageSize }: ProductQuery): string {
  const params = new URLSearchParams();
  // Boş arama parametresi hiç gönderilmez; backend zaten trim'liyor.
  if (search?.trim()) params.set("search", search.trim());
  if (page) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function getProducts(query: ProductQuery, signal?: AbortSignal) {
  return api.get<PagedResult<Product>>(`/api/products${buildQueryString(query)}`, signal);
}

export function getProductById(id: number, signal?: AbortSignal) {
  return api.get<Product>(`/api/products/${id}`, signal);
}
