import { useCallback, useEffect, useState } from "react";
import { isAbortError, toErrorMessage } from "../../lib/apiClient";
import type { Order } from "../../types/api";
import { getOrderById } from "./ordersApi";

interface UseOrderResult {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Tek bir siparişin detayını çeker. Geçersiz id için istek atılmaz. */
export function useOrder(id: number | null): UseOrderResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (id === null) {
      setOrder(null);
      setError("Geçersiz sipariş numarası.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    getOrderById(id, controller.signal)
      .then((result) => {
        setOrder(result);
        setIsLoading(false);
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return;
        setError(toErrorMessage(caught));
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  return { order, isLoading, error, refetch };
}
