import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone,
  Lock,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  login,
  shopperLogin,
  shopperSignUp,
  verifyCustomerOtp,
  shopperVerifyOtp,
} from "@/lib/Api";
import { toast } from "sonner";

import { useSearchParams } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isShopper = searchParams.get("type") === "shopper";
  const isSignup = searchParams.get("mode") === "signup";
  const [formData, setFormData] = useState({
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    if (step === "phone") {
      if (isShopper) {
        if (isSignup) {
          try {
            const trackingPayload = {
              type: "external_form_submission",
              timestamp: Date.now(),
              formId: "Shopper Sign Up",
              formData: { phone: formData.phone, tags: ["Shopper Sign Up"] },
              formLabels: { phone: "Phone Number" },
              url: window.location.href,
              title: document.title,
              path: window.location.pathname,
              trackingId: "tk_cc35982aeb8c48a9a5d0edb34e489e6e",
              locationId: "OZdF13TpWyTQ9He5f1Ap",
            };
            fetch(
              "https://backend.leadconnectorhq.com/external-tracking/events",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  version: "2021-07-28",
                },
                body: JSON.stringify(trackingPayload),
              },
            ).catch(() => {});

            const response = await shopperSignUp(formData);
            if (response && response.data && response.data.success === true) {
              localStorage.setItem(
                "phone",
                response.data.shopper?.phone || formData.phone,
              );
              localStorage.setItem("id", response.data.shopper?.id || "");
              localStorage.setItem("token", response.data.token || "");
              toast.success(
                response.data.message ||
                  "Account created! Please verify your OTP.",
              );
              navigate("/shopper-otp");
            } else {
              toast.error(
                response?.data?.message || "Failed to create account.",
              );
            }
          } catch (error) {
            toast.error("An error occurred during signup.");
          }
        } else {
          // Shopper Login (Phone only)
          try {
            const response = await shopperLogin({ phone: formData.phone });
            if (response && response.data && response.data.success === true) {
              localStorage.setItem(
                "id",
                response.data.id || response.data.shopper?.id || "",
              );
              toast.success(response.data.message || "OTP Sent!");
              setStep("otp");
            } else {
              toast.error(response?.data?.message || "Failed to send OTP.");
            }
          } catch (error) {
            toast.error("Failed to login. Please try again.");
          }
        }
      } else {
        // Wholesale Login (Phone only)
        try {
          const response = await login({ phone: formData.phone });
          if (response && response.data && response.data.success === true) {
            localStorage.setItem(
              "id",
              response.data.id ||
                response.data.data?._id ||
                response.data.data?.id ||
                "",
            );
            if (response.data.data?.phone)
              localStorage.setItem("phone", response.data.data.phone);
            if (response.data.data?.contactPerson)
              localStorage.setItem(
                "contactPerson",
                response.data.data.contactPerson,
              );
            if (response.data.data?.businessName)
              localStorage.setItem(
                "businessName",
                response.data.data.businessName,
              );
            if (response.data.data?.businessName)
              localStorage.setItem("name", response.data.data.businessName);
            if (response.data.data?.email)
              localStorage.setItem("email", response.data.data.email);
            toast.success(response.data.message || "OTP Sent!");
            console.log(response);
            setStep("otp");
          } else {
            toast.error(response?.data?.message || "Failed to send OTP.");
          }
        } catch (error) {
          toast.error("Failed to login. Please try again.");
        }
      }
      setIsSubmitting(false);
      return;
    }

    // OTP Step
    try {
      const id = localStorage.getItem("id") || "";
      let response;
      if (isShopper) {
        response = await shopperVerifyOtp({ id, otp });
      } else {
        response = await verifyCustomerOtp({ id, otp });
      }
      if (response && response.data && response.data.success === true) {
        toast.success(response.data.message || "Login successful!");
        if (isShopper) {
          localStorage.setItem(
            "phone",
            response.data.shopper?.phone || formData.phone,
          );
          localStorage.setItem("token", response.data.token || "");
          localStorage.setItem("userType", "shopper");
          navigate("/shopper-portal");
        } else {
          if (response.data.data?.businessName)
            localStorage.setItem("name", response.data.data.businessName);
          if (response.data.data?.phone)
            localStorage.setItem("phone", response.data.data.phone);
          if (response.data.data?.contactPerson)
            localStorage.setItem(
              "contactPerson",
              response.data.data.contactPerson,
            );
          if (response.data.data?.email)
            localStorage.setItem("email", response.data.data.email);
          localStorage.setItem("userType", "wholesaler");
          navigate("/wholesale-portal");
        }
      } else {
        toast.error(response?.data?.message || "Invalid OTP.");
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FDF5E6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-fh-orange mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Return to Homepage
            </Link>
            <h2 className="text-3xl font-bold text-fh-navy mb-2">
              {isShopper
                ? isSignup
                  ? "Create Shopper Account"
                  : "Shopper Login"
                : "Wholesale Login"}
            </h2>
            <p className="text-gray-500">
              {isShopper
                ? isSignup
                  ? "Sign up to earn 1% discount on your next shopping."
                  : "Sign in to track orders and earn loyalty discounts."
                : "Access your enterprise dashboard, track orders, and manage your account."}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {step === "phone" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-fh-navy">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="phone"
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="pl-10 h-12 bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                      placeholder="+233 20 123 4567"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg bg-fh-orange hover:bg-fh-orangeHover text-white"
                >
                  {isSubmitting
                    ? "Processing..."
                    : isSignup
                      ? "Create Account"
                      : "Send OTP"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-fh-navy">
                    Enter OTP
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 h-12 bg-fh-gray/30 border-gray-200 focus:border-fh-orange tracking-widest text-lg"
                      placeholder="Enter 4-digit code"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg bg-fh-orange hover:bg-fh-orangeHover text-white"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Login"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-sm font-medium text-fh-orange hover:text-fh-orangeHover"
                  >
                    Use a different phone number
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link
                  to={`/login${isShopper ? "?type=shopper" : ""}`}
                  className="font-medium text-fh-orange hover:text-fh-orangeHover"
                >
                  Sign in here
                </Link>
              </>
            ) : (
              <>
                {isShopper
                  ? "Don't have a shopper account? "
                  : "Don't have a wholesale account? "}
                <Link
                  to={
                    isShopper ? "/login?type=shopper&mode=signup" : "/wholesale"
                  }
                  className="font-medium text-fh-orange hover:text-fh-orangeHover"
                >
                  Apply here
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Panel */}
        <div className="hidden md:block relative bg-fh-navy">
          <div className="absolute inset-0 bg-gradient-to-t from-fh-navy via-fh-navy/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <Building2 className="h-12 w-12 text-fh-orange mb-6" />
            <h3 className="text-2xl font-bold mb-4">Enterprise Procurement</h3>
            <p className="text-white/80 leading-relaxed">
              Join hundreds of businesses across Ghana who trust FH Depot for
              their wholesale FMCG supply. Manage your orders, track deliveries
              in real-time, and access exclusive trade pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
