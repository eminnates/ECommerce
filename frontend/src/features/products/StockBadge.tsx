const LOW_STOCK_THRESHOLD = 10;

interface StockBadgeProps {
  quantity: number;
}

export function StockBadge({ quantity }: StockBadgeProps) {
  const { className, label } = describeStock(quantity);

  return (
    <span className={`label-caps inline-flex items-center gap-1.5 ${className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function describeStock(quantity: number) {
  if (quantity === 0) {
    return { className: "text-red-700", label: "Tükendi" };
  }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return { className: "text-amber-700", label: `Son ${quantity} adet` };
  }
  return { className: "text-ink-400", label: `Stokta ${quantity} adet` };
}
