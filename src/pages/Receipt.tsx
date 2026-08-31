import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  amount: number;
}

interface ReceiptPayload {
  orderNumber?: string;
  customer?: string;
  phone?: string;
  email?: string;
  address?: string;
  preference?: string;
  pickupDateTime?: string;
  date?: string;
  reference?: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  total?: number;
  items?: ReceiptItem[];
}

const Receipt = () => {
  const [searchParams] = useSearchParams();

  let order: ReceiptPayload | null = null;

  try {
    const raw = searchParams.get("d");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Support both full-length keys (legacy) and shortened keys (current)
      order = {
        orderNumber: parsed.o ?? parsed.orderNumber,
        customer: parsed.c ?? parsed.customer,
        phone: parsed.p ?? parsed.phone,
        email: parsed.e ?? parsed.email,
        address: parsed.a ?? parsed.address,
        preference: parsed.pr ?? parsed.preference,
        pickupDateTime: parsed.pdt ?? parsed.pickupDateTime,
        date: parsed.d ?? parsed.date,
        reference: parsed.r ?? parsed.reference,
        subtotal: parsed.s ?? parsed.subtotal,
        shipping: parsed.sh ?? parsed.shipping,
        discount: parsed.di ?? parsed.discount,
        total: parsed.t ?? parsed.total,
        items: (parsed.i ?? parsed.items ?? []).map((it: any) => ({
          name: it.n ?? it.name,
          quantity: it.q ?? it.quantity,
          price: it.u ?? it.price,
          amount: it.am ?? it.amount,
        })),
      };
    }
  } catch (e) {
    console.error("Failed to parse receipt data", e);
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Invalid Receipt</h2>
        <p className="text-gray-500">The receipt data could not be read.</p>
        <Button asChild className="bg-fh-navy hover:bg-fh-navyHover text-white">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-fh-navy">Order Receipt</h1>
          <p className="text-gray-500 text-sm mt-1">
            FH Depot — We Only Deal In Quality
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img
                  src="https://vibe.filesafe.space/1780236389749984913/attachments/809b19a9-8db3-41ef-8e2b-ee2230432b08.png"
                  alt="FH Depot"
                  className="h-7 object-contain"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                42 Haatso-Atomic Rd, Greater Accra, Ghana
              </p>
              <p className="text-[11px] text-gray-500">Tax ID: CS165452018</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-800">Receipt</h3>
              <p className="text-xs text-gray-500">
                {order.orderNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Customer + Meta */}
          <div className="px-8 py-4 bg-gray-50 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Customer
              </p>
              <p className="text-gray-800 font-medium">
                {order.customer || "N/A"}
              </p>
              <p className="text-gray-500 text-xs">{order.phone || ""}</p>
              {order.email && order.email !== "N/A" && (
                <p className="text-gray-500 text-xs">{order.email}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Date
              </p>
              <p className="text-gray-800 text-xs">{order.date || "N/A"}</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase mt-2">
                Reference
              </p>
              <p className="text-gray-800 text-xs">
                {order.reference || "N/A"}
              </p>
            </div>
          </div>

          {/* Preference */}
          <div className="px-8 py-3 border-b border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Preference:</span>
            <span className="font-medium text-gray-800 capitalize">
              {order.preference || "N/A"}
              {order.preference === "pickup" &&
                order.pickupDateTime &&
                ` — ${order.pickupDateTime}`}
            </span>
          </div>
          {order.preference === "delivery" && order.address && (
            <div className="px-8 py-3 border-b border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%]">
                {order.address}
              </span>
            </div>
          )}

          {/* Line items */}
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#6B4A18" }}>
                <th className="text-left px-8 py-2.5 text-white font-medium">
                  Description
                </th>
                <th className="text-right px-4 py-2.5 text-white font-medium">
                  Qty
                </th>
                <th className="text-right px-4 py-2.5 text-white font-medium">
                  Unit Price
                </th>
                <th className="text-right px-8 py-2.5 text-white font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="px-8 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    GHS {Number(item.price).toFixed(2)}
                  </td>
                  <td className="px-8 py-3 text-right text-gray-800 font-medium">
                    GHS {Number(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#C8860A" }}>
                <td
                  colSpan={3}
                  className="px-8 py-2.5 text-right text-white font-bold"
                >
                  Total
                </td>
                <td className="px-8 py-2.5 text-right text-white font-bold">
                  GHS {Number(order.total || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Summary */}
          <div className="px-8 py-4 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>GHS {Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {Number(order.shipping || 0) > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>GHS {Number(order.shipping).toFixed(2)}</span>
              </div>
            )}
            {Number(order.discount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- GHS {Number(order.discount).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <Button
            asChild
            className="bg-fh-navy hover:bg-fh-navyHover text-white"
          >
            <Link to="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
