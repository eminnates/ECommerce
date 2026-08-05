import type { ReactNode } from "react";

type AlertVariant = "success" | "error" | "info";

interface AlertProps {
  variant: AlertVariant;
  title: string;
  children?: ReactNode;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; accent: string }> = {
  success: { container: "border-ink-900 bg-ink-900 text-white", accent: "text-white/60" },
  error: { container: "border-red-800 bg-red-50 text-red-900", accent: "text-red-700" },
  info: { container: "border-ink-300 bg-ink-50 text-ink-900", accent: "text-ink-500" },
};

export function Alert({ variant, title, children, onClose }: AlertProps) {
  const style = variantStyles[variant];

  return (
    <div className={`flex items-start gap-4 border px-5 py-4 ${style.container}`} role="alert">
      <div className="flex-1">
        <p className="label-caps">{title}</p>
        {children && <div className="mt-2 text-sm">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className={`shrink-0 transition-opacity hover:opacity-100 ${style.accent}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
