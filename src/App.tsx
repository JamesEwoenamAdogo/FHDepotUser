import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Wholesale from "./pages/Wholesale";
import Careers from "./pages/Careers";
import { WholesalerLayout } from "./components/layout/WholesalerLayout";
import { WholesalerDashboard } from "./pages/wholesaler/Dashboard";
import { WholesalerHistory } from "./pages/wholesaler/History";
import { WholesalerAnalytics } from "./pages/wholesaler/Analytics";
import { WholesalerTracking } from "./pages/wholesaler/Tracking";

import { ShopperLayout } from "./components/layout/ShopperLayout";
import { ShopperDashboard } from "./pages/shopper/Dashboard";
import { ShopperHistory } from "./pages/shopper/History";
import { ShopperTracking } from "./pages/shopper/Tracking";

import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Legal from "./pages/Legal";
import ForgotPassword from "./pages/ForgotPassword";
import BusinessOtpVerification from "./pages/BusinessOtpVerification";
import ShopperOtpVerification from "./pages/ShopperOtpVerification";
import VerifyPayment from "./pages/VerifyPayment";
import Receipt from "./pages/Receipt";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/layout/Layout";
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

// Redirects logged-in users to their portal's verify-payment page
const VerifyPaymentRouter = () => {
  const id = localStorage.getItem("id");
  const userType = localStorage.getItem("userType");
  if (id && userType === "shopper")
    return <Navigate to="/shopper-portal/verify-payment" replace />;
  if (id && userType === "wholesaler")
    return <Navigate to="/wholesale-portal/verify-payment" replace />;
  return <VerifyPayment />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/wholesale-portal" element={<WholesalerLayout />}>
              <Route index element={<WholesalerDashboard />} />
              <Route path="history" element={<WholesalerHistory />} />
              <Route path="analytics" element={<WholesalerAnalytics />} />
              <Route path="tracking" element={<WholesalerTracking />} />
              <Route path="verify-payment" element={<VerifyPayment />} />
            </Route>

            <Route path="/shopper-portal" element={<ShopperLayout />}>
              <Route index element={<ShopperDashboard />} />
              <Route path="history" element={<ShopperHistory />} />
              <Route path="tracking" element={<ShopperTracking />} />
              <Route path="verify-payment" element={<VerifyPayment />} />
            </Route>

            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/wholesale" element={<Wholesale />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/business-otp"
                element={<BusinessOtpVerification />}
              />
              <Route path="/shopper-otp" element={<ShopperOtpVerification />} />
              <Route path="/verify-payment" element={<VerifyPaymentRouter />} />
              <Route path="/receipt" element={<Receipt />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
