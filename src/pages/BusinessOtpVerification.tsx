import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { verifyBusinessOtp } from "@/lib/Api";
import { ShieldCheck } from "lucide-react";

const BusinessOtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const id = localStorage.getItem("id");
    if (!id) {
      toast.error("Session expired. Please sign up again.");
      navigate("/wholesale");
      return;
    }

    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyBusinessOtp({ id, otp });
      if (response && response.data && response.data.success === true) {
        localStorage.setItem("userType", "wholesaler");
        toast.success("Phone number verified successfully!");
        setTimeout(() => {
          navigate("/wholesale-portal");
        }, 1500);
      } else {
        toast.error(
          response?.data?.message || "Invalid OTP. Please try again.",
        );
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-fh-gray py-24 flex items-center justify-center">
      <div className="container mx-auto px-4 lg:px-8 max-w-md">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-16 h-16 bg-fh-orange/10 text-fh-orange rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-fh-navy mb-4">
            Verify Your Number
          </h2>
          <p className="text-gray-600 mb-8">
            We've sent a verification code to your phone number. Please enter it
            below to complete your registration.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={6}
                required
                className="text-center text-xl tracking-widest h-14"
              />
            </div>

            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-fh-orange hover:bg-fh-orangeHover text-white h-14 text-lg"
            >
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessOtpVerification;
