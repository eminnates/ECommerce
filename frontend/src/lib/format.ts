// Backend decimal alanları JSON number olarak gönderir; JS tarafında sondaki
// sıfırlar kaybolur (249.90 -> 249.9). Para her yerde bu yardımcı ile basılır.

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "-" : dateTimeFormatter.format(date);
}
