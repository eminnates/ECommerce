import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Başlığın üstündeki küçük uppercase etiket. */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-ink-200 pb-6">
      <div>
        {eyebrow && <p className="label-caps text-ink-400">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-xl text-sm text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
