import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("id"));
  }, []);

  useEffect(() => {
    try {
      const orderData = JSON.parse(localStorage.getItem("order") || "{}");
      if (orderData && orderData.orders) {
        setOrderItems(orderData.orders);
      }
    } catch (e) {
      console.error("Failed to parse order from local storage", e);
    }
  }, []);

  const orderNumber =
    localStorage.getItem("reference") ||
    "FHD-" + Math.floor(100000 + Math.random() * 900000);
  const deliveryETA = new Date();
  deliveryETA.setDate(deliveryETA.getDate() + 2); // 2 days from now
  const formattedETA = deliveryETA.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-[80vh] bg-[#FFF4EA] flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-900/5 text-center p-10 md:p-16"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-fh-navy mb-4">
            Order Successful!
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
            Your order has been placed successfully. One of our agents will call
            you within the next 20 minutes to confirm details. If you'd like to
            speak with us before then, please call 059 600 3041. Thank you for
            shopping with us!
          </p>

          {orderItems.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
              <h3 className="font-bold text-fh-navy mb-4">Order Details</h3>
              <div className="space-y-3">
                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex gap-3 items-center">
                      <span className="font-medium text-fh-navy">
                        {item.name}
                      </span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-fh-navy">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-fh-gray/30 rounded-2xl p-6 mb-8 text-left grid sm:grid-cols-2 gap-6 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Package className="w-5 h-5 text-fh-navy" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="font-bold text-fh-navy">{orderNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-5 h-5 text-fh-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                <p className="font-bold text-fh-navy">{formattedETA}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Button
                onClick={() => {
                  const userType = localStorage.getItem("userType");
                  if (userType === "shopper") navigate("/shopper-portal");
                  else navigate("/wholesale-portal");
                }}
                className="bg-fh-orange hover:bg-fh-orangeHover text-white h-14 px-8 text-base rounded-xl"
              >
                Back to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-fh-orange hover:bg-fh-orangeHover text-white h-14 px-8 text-base rounded-xl"
                >
                  <Link to="/shop">
                    Continue Shopping <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 px-8 text-base rounded-xl border-gray-200 text-fh-navy hover:bg-gray-50"
                >
                  <Link to="/login">Track Order via Portal</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
