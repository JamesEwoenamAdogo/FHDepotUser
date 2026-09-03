import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, FileText, MapPin, MoreHorizontal, RotateCcw } from "lucide-react";

type OrderHistoryListProps = {
  orders: any[];
  onReceipt: (order: any) => void;
  onDetails: (order: any) => void;
  onReorder: (order: any) => void;
  onTrack: (order: any) => void;
};

const formatOrderDate = (date: string) => {
  const parsed = new Date(date);
  return parsed.toLocaleDateString() === "Invalid Date"
    ? date
    : parsed.toLocaleDateString();
};

const productNames = (order: any) =>
  (order.items || order.orders || [])
    .map((item: any) => item.name)
    .filter(Boolean)
    .join(", ");

const canTrack = (order: any) =>
  (order.deliveryPreference || "").toLowerCase() !== "pickup";

const OrderActions = ({
  order,
  onReceipt,
  onDetails,
  onReorder,
  onTrack,
}: {
  order: any;
} & Omit<OrderHistoryListProps, "orders">) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-3 text-xs font-medium border-gray-200"
      >
        Actions
        <MoreHorizontal className="w-4 h-4 ml-1.5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuItem onClick={() => onReorder(order)}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Reorder
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onReceipt(order)}>
        <FileText className="w-4 h-4 mr-2" />
        Receipt
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onDetails(order)}>
        <Eye className="w-4 h-4 mr-2" />
        Details
      </DropdownMenuItem>
      {canTrack(order) && (
        <DropdownMenuItem onClick={() => onTrack(order)}>
          <MapPin className="w-4 h-4 mr-2" />
          Track
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const OrderHistoryList = ({
  orders,
  onReceipt,
  onDetails,
  onReorder,
  onTrack,
}: OrderHistoryListProps) => {
  if (orders.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10 text-sm">
        No orders found for this period.
      </p>
    );
  }

  const actions = { onReceipt, onDetails, onReorder, onTrack };

  return (
    <>
      <div className="space-y-3 md:hidden">
        {orders.map((order, i) => {
          const names = productNames(order);
          return (
            <div
              key={order._id || order.id || i}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-fh-navy truncate">{order.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatOrderDate(order.date)}
                  </p>
                </div>
                <p className="font-bold text-fh-navy shrink-0">
                  GHS {Number(order.total || 0).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2" title={names}>
                {names || "No products listed"}
              </p>
              <div className="flex items-center justify-between gap-2 mt-3">
                <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
                  {(order.deliveryPreference || "delivery").replace(/_/g, " ")}
                </span>
                <OrderActions order={order} {...actions} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-y border-gray-100">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Date Ordered</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order, i) => {
              const names = productNames(order);
              return (
                <tr
                  key={order._id || order.id || i}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium text-fh-navy">{order.id}</p>
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatOrderDate(order.date)}
                  </td>
                  <td
                    className="p-4 text-gray-600 max-w-[280px] truncate"
                    title={names}
                  >
                    {names}
                  </td>
                  <td className="p-4 font-medium text-fh-navy whitespace-nowrap">
                    GHS {Number(order.total || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <OrderActions order={order} {...actions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
