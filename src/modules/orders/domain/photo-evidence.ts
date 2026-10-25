export const PHOTO_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export function isOrderBlobUrl(value: string, orderId: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.startsWith(`/delivery-evidence/${orderId}/`)
    );
  } catch {
    return false;
  }
}
