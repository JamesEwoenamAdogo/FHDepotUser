import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, verifyBusinessOtp } from "@/lib/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Wholesale = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    registrationNumber: "",
    taxId: "",
    contactPerson: "",
    position: "",
    email: "",
    phone: "",
    address: "",
    branches: "",
    website: "",
    termsAccepted: false,
  });

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!formData.businessName || !formData.businessType) {
          toast.error(
            "Please fill in all required fields (Business Name, Business Type)",
          );
          return false;
        }
        return true;
      case 2:
        if (
          !formData.contactPerson ||
          !formData.position ||
          !formData.phone ||
          !formData.address
        ) {
          toast.error(
            "Please fill in all required fields in Contact Information",
          );
          return false;
        }
        if (!formData.termsAccepted) {
          toast.error("You must accept the Terms and Conditions");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 2));
    }
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    setIsSubmitting(true);

    // CRM tracking submission
    const trackingPayload = {
      type: "external_form_submission",
      timestamp: Date.now(),
      formId: "Wholesale Onboarding Form",
      formData: {
        organization: formData.businessName,
        "contact.business_type": formData.businessType,
        "contact.registration_number": formData.registrationNumber,
        "contact.tax_identification_number": formData.taxId,
        first_name: formData.contactPerson,
        "contact.position": formData.position,
        email: formData.email,
        phone: formData.phone,
        full_address: formData.address,
        "contact.number_of_branches": formData.branches,
        website: formData.website,
        tags: ["New Wholesale Sign Up"],
      },
      formLabels: {
        organization: "Business Name",
        "contact.business_type": "Business Type",
        "contact.registration_number": "Registration Number",
        "contact.tax_identification_number": "Tax Identification Number",
        first_name: "Contact Person",
        "contact.position": "Position",
        email: "Email",
        phone: "Phone Number",
        full_address: "Business Address",
        "contact.number_of_branches": "Number of Branches",
        website: "Business Website",
      },
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      trackingId: "tk_cc35982aeb8c48a9a5d0edb34e489e6e",
      locationId: "OZdF13TpWyTQ9He5f1Ap",
      sessionId: crypto.randomUUID(),
      properties: {
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent)
          ? "mobile"
          : "desktop",
      },
    };

    try {
      fetch("https://backend.leadconnectorhq.com/external-tracking/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", version: "2021-07-28" },
        body: JSON.stringify(trackingPayload),
      }).catch(() => {});

      const response = await signUp(formData);

      if (response && response.data && response.data.success === true) {
        localStorage.setItem(
          "name",
          response.data.data?.businessName || formData.businessName,
        );
        localStorage.setItem(
          "phone",
          response.data.data?.phone || formData.phone,
        );
        localStorage.setItem(
          "contactPerson",
          response.data.data?.contactPerson || formData.contactPerson,
        );
        if (response.data.data?._id) {
          localStorage.setItem("id", response.data.data._id);
        }
        toast.success(
          response.data.message || "OTP sent to your phone number.",
        );
        setStep(3);
      } else {
        toast.error(
          response?.data?.message ||
            "Failed to create account. Please try again.",
        );
      }
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }
    setIsSubmitting(true);
    try {
      const id = localStorage.getItem("id") || "";
      const response = await verifyBusinessOtp({ id, otp });
      if (response && response.data && response.data.success === true) {
        setIsSuccess(true);
        toast.success(
          response.data.message || "Account verified successfully!",
        );
        setTimeout(() => {
          navigate("/wholesale-portal");
        }, 1500);
      } else {
        toast.error(
          response?.data?.message || "Invalid OTP. Please try again.",
        );
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: "Business Details", icon: Building2 },
    { id: 2, name: "Contact Info", icon: User },
    { id: 3, name: "Verification", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-fh-navy py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-fh-orange rounded-full blur-[120px]"></div>
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Become an FH Depot{" "}
              <span className="text-fh-orange">Wholesale/Trade Customer</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Unlock premium wholesale pricing, priority delivery, dedicated
              account management, and exclusive business growth advantages.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-fh-orange hover:bg-fh-orangeHover text-white"
                onClick={() =>
                  document
                    .getElementById("application-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Apply Now
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-white text-black hover:bg-white hover:text-fh-navy border-none"
              >
                <a href="tel:+233202932349">Speak to Sales</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-fh-gray">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-fh-navy text-center mb-16">
            Core Benefits
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Dedicated Account Manager",
                desc: "Personal account representative for faster issue resolution and direct support.",
              },
              {
                title: "Priority Delivery",
                desc: "Faster dispatch and priority logistics queue for your orders.",
              },
              {
                title: "Exclusive Trade Pricing",
                desc: "Discounted wholesale rates and tier-based pricing.",
              },
              {
                title: "Flexible Payment Options",
                desc: "Approved credit lines and scheduled billing for eligible partners.",
              },
              {
                title: "Business Analytics",
                desc: "Purchase analytics and smart restocking recommendations.",
              },
              {
                title: "Multi-Branch Ordering",
                desc: "Manage multiple store locations from a centralized procurement dashboard.",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <CheckCircle2 className="h-8 w-8 text-fh-orange mb-4" />
                <h3 className="text-xl font-bold text-fh-navy mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-fh-navy mb-4">
              Trade Application Form
            </h2>
            <p className="text-gray-600">
              Complete the form below to apply for a wholesale trade account.
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-fh-gray p-12 rounded-3xl text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-bold text-fh-navy mb-4">
                Application Received!
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Thank you for applying to become a wholesale/trade customer. Our
                sales team will review your application and contact you within
                24-48 hours.
              </p>
              <Button
                asChild
                className="bg-fh-navy hover:bg-fh-navyHover text-white"
              >
                <Link to="/wholesale-portal">Proceed to Portal</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Progress */}
              <div className="bg-fh-navy p-6 md:p-8">
                <div className="flex justify-between items-center relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/20 z-0"></div>
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-fh-orange z-0 transition-all duration-500"
                    style={{
                      width: `${((step - 1) / (steps.length - 1)) * 100}%`,
                    }}
                  ></div>

                  {steps.map((s) => (
                    <div
                      key={s.id}
                      className="relative z-10 flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          step >= s.id
                            ? "bg-fh-orange text-white"
                            : "bg-white/10 text-white/50 border border-white/20"
                        }`}
                      >
                        <s.icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs font-medium hidden md:block ${step >= s.id ? "text-white" : "text-white/50"}`}
                      >
                        {s.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-10 relative">
                <div className="mb-6">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-fh-orange transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Return to Homepage
                  </Link>
                </div>
                <form onSubmit={step === 3 ? handleOtpSubmit : handleSubmit}>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-2xl font-bold text-fh-navy mb-6">
                          Business Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="businessName">
                              Business Name *
                            </Label>
                            <Input
                              id="businessName"
                              value={formData.businessName}
                              onChange={(e) =>
                                updateForm("businessName", e.target.value)
                              }
                              required
                              placeholder="Acme Enterprise Ltd"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="businessType">
                              Business Type *
                            </Label>
                            <Select
                              value={formData.businessType}
                              onValueChange={(v) =>
                                updateForm("businessType", v)
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="supermarket">
                                  Supermarket
                                </SelectItem>
                                <SelectItem value="retail_chain">
                                  Retail Chain
                                </SelectItem>
                                <SelectItem value="hotel">
                                  Hotel / Hospitality
                                </SelectItem>
                                <SelectItem value="restaurant">
                                  Restaurant / Cafe
                                </SelectItem>
                                <SelectItem value="event_company">
                                  Event Company
                                </SelectItem>
                                <SelectItem value="distributor">
                                  Distributor / Wholesaler
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="registrationNumber">
                              Registration Number
                            </Label>
                            <Input
                              id="registrationNumber"
                              value={formData.registrationNumber}
                              onChange={(e) =>
                                updateForm("registrationNumber", e.target.value)
                              }
                              placeholder="CS12345678"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="taxId">
                              Tax Identification Number (TIN)
                            </Label>
                            <Input
                              id="taxId"
                              value={formData.taxId}
                              onChange={(e) =>
                                updateForm("taxId", e.target.value)
                              }
                              placeholder="P0000000000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branches">Number of Branches</Label>
                            <Select
                              value={formData.branches}
                              onValueChange={(v) => updateForm("branches", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select branches" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">
                                  1 (Single Location)
                                </SelectItem>
                                <SelectItem value="2-5">
                                  2 - 5 Branches
                                </SelectItem>
                                <SelectItem value="6-10">
                                  6 - 10 Branches
                                </SelectItem>
                                <SelectItem value="10+">
                                  More than 10 Branches
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">
                              Business Website (Optional)
                            </Label>
                            <Input
                              id="website"
                              type="url"
                              value={formData.website}
                              onChange={(e) =>
                                updateForm("website", e.target.value)
                              }
                              placeholder="https://www.example.com"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-2xl font-bold text-fh-navy mb-6">
                          Contact Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="contactPerson">
                              Contact Person Full Name *
                            </Label>
                            <Input
                              id="contactPerson"
                              value={formData.contactPerson}
                              onChange={(e) =>
                                updateForm("contactPerson", e.target.value)
                              }
                              required
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="position">
                              Position / Job Title *
                            </Label>
                            <Input
                              id="position"
                              value={formData.position}
                              onChange={(e) =>
                                updateForm("position", e.target.value)
                              }
                              required
                              placeholder="Procurement Manager"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">
                              Email Address (important)
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                updateForm("email", e.target.value)
                              }
                              placeholder="john@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                updateForm("phone", e.target.value)
                              }
                              required
                              placeholder="+233 20 123 4567"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">
                              Full Business Address *
                            </Label>
                            <Textarea
                              id="address"
                              value={formData.address}
                              onChange={(e) =>
                                updateForm("address", e.target.value)
                              }
                              required
                              placeholder="Street Address, City, Region"
                              className="h-24"
                            />
                          </div>
                          <div className="md:col-span-2 bg-fh-gray p-6 rounded-xl border border-gray-200 mt-4">
                            <h4 className="font-semibold text-fh-navy mb-2">
                              Application Summary
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                              By submitting this application, you confirm that
                              all provided information is accurate and you agree
                              to our Wholesale/Trade Customer Terms &
                              Conditions.
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="terms"
                                required
                                checked={formData.termsAccepted}
                                onChange={(e) =>
                                  updateForm("termsAccepted", e.target.checked)
                                }
                                className="rounded text-fh-orange focus:ring-fh-orange"
                              />
                              <Label
                                htmlFor="terms"
                                className="text-sm cursor-pointer"
                              >
                                I agree to the Terms & Conditions and Privacy
                                Policy
                              </Label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-2xl font-bold text-fh-navy mb-6 text-center">
                          Verify Your Phone Number
                        </h3>
                        <p className="text-center text-gray-600 mb-6">
                          We&apos;ve sent a one-time password (OTP) to your
                          phone number. Please enter it below to complete your
                          registration.
                        </p>
                        <div className="max-w-sm mx-auto space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                              id="otp"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              required
                              placeholder="e.g. 123456"
                              className="text-center text-2xl tracking-widest h-14"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form Navigation */}
                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                    {step !== 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="border-gray-200"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                    )}

                    {step === 3 ? (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-fh-orange hover:bg-fh-orangeHover text-white px-8 ml-auto"
                      >
                        {isSubmitting ? "Verifying..." : "Verify OTP"}
                      </Button>
                    ) : step < 2 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-fh-navy hover:bg-fh-navyHover text-white ml-auto"
                      >
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-fh-orange hover:bg-fh-orangeHover text-white px-8 ml-auto"
                      >
                        {isSubmitting
                          ? "Creating Account..."
                          : "Complete Signup"}
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Wholesale;
