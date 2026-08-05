import { useImperativeHandle, useState, type ReactNode, type Ref } from "react";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Pagination } from "../../components/Pagination";
import { SearchInput } from "../../components/SearchInput";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { ProductCard, ProductCardSkeleton } from "../products/ProductCard";
import { useProducts } from "../products/useProducts";
import type { Product } from "../../types/api";

const PAGE_SIZE = 6;

export interface ProductPickerHandle {
  /** Sipariş oluşturulduktan sonra stokların tazelenmesi için kullanılır. */
  refetch: () => void;
}

interface ProductPickerProps {
  quantityByProductId: Map<number, number>;
  onSelect: (product: Product) => void;
  ref?: Ref<ProductPickerHandle>;
}

export function ProductPicker({ quantityByProductId, onSelect, ref }: ProductPickerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchInput);

  const { data, isLoading, error, refetch } = useProducts({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  });

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-ink-200 pb-5">
        <div className="flex items-center gap-3">
          <StepBadge>1</StepBadge>
          <h2 className="text-lg font-black uppercase tracking-tight text-ink-900">Ürün seçin</h2>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput value={searchInput} onChange={handleSearchChange} />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : isLoading && !data ? (
        <PickerGrid>
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </PickerGrid>
      ) : !data || data.items.length === 0 ? (
        <EmptyState message="Aramanızla eşleşen ürün bulunamadı." />
      ) : (
        <>
          <div className={isLoading ? "opacity-40 transition-opacity" : "transition-opacity"}>
            <PickerGrid>
              {data.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  alwaysShowAction
                  action={
                    <AddToCartButton
                      product={product}
                      quantityInCart={quantityByProductId.get(product.id) ?? 0}
                      onSelect={onSelect}
                    />
                  }
                />
              ))}
            </PickerGrid>
          </div>

          <div className="mt-10">
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </section>
  );
}

function PickerGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">{children}</div>;
}

interface AddToCartButtonProps {
  product: Product;
  quantityInCart: number;
  onSelect: (product: Product) => void;
}

function AddToCartButton({ product, quantityInCart, onSelect }: AddToCartButtonProps) {
  if (product.stockQuantity === 0) {
    return (
      <button
        type="button"
        disabled
        className="label-caps block w-full cursor-not-allowed bg-white/80 px-4 py-3 text-center text-ink-400"
      >
        Tükendi
      </button>
    );
  }

  const isFull = quantityInCart >= product.stockQuantity;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      disabled={isFull}
      title={isFull ? "Sepetteki miktar mevcut stoğa eşit." : undefined}
      className={`label-caps block w-full px-4 py-3 text-center transition-colors disabled:cursor-not-allowed ${
        quantityInCart > 0
          ? "bg-ink-900 text-white disabled:opacity-60 enabled:hover:bg-ink-700"
          : "bg-white text-ink-900 enabled:hover:bg-ink-900 enabled:hover:text-white"
      }`}
    >
      {quantityInCart > 0 ? `Sepette · ${quantityInCart}` : "Sepete Ekle"}
    </button>
  );
}

export function StepBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-7 items-center justify-center bg-ink-900 text-xs font-bold text-white">
      {children}
    </span>
  );
}
