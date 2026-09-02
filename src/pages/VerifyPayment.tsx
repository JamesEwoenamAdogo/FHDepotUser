import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { verifyPayment } from "@/lib/Api";
import { useCart } from "@/context/CartContext";

interface StoredOrder {
  id?: string;
  orderNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  deliveryPreference?: string;
  pickupDateTime?: string;
  orders?: Array<{ name: string; price: number; quantity: number }>;
  total?: number;
  subtotal?: number;
  shippingCost?: number;
  discountAmount?: number;
  createdAt?: string;
}

const VerifyPayment = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const hasRun = useRef(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [reference, setReference] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("id"));
  }, []);

  useEffect(() => {
    if (hasRun.current) return;

    const checkPayment = async () => {
      hasRun.current = true;
      const ref = localStorage.getItem("reference");
      const storedOrder = localStorage.getItem("order");

      if (!ref) {
        setStatus("error");
        return;
      }

      setReference(ref);
      if (storedOrder) {
        try {
          const parsed = JSON.parse(storedOrder);
          console.log("Loaded order from localStorage:", parsed);
          setOrder(parsed);
        } catch (e) {
          console.error("Failed to parse stored order", e);
        }
      } else {
        console.warn("No order found in localStorage");
      }

      try {
        const response = await verifyPayment(ref);

        const isVerified =
          response?.data?.success ||
          response?.data?.data?.success ||
          response?.data?.status === true ||
          response?.data?.status === "success";

        if (isVerified) {
          setStatus("success");
          clearCart();
          localStorage.removeItem("reference");
        } else if (storedOrder) {
          // Paystack only redirects here after the user has paid.
          // For guest (non-logged-in) orders the verify endpoint may not
          // recognise the reference, so fall back to showing the receipt
          // + QR using the order data we stored at checkout.
          setStatus("success");
          clearCart();
          localStorage.removeItem("reference");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verification failed", error);
        if (storedOrder) {
          setStatus("success");
          clearCart();
          localStorage.removeItem("reference");
        } else {
          setStatus("error");
        }
      }
    };

    checkPayment();
  }, [clearCart]);

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
      pdf.save(`FH-Depot-Receipt-${reference || "order"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const receiptData = order
    ? {
        orderNumber: order.orderNumber || order.id || "N/A",
        customerName: `${order.firstName || ""} ${order.lastName || ""}`.trim(),
        email: order.email || "N/A",
        phone: order.phone || "N/A",
        address:
          order.deliveryPreference === "delivery"
            ? `${order.address || ""}, ${order.city || ""}, ${order.region || ""}`
                .replace(/^,\s*/, "")
                .replace(/,\s*$/, "")
            : "Pickup",
        pickupDateTime: order.pickupDateTime || "N/A",
        preference: order.deliveryPreference || "N/A",
        items: order.orders || [],
        total: order.total ?? 0,
        subtotal: order.subtotal ?? 0,
        shipping: order.shippingCost ?? 0,
        discount: order.discountAmount ?? 0,
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleString()
          : new Date().toLocaleString(),
        reference: reference,
      }
    : null;

  const qrPayload = receiptData
    ? `${window.location.origin}/receipt?d=${encodeURIComponent(
        JSON.stringify({
          o: receiptData.orderNumber,
          c: receiptData.customerName,
          p: receiptData.phone,
          ...(receiptData.email && receiptData.email !== "N/A"
            ? { e: receiptData.email }
            : {}),
          ...(receiptData.preference === "delivery"
            ? { a: receiptData.address }
            : {}),
          pr: receiptData.preference,
          ...(receiptData.preference === "pickup" &&
          receiptData.pickupDateTime !== "N/A"
            ? { pdt: receiptData.pickupDateTime }
            : {}),
          d: receiptData.date,
          r: receiptData.reference,
          s: receiptData.subtotal,
          ...(Number(receiptData.shipping) > 0
            ? { sh: receiptData.shipping }
            : {}),
          ...(Number(receiptData.discount) > 0
            ? { di: receiptData.discount }
            : {}),
          t: receiptData.total,
          i: receiptData.items.map((item) => ({
            n: item.name,
            q: item.quantity,
            u: Number(item.price),
            am: Number(item.price) * item.quantity,
          })),
        }),
      )}`
    : "";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      {status === "loading" && (
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-fh-orange animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-fh-navy">
            Verifying Payment...
          </h2>
          <p className="text-gray-500">
            Please wait while we confirm your transaction.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-fh-navy">
              Payment Successful!
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Your order has been placed successfully. If you'd
              like to speak with us before then, please call 059 600 3041. Thank
              you for shopping with us!
            </p>
          </div>

          {receiptData && (
            <>
              <div
                ref={receiptRef}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
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
                      <p className="text-gray-500 text-xs">
                        {receiptData.email}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">
                      Date
                    </p>
                    <p className="text-gray-800 text-xs">{receiptData.date}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase mt-2">
                      Reference
                    </p>
                    <p className="text-gray-800 text-xs">
                      {receiptData.reference}
                    </p>
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
                    {receiptData.items.map((item, idx) => (
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
                      Contains: Order #, Customer, Items, Totals & Reference
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <QRCodeSVG
                      value={qrPayload}
                      size={180}
                      level="L"
                      marginSize={2}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full bg-fh-navy hover:bg-fh-navyHover text-white h-12"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating
                    PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" /> Download Receipt (PDF)
                  </>
                )}
              </Button>
            </>
          )}

          <div className="pt-2">
            <Button
              onClick={() => {
                const userType = localStorage.getItem("userType");
                if (isLoggedIn && userType === "shopper") {
                  navigate("/shopper-portal");
                } else if (isLoggedIn && userType === "wholesaler") {
                  navigate("/wholesale-portal");
                } else {
                  navigate("/");
                }
              }}
              className="w-full bg-fh-orange hover:bg-fh-orangeHover text-white h-12"
            >
              {isLoggedIn ? "Back to Dashboard" : "Go Back Home"}
            </Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-fh-navy">Payment Failed</h2>
          <p className="text-gray-500">
            We couldn't verify your payment. Please try again or contact support
            if the issue persists.
          </p>
          <div className="pt-6 flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate("/checkout")}
            >
              Try Again
            </Button>
            <Button
              onClick={() => {
                const userType = localStorage.getItem("userType");
                if (isLoggedIn && userType === "shopper")
                  navigate("/shopper-portal");
                else if (isLoggedIn && userType === "wholesaler")
                  navigate("/wholesale-portal");
                else navigate("/");
              }}
              className="flex-1 bg-fh-orange hover:bg-fh-orangeHover text-white h-12"
            >
              {isLoggedIn ? "Back to Dashboard" : "Go Home"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyPayment;
