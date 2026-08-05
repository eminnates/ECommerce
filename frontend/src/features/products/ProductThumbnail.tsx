import { getProductImageUrl } from "./productImages";

/** Görseli olmayan ürünler için sabit kalan grafik yer tutucu paleti. */
const SWATCHES = [
  { bg: "bg-ink-900", fg: "text-white" },
  { bg: "bg-[#c8471f]", fg: "text-white" },
  { bg: "bg-[#1f3a5f]", fg: "text-white" },
  { bg: "bg-[#d9c47a]", fg: "text-ink-900" },
  { bg: "bg-[#3f5c46]", fg: "text-white" },
  { bg: "bg-ink-200", fg: "text-ink-900" },
];

type ThumbnailSize = "sm" | "md" | "lg";

interface ProductThumbnailProps {
  /** Görsel eşleştirmesi ve yer tutucu rengi bu id'den türetilir. */
  productId: number;
  name: string;
  size?: ThumbnailSize;
}

const sizeStyles: Record<ThumbnailSize, string> = {
  sm: "size-14 text-sm",
  md: "size-20 text-base",
  lg: "aspect-3/4 w-full text-5xl",
};

export function ProductThumbnail({ productId, name, size = "md" }: ProductThumbnailProps) {
  const imageUrl = getProductImageUrl(productId);

  if (imageUrl) {
    return (
      <div className={`flex shrink-0 items-center justify-center bg-white ${sizeStyles[size]}`}>
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          // Görseller beyaz zeminli ürün çekimleri: kırpmak yerine sığdırılır.
          className={`size-full object-contain ${size === "lg" ? "p-6" : "p-1"}`}
        />
      </div>
    );
  }

  const swatch = SWATCHES[productId % SWATCHES.length];

  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${swatch.bg} ${swatch.fg} ${sizeStyles[size]}`}
    >
      <span className="font-black uppercase tracking-[0.1em] opacity-90">{getInitials(name)}</span>
      {size === "lg" && (
        <span className="label-caps absolute bottom-3 left-3 opacity-60">{name}</span>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  // "27 inç Monitör" -> "İM": sayıyla başlayan kelimeler baş harf olmaz.
  const words = name.split(/\s+/).filter((word) => /^\p{L}/u.test(word));
  const source = words.length > 0 ? words : [name];

  return source
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}
