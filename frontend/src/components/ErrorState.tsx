import type { ReactNode } from "react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

/** API hatalarının kullanıcıya gösterildiği ortak blok. */
export function ErrorState({ message, onRetry, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 border border-red-300 bg-red-50/60 px-6 py-16 text-center">
      <span className="text-red-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-9">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6M12 16.5v.5" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <p className="label-caps text-red-800">Bir hata oluştu</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-red-800">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="label-caps border border-red-800 bg-red-800 px-5 py-2.5 text-white transition-colors hover:bg-red-900"
          >
            Tekrar dene
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
