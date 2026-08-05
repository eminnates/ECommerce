interface QuantityInputProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

/**
 * Miktar girişi. Boş/geçersiz giriş 1'e, stok üstü giriş stok miktarına
 * çekilir; clamp mantığı çağıran hook'ta değil burada tek yerde tutulur.
 */
export function QuantityInput({ value, max, onChange }: QuantityInputProps) {
  const handleChange = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    onChange(parsed);
  };

  const stepperClass =
    "flex size-8 items-center justify-center text-ink-500 transition-colors disabled:opacity-25 enabled:hover:bg-ink-900 enabled:hover:text-white";

  return (
    <div className="inline-flex items-center border border-ink-300">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Miktarı azalt"
        className={stepperClass}
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={max}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={(event) => {
          if (event.target.value === "") onChange(1);
        }}
        aria-label="Miktar"
        className="w-10 border-x border-ink-200 py-1.5 text-center text-sm font-semibold tabular-nums outline-none focus:bg-ink-50"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Miktarı artır"
        className={stepperClass}
      >
        +
      </button>
    </div>
  );
}
