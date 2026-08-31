import { useState, useEffect } from "react";
import { Package, TrendingUp, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getAllOrders } from "@/lib/Api";

export const WholesalerDashboard = () => {
  const { setIsShopOpen } = useOutletContext<{
    setIsShopOpen: (open: boolean) => void;
  }>();
  const navigate = useNavigate();
  const [statsMonth, setStatsMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [statsYear, setStatsYear] = useState<number>(new Date().getFullYear());
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isCallPopupOpen, setIsCallPopupOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const id = localStorage.getItem("id");
        console.log("[WholesalerDashboard] Fetching orders for id:", id);
        if (!id) {
          console.warn("[WholesalerDashboard] No id in localStorage");
          return;
        }
        const response = await getAllOrders(id);
        console.log("[WholesalerDashboard] API response:", response?.data);
        if (response?.data?.data) {
          const fetchedOrders = response.data.data.map(
            (o: any, index: number) => ({
              id: `ORD-${1000 + index}`,
              date: o.createdAt || new Date().toISOString(),
              total: parseFloat(o.amount || "0"),
              status: o.status || "In Transit",
              items: o.orders,
              location: o.location,
              lat: parseFloat(o.location?.lat || o.lat || "0"),
              lng: parseFloat(
                o.location?.lon || o.location?.lng || o.lon || "0",
              ),
              address: o.address,
              customerName: `${o.firstName} ${o.lastName}`,
              deliveryPreference: o.deliveryPreference || "delivery",
            }),
          );
          console.log("[WholesalerDashboard] Parsed orders:", fetchedOrders);
          setAllOrders(fetchedOrders);
        } else {
          console.warn(
            "[WholesalerDashboard] No data in response or different structure:",
            response,
          );
        }
      } catch (error) {
        console.error("[WholesalerDashboard] Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = allOrders.filter((o) => {
    const d = new Date(o.date);
    return d.getMonth() + 1 === statsMonth && d.getFullYear() === statsYear;
  });

  const totalOrders = allOrders.length;
  const totalAmount = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = allOrders.filter(
    (o) => (o.status || "").toLowerCase() === "pending",
  ).length;
  const recentOrders = allOrders.slice(0, 3);
  console.log(
    "[WholesalerDashboard] totalOrders:",
    totalOrders,
    "totalAmount:",
    totalAmount,
    "allOrders:",
    allOrders,
  );

  const handleTrackOrder = (order: any) => {
    navigate("/wholesale-portal/tracking", { state: { order } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fh-navy">
            Welcome back, {localStorage.getItem("contactPerson") || "Trade"}
          </h1>
          <p className="text-gray-600 mt-1">
            Here is what's happening with your wholesale account today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <select
              value={statsMonth}
              onChange={(e) => setStatsMonth(Number(e.target.value))}
              className="bg-transparent text-sm focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <select
              value={statsYear}
              onChange={(e) => setStatsYear(Number(e.target.value))}
              className="bg-transparent text-sm focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => setIsShopOpen(true)}
            className="bg-fh-orange hover:bg-fh-orangeHover text-white"
          >
            New Wholesale Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {pendingOrders} Pending
            </span>
          </div>
          <h3 className="text-2xl font-bold text-fh-navy">{totalOrders}</h3>
          <p className="text-sm text-gray-500 mt-1">Total Orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-fh-orange rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-fh-navy">
            GHS {totalAmount.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Total Amount</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speak to Support */}
        <div className="bg-fh-navy rounded-xl shadow-sm p-6 text-white">
          <h3 className="font-bold mb-4">Speak to Support</h3>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold">Customer Support</p>
              <p className="text-xs text-white/70">Always here to help</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              asChild
              className="bg-fh-orange hover:bg-fh-orangeHover text-white"
            >
              <a
                href="https://wa.me/233256076020"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </a>
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              onClick={() => setIsCallPopupOpen(true)}
            >
              <Phone className="w-4 h-4 mr-2" /> Call
            </Button>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-fh-navy">Recent Orders</h3>
            <button
              onClick={() => navigate("/wholesale-portal/history")}
              className="text-xs font-medium text-fh-orange"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {(recentOrders.length > 0 ? recentOrders : []).map((order, i) => (
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
                <div className="text-right flex flex-col items-end gap-2">
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
                  {order.status !== "Delivered" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      onClick={() => handleTrackOrder(order)}
                    >
                      Track Order
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isCallPopupOpen} onOpenChange={setIsCallPopupOpen}>
        <DialogContent className="max-w-sm bg-white p-6 rounded-xl text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-fh-navy" />
          </div>
          <h2 className="text-xl font-bold text-fh-navy mb-2">Call Support</h2>
          <p className="text-gray-500 mb-6">
            Our support team is available to assist you. Click below to call.
          </p>
          <a
            href="tel:+233202932349"
            className="text-2xl font-bold text-fh-orange hover:text-fh-orangeHover transition-colors block mb-6"
          >
            +233 202 932 349
          </a>
          <Button
            onClick={() => setIsCallPopupOpen(false)}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
