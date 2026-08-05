import { useCallback, useEffect, useState } from "react";
import { isAbortError, toErrorMessage } from "../../lib/apiClient";
import type { PagedResult, Product } from "../../types/api";
import { getProducts, type ProductQuery } from "./productsApi";

interface UseProductsResult {
  data: PagedResult<Product> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Ürün listesini çeker. search/page değiştiğinde yeniden istek atar ve
 * önceki isteği iptal ederek geç dönen cevabın listeyi ezmesini engeller.
 */
export function useProducts({ search, page, pageSize }: ProductQuery): UseProductsResult {
  const [data, setData] = useState<PagedResult<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    getProducts({ search, page, pageSize }, controller.signal)
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return; // Yeni istek başladı, state'e dokunma.
        setError(toErrorMessage(caught));
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [search, page, pageSize, reloadKey]);

  return { data, isLoading, error, refetch };
}
