import type { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 border border-ink-200 px-6 py-20 text-center">
      <span className="text-ink-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className="size-10">
          <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
          <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
        </svg>
      </span>
      <p className="max-w-sm text-sm text-ink-500">{message}</p>
      {action}
    </div>
  );
}
