export const formatDeliveryAddress = (order: {
  address?: string;
  city?: string;
  region?: string;
  landmark?: string;
  deliveryPreference?: string;
}) => {
  if ((order.deliveryPreference || "").toLowerCase() === "pickup") {
    return "Pickup";
  }

  const base = [order.address, order.city, order.region]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");
  const landmark = (order.landmark || "").trim();

  if (!landmark) return base;
  return base ? `${base} — Landmark: ${landmark}` : `Landmark: ${landmark}`;
};
