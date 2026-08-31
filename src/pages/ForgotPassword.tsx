import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Lock, Key, ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
} from "@/lib/Api";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ phone });
      if (response && response.data && response.data.success === true) {
        localStorage.setItem("id", response.data.id || "");
        toast.success(response.data.message || "OTP sent to your phone.");
        setStep(2);
      } else {
        toast.error(
          response?.data?.message ||
            "Failed to send OTP. Please check your phone number.",
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = localStorage.getItem("id") || "";
      const response = await verifyPasswordResetOtp({ id, otp });
      if (response && response.data && response.data.success === true) {
        toast.success(response.data.message || "OTP verified successfully!");
        setStep(3);
      } else {
        toast.error(response?.data?.message || "Failed to verify OTP.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = localStorage.getItem("id") || "";
      const response = await resetPassword({ id, password: newPassword });
      if (response && response.data && response.data.success === true) {
        toast.success(response.data.message || "Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(response?.data?.message || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FDF5E6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-fh-navy mb-2">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter Verification Code"}
            {step === 3 && "Reset Password"}
          </h2>
          <p className="text-gray-500">
            {step === 1 &&
              "Enter your phone number to receive a verification code."}
            {step === 2 && "Enter the OTP sent to your phone."}
            {step === 3 && "Enter your new password."}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              {isSubmitting ? "Sending OTP..." : "Send Reset Code"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-fh-navy hover:text-fh-orange"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-fh-navy">
                Verification Code (OTP)
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
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
              {isSubmitting ? "Verifying..." : "Verify OTP"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center text-sm font-medium text-fh-navy hover:text-fh-orange"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Phone Number
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-fh-navy">
                New Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 h-12 bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-fh-navy">
                Confirm New Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg bg-fh-orange hover:bg-fh-orangeHover text-white"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
