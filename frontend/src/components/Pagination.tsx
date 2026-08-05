interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

/** Backend totalPages döndürmediği için burada hesaplanır. */
export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalCount === 0) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);

  const buttonClass =
    "label-caps border border-ink-900 px-5 py-2.5 text-ink-900 transition-colors disabled:cursor-not-allowed disabled:border-ink-200 disabled:text-ink-300 enabled:hover:bg-ink-900 enabled:hover:text-white";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-6">
      <p className="label-caps text-ink-400">
        {firstItem}–{lastItem} / {totalCount} kayıt
      </p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={buttonClass}>
          Önceki
        </button>
        <span className="label-caps text-ink-900 tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={buttonClass}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
