import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getAllOrders } from "@/lib/Api";
import { formatDeliveryAddress } from "@/lib/address";

import { useNavigate } from "react-router-dom";
import { MapPin, Eye, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

export const ShopperHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const id = localStorage.getItem("id");
        if (!id) return;
        const response = await getAllOrders(id);
        if (response?.data?.data) {
          const fetchedOrders = response.data.data.map(
            (o: any, index: number) => ({
              ...o,
              id: `ORD-${1000 + index}`,
              _id: o._id,
              date: o.createdAt || new Date().toISOString(),
              total: parseFloat(o.amount || "0"),
              status: o.status || "In Transit",
              items: o.orders,
              location: o.location,
              lat: parseFloat(o.location?.lat || o.lat || "0"),
              lng: parseFloat(
                o.location?.lon || o.location?.lng || o.lon || "0",
              ),
              address: formatDeliveryAddress(o),
              landmark: o.landmark,
              customerName: `${o.firstName} ${o.lastName}`,
              deliveryPreference: o.deliveryPreference || "delivery",
            }),
          );
          setOrders(fetchedOrders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const handleViewReceipt = (order: any) => {
    setSelectedReceipt(order);
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`FH-Depot-Receipt-${selectedReceipt?.id || "order"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTrackOrder = (order: any) => {
    const trackingOrder = {
      ...order,
      destination: order.destination || {
        lat: parseFloat(order.location?.lat || order.lat || "5.632"),
        lng: parseFloat(
          order.location?.lon || order.location?.lng || order.lon || "-0.148",
        ),
      },
      startLocation: order.startLocation || { lat: 5.556, lng: -0.196 },
    };
    navigate("/shopper-portal/tracking", { state: { order: trackingOrder } });
  };

  const filteredOrders = orders.filter((o) => {
    if (dateFilter === "all") return true;
    const orderDate = new Date(o.date);
    const now = new Date();
    if (dateFilter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === "year") {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const receiptData = selectedReceipt
    ? {
        orderNumber: selectedReceipt.id || selectedReceipt._id || "N/A",
        customerName:
          selectedReceipt.customerName ||
          `${selectedReceipt.firstName || ""} ${selectedReceipt.lastName || ""}`.trim(),
        email: selectedReceipt.email || "N/A",
        phone: selectedReceipt.phone || "N/A",
        address: formatDeliveryAddress(selectedReceipt),
        pickupDateTime: selectedReceipt.pickupDateTime || "N/A",
        preference: selectedReceipt.deliveryPreference || "N/A",
        items: selectedReceipt.items || selectedReceipt.orders || [],
        total:
          selectedReceipt.total ?? parseFloat(selectedReceipt.amount || "0"),
        date: selectedReceipt.date
          ? new Date(selectedReceipt.date).toLocaleString()
          : new Date().toLocaleString(),
      }
    : null;

  const qrPayload = receiptData
    ? `${window.location.origin}/receipt?d=${encodeURIComponent(
        JSON.stringify({
          orderNumber: receiptData.orderNumber,
          customer: receiptData.customerName,
          phone: receiptData.phone,
          email: receiptData.email,
          address: receiptData.address,
          preference: receiptData.preference,
          pickupDateTime: receiptData.pickupDateTime,
          date: receiptData.date,
          subtotal: receiptData.total,
          shipping: 0,
          discount: 0,
          total: receiptData.total,
          items: receiptData.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price),
            amount: Number(item.price) * item.quantity,
          })),
        }),
      )}`
    : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-fh-navy">Order History</h2>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fh-orange"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-y border-gray-100">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Date Ordered</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Receipt</th>
              <th className="p-4 font-medium text-right">Details</th>
              <th className="p-4 font-medium text-right">Track</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium text-fh-navy">{order.id}</p>
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(order.date).toLocaleDateString() ===
                    "Invalid Date"
                      ? order.date
                      : new Date(order.date).toLocaleDateString()}
                  </td>
                  <td
                    className="p-4 text-gray-600 max-w-[250px] truncate"
                    title={order.items
                      ?.map((item: any) => item.name)
                      .join(", ")}
                  >
                    {order.items?.map((item: any) => item.name).join(", ")}
                  </td>
                  <td className="p-4 font-medium text-fh-navy">
                    GHS {order.total.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleViewReceipt(order)}
                    >
                      Receipt
                    </Button>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedDetails(order)}
                    >
                      <Eye className="w-4 h-4 text-fh-navy" />
                    </Button>
                  </td>
                  <td className="p-4 text-right">
                    {(order.deliveryPreference || "").toLowerCase() !==
                      "pickup" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-fh-orange text-fh-orange hover:bg-fh-orange hover:text-white"
                        onClick={() => handleTrackOrder(order)}
                      >
                        <MapPin className="w-3 h-3 mr-1" /> Track
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No orders found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(open) => !open && setSelectedReceipt(null)}
      >
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden bg-white rounded-xl border-0 shadow-2xl">
          {receiptData && (
            <div
              ref={receiptRef}
              className="bg-white rounded-xl overflow-hidden"
            >
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
                  <p className="text-[11px] text-gray-500">
                    Tax ID: CS165452018
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-gray-800">Receipt</h3>
                  <p className="text-xs text-gray-500">
                    {receiptData.orderNumber}
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
                    {receiptData.customerName}
                  </p>
                  <p className="text-gray-500 text-xs">{receiptData.phone}</p>
                  {receiptData.email !== "N/A" && (
                    <p className="text-gray-500 text-xs">{receiptData.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">
                    Date
                  </p>
                  <p className="text-gray-800 text-xs">{receiptData.date}</p>
                </div>
              </div>

              {/* Preference */}
              <div className="px-8 py-3 border-b border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">Preference:</span>
                <span className="font-medium text-gray-800 capitalize">
                  {receiptData.preference}
                  {receiptData.preference === "pickup" &&
                    receiptData.pickupDateTime !== "N/A" &&
                    ` — ${receiptData.pickupDateTime}`}
                </span>
              </div>
              {receiptData.preference === "delivery" && (
                <div className="px-8 py-3 border-b border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Delivery Address:</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">
                    {receiptData.address}
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
                  {receiptData.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="px-8 py-3 text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        GHS {Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-8 py-3 text-right text-gray-800 font-medium">
                        GHS {(Number(item.price) * item.quantity).toFixed(2)}
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
                      GHS {receiptData.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* QR Code */}
              <div className="px-8 py-6 flex items-center justify-between border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Scan for complete order details
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Contains: Order #, Customer, Items, Totals
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <QRCodeSVG
                    value={qrPayload}
                    size={130}
                    level="M"
                    marginSize={1}
                  />
                </div>
              </div>
            </div>
          )}
          {selectedReceipt && (
            <div className="p-4">
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full bg-fh-navy hover:bg-fh-navyHover text-white h-11"
              >
                {isDownloading ? (
                  "Generating PDF..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" /> Download Receipt (PDF)
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Modal (Eye Icon) */}
      <Dialog
        open={!!selectedDetails}
        onOpenChange={(open) => !open && setSelectedDetails(null)}
      >
        <DialogContent className="max-w-lg w-full p-0 overflow-hidden bg-white rounded-xl border-0 shadow-2xl">
          {selectedDetails && (
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-fh-navy mb-4">
                Order Details
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {Object.entries(selectedDetails)
                  .filter(
                    ([key]) => !["items", "orders", "location"].includes(key),
                  )
                  .map(([key, value]) => (
                    <div key={key} className="border-b border-gray-50 py-1.5">
                      <p className="text-gray-400 text-[11px] uppercase font-semibold">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p
                        className="text-gray-800 font-medium truncate"
                        title={String(value)}
                      >
                        {String(value)}
                      </p>
                    </div>
                  ))}
                {selectedDetails.location && (
                  <div className="border-b border-gray-50 py-1.5 col-span-2">
                    <p className="text-gray-400 text-[11px] uppercase font-semibold">
                      Location
                    </p>
                    <p className="text-gray-800 font-medium text-xs">
                      lat: {selectedDetails.location.lat}, lon:{" "}
                      {selectedDetails.location.lon}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-fh-navy mb-2">Items</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedDetails.items || selectedDetails.orders || []).map(
                    (item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <div className="flex justify-between">
                          <span
                            className="font-medium text-gray-800 truncate"
                            title={item.name}
                          >
                            {item.name}
                          </span>
                          <span className="text-gray-600">
                            GHS {Number(item.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span>
                            Amount: GHS{" "}
                            {(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
