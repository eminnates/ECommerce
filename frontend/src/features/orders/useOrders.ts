import { useCallback, useEffect, useState } from "react";
import { isAbortError, toErrorMessage } from "../../lib/apiClient";
import type { Order, PagedResult } from "../../types/api";
import { getOrders, type OrderQuery } from "./ordersApi";

interface UseOrdersResult {
  data: PagedResult<Order> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrders({ page, pageSize }: OrderQuery): UseOrdersResult {
  const [data, setData] = useState<PagedResult<Order> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    getOrders({ page, pageSize }, controller.signal)
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return;
        setError(toErrorMessage(caught));
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, pageSize, reloadKey]);

  return { data, isLoading, error, refetch };
}
