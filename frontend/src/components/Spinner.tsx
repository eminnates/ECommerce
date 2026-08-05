interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "Yükleniyor…" }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-ink-400" role="status">
      <span className="size-4 animate-spin rounded-full border border-ink-200 border-t-ink-900" />
      <span className="label-caps">{label}</span>
    </div>
  );
}
