/**
 * API ürün görseli döndürmüyor. Katalog görselleri `public/` altında duruyor ve
 * burada ürün id'si ile eşleştiriliyor — sipariş kalemleri (OrderItemDto) yalnızca
 * productId taşıdığı için tüm ekranlarda çalışan tek ortak anahtar bu.
 * Eşleşmeyen ürünler grafik yer tutucuya düşer.
 */
const IMAGE_BY_PRODUCT_ID: Record<number, string> = {
  1: "/images.webp", // Kablosuz Mouse
  2: "/mekanik_klavye.webp", // Mekanik Klavye
  3: "/monitor.webp", // 27 inç Monitör
  4: "/usbC.webp", // USB-C Hub
  5: "/bluetooth-kablosuz-kulaklik.webp", // Kablosuz Kulaklık
};

export function getProductImageUrl(productId: number): string | undefined {
  return IMAGE_BY_PRODUCT_ID[productId];
}
