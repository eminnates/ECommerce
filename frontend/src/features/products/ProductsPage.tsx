import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Pagination } from "../../components/Pagination";
import { SearchInput } from "../../components/SearchInput";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { useProducts } from "./useProducts";

const PAGE_SIZE = 12;

export function ProductsPage() {
  // Arama ve sayfa URL'de tutulur: yenilemede kaybolmaz, link paylaşılabilir.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput);

  // Arama değiştiğinde her zaman ilk sayfaya dönülür.
  useEffect(() => {
    if (debouncedSearch === search) return;
    setSearchParams(debouncedSearch ? { search: debouncedSearch } : {}, { replace: true });
  }, [debouncedSearch, search, setSearchParams]);

  const { data, isLoading, error, refetch } = useProducts({
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const goToPage = (nextPage: number) => {
    const next: Record<string, string> = { page: String(nextPage) };
    if (search) next.search = search;
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section className="border-b border-ink-200 pb-10">
        <p className="label-caps text-ink-400">Koleksiyon</p>
        <h1 className="mt-3 text-5xl font-black uppercase leading-[0.95] tracking-tight text-ink-900 sm:text-7xl">
          Tüm
          <br />
          Ürünler
        </h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-sm text-sm text-ink-500">
            Güncel fiyat ve stok bilgisiyle kataloğu inceleyin. Ürün adı ya da stok koduyla arayın.
          </p>
          <div className="w-full sm:w-80">
            <SearchInput value={searchInput} onChange={setSearchInput} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-baseline justify-between gap-3 py-6">
        <h2 className="label-caps text-ink-900">
          {search ? `"${search}" için sonuçlar` : "Katalog"}
        </h2>
        {data && <p className="label-caps text-ink-400">{data.totalCount} ürün</p>}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : isLoading && !data ? (
        <ProductGrid>
          {Array.from({ length: 8 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </ProductGrid>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          message={
            search
              ? `"${search}" aramasıyla eşleşen ürün bulunamadı.`
              : "Henüz ürün bulunmuyor."
          }
          action={
            search ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="label-caps border border-ink-900 px-5 py-2.5 text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
              >
                Aramayı temizle
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Arama sırasında grid yerinde kalır, sadece soluklaşır. */}
          <div className={isLoading ? "opacity-40 transition-opacity" : "transition-opacity"}>
            <ProductGrid>
              {data.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  action={
                    <Link
                      to="/orders/new"
                      className="label-caps block bg-white px-4 py-3 text-center text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                    >
                      Sipariş oluştur
                    </Link>
                  }
                />
              ))}
            </ProductGrid>
          </div>

          <div className="mt-12">
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              onPageChange={goToPage}
            />
          </div>
        </>
      )}
    </>
  );
}

function ProductGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
  );
}
