import { useState, useEffect } from "react";
import { Package, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getAllOrders } from "@/lib/Api";

export const ShopperDashboard = () => {
  const { setIsShopOpen } = useOutletContext<{
    setIsShopOpen: (open: boolean) => void;
  }>();
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const id = localStorage.getItem("id");
        console.log("[ShopperDashboard] Fetching orders for id:", id);
        if (!id) {
          console.warn("[ShopperDashboard] No id in localStorage");
          return;
        }
        const response = await getAllOrders(id);
        console.log("[ShopperDashboard] API response:", response?.data);
        if (response?.data?.data) {
          const fetchedOrders = response.data.data.map(
            (o: any, index: number) => ({
              id: `ORD-${1000 + index}`,
              date: o.createdAt || new Date().toISOString(),
              total: parseFloat(o.amount || "0"),
              status: o.status || "In Transit",
              items: o.orders,
              location: o.location,
              address: o.address,
              customerName: `${o.firstName} ${o.lastName}`,
              deliveryPreference: o.deliveryPreference || "delivery",
            }),
          );
          console.log("[ShopperDashboard] Parsed orders:", fetchedOrders);
          setAllOrders(fetchedOrders);
        } else {
          console.warn(
            "[ShopperDashboard] No data in response or different structure:",
            response,
          );
        }
      } catch (error) {
        console.error("[ShopperDashboard] Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const totalOrders = allOrders.length;
  const totalAmount = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const recentOrders = allOrders.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fh-navy">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here is your shopping overview.</p>
        </div>
        <Button
          onClick={() => setIsShopOpen(true)}
          className="bg-fh-navy hover:bg-fh-navyHover text-white"
        >
          Start Shopping
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-fh-orange rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-fh-navy">{totalOrders}</h3>
          <p className="text-sm text-gray-500 mt-1">Total Orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-fh-navy">
            GHS {totalAmount.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Total Amount</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-fh-navy">Recent Orders</h3>
          <button
            onClick={() => navigate("/shopper-portal/history")}
            className="text-xs font-medium text-fh-orange"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-fh-navy">{order.id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.date).toLocaleDateString() ===
                    "Invalid Date"
                      ? order.date
                      : new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-fh-navy">
                    GHS {order.total.toLocaleString()}
                  </p>
                  <p
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${order.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
