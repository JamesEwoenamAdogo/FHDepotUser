import type { CartItem, ReorderDraft } from "@/context/CartContext";

export const orderLineItems = (order: any): any[] =>
  order?.items || order?.orders || [];

export const toCartItems = (order: any): CartItem[] =>
  orderLineItems(order)
    .filter((item: any) => item?.name)
    .map((item: any) => ({
      id: String(item.id ?? item._id ?? item.name),
      name: String(item.name),
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      image: item.image || undefined,
    }));

export const toReorderDraft = (order: any): ReorderDraft => {
  const firstName =
    order.firstName ||
    String(order.customerName || "")
      .trim()
      .split(" ")[0] ||
    "";
  const lastName =
    order.lastName ||
    String(order.customerName || "").trim().split(" ").slice(1).join(" ") ||
    "";

  const rawAddress =
    order.streetAddress ||
    (typeof order.address === "string" && !order.address.includes("Landmark:")
      ? order.address
      : "") ||
    "";

  return {
    firstName,
    lastName,
    phone: order.phone || order.customerPhone || "",
    email: order.email || "",
    address: rawAddress,
    landmark: order.landmark || "",
    city: order.city || "",
    region: order.region || "",
    lat: Number(order.location?.lat ?? order.lat ?? 0) || 0,
    lon: Number(order.location?.lon ?? order.location?.lng ?? order.lng ?? 0) || 0,
    deliveryPreference:
      (order.deliveryPreference || "").toLowerCase() === "pickup"
        ? "pickup"
        : "delivery",
  };
};
