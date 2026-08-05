interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="group relative border-b border-ink-300 transition-colors focus-within:border-ink-900">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-ink-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Ürün adı veya stok kodu ara"}
        aria-label="Ürün ara"
        className="label-caps w-full bg-transparent py-3 pl-7 pr-7 text-ink-900 outline-none placeholder:text-ink-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Aramayı temizle"
          className="absolute inset-y-0 right-0 flex items-center text-ink-400 transition-colors hover:text-ink-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
