export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://hyphenconnect.onrender.com";

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? API_BASE_URL;

export const GEOAPIFY_KEY =
  import.meta.env.VITE_GEOAPIFY_KEY ?? "99988f75816f40b187881d406d9f3da0";

/** Resolve order id whether the API returns `id` or `_id`. */
export const resolveOrderId = (
  order: { id?: string; _id?: string } | null | undefined,
) => {
  if (!order) return null;
  return String(order.id ?? order._id ?? "");
};

export type GpsPayload = {
  driverId: string;
  orderId: string;
  lat: number;
  lng: number;
  timestamp?: number;
};

export const GPS_QUEUE_KEY = "gpsQueue";

export const readGpsQueue = (): GpsPayload[] => {
  try {
    return JSON.parse(localStorage.getItem(GPS_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const writeGpsQueue = (queue: GpsPayload[]) => {
  localStorage.setItem(GPS_QUEUE_KEY, JSON.stringify(queue));
};

export const enqueueGpsPoint = (point: GpsPayload) => {
  const queue = readGpsQueue();
  queue.push({ ...point, timestamp: point.timestamp ?? Date.now() });
  writeGpsQueue(queue);
};

export const clearGpsQueue = () => {
  localStorage.removeItem(GPS_QUEUE_KEY);
};

export const syncOfflineGpsQueue = async (
  driverId: string,
  orderId: string,
) => {
  const queue = readGpsQueue();
  if (queue.length === 0) return 0;

  const res = await fetch(`${API_BASE_URL}/api/v1/driver/location/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driverId, orderId, points: queue }),
  });

  if (!res.ok) throw new Error("Batch sync failed");

  clearGpsQueue();
  return queue.length;
};

export const fetchLastKnownLocation = async (orderId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/location`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.lat == null || data?.lng == null) return null;
  return { lat: data.lat as number, lng: data.lng as number };
};

/** Collect every possible order id from an order object. */
export const collectOrderIds = (order: Record<string, unknown>): string[] => {
  const ids = new Set<string>();
  const candidates = [
    order?.id,
    order?._id,
    order?.orderId,
    order?.order_id,
    order?.odooOrderId,
    order?.odoo_order_id,
    (order?.raw as Record<string, unknown> | undefined)?.id,
    (order?.raw as Record<string, unknown> | undefined)?._id,
    (order?.raw as Record<string, unknown> | undefined)?.odooOrderId,
    (order?.localOrder as Record<string, unknown> | undefined)?._id,
    (order?.localOrder as Record<string, unknown> | undefined)?.id,
  ];
  for (const c of candidates) {
    if (c != null && String(c).trim() !== "") {
      ids.add(String(c));
    }
  }
  return Array.from(ids);
};

/** Parse GPS coordinates from a socket/payload object. */
export const parseGpsCoords = (
  raw: Record<string, unknown>,
): { lat: number; lng: number } | null => {
  const lat = (raw.lat as number) ?? (raw.latitude as number);
  const lng =
    (raw.lng as number) ?? (raw.lon as number) ?? (raw.longitude as number);
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return null;
  }
  return { lat, lng };
};

/** Collect every possible order id from a socket/payload object. */
export const payloadOrderIds = (raw: Record<string, unknown>): string[] => {
  const ids = new Set<string>();
  const candidates = [
    raw?.orderId,
    raw?.order_id,
    raw?.id,
    raw?._id,
    raw?.odooOrderId,
    raw?.odoo_order_id,
    (raw?.order as Record<string, unknown> | undefined)?.id,
    (raw?.order as Record<string, unknown> | undefined)?._id,
    (raw?.order as Record<string, unknown> | undefined)?.orderId,
    (raw?.order as Record<string, unknown> | undefined)?.odooOrderId,
  ];
  for (const c of candidates) {
    if (c != null && String(c).trim() !== "") {
      ids.add(String(c));
    }
  }
  return Array.from(ids);
};
