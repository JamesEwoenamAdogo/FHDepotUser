import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, ArrowLeft, Truck, Store } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { initiatePayment } from "@/lib/Api";

const ghanaRegions = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

interface CheckoutProps {
  isModal?: boolean;
  onClose?: () => void;
}

const Checkout = ({ isModal = false, onClose }: CheckoutProps = {}) => {
  const { items, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [formData, setFormData] = useState(() => {
    const storedId = localStorage.getItem("id");
    const storedPhone = localStorage.getItem("phone") || "";
    const storedEmail = localStorage.getItem("email") || "";
    const contactPerson =
      localStorage.getItem("contactPerson") ||
      localStorage.getItem("name") ||
      "";

    let firstName = "";
    let lastName = "";

    if (storedId && contactPerson) {
      const parts = contactPerson.trim().split(" ");
      if (parts.length > 1) {
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else if (parts.length === 1 && parts[0] !== "") {
        firstName = parts[0];
        lastName = " ";
      }
    }

    return {
      firstName: firstName,
      lastName: lastName,
      email: storedEmail,
      phone: storedPhone,
      address: "",
      city: "",
      region: "",
      lon: 0,
      lat: 0,
    };
  });

  const [deliveryPreference, setDeliveryPreference] = useState<
    "delivery" | "pickup" | ""
  >("");
  const [pickupDateTime, setPickupDateTime] = useState("");

  const shippingCost = deliveryPreference === "delivery" ? 25.0 : 0;

  // Loyalty points system: 1% off after 3rd shopping
  const previousOrdersCount = JSON.parse(
    localStorage.getItem("fh_orders") || "[]",
  ).length;
  const isEligibleForDiscount = previousOrdersCount >= 3;
  const discountAmount = isEligibleForDiscount ? cartTotal * 0.01 : 0;

  const hasHighQuantity = items.some((item) => item.quantity > 10000);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fh_saved_addresses");
    if (stored) {
      try {
        setSavedAddresses(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (formData.address.length < 1) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(formData.address)}&apiKey=99988f75816f40b187881d406d9f3da0&filter=countrycode:gh`,
      )
        .then((res) => res.json())
        .then((result) => {
          if (result.features) setSuggestions(result.features);
        })
        .catch((err) => console.error("error", err));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.address]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleApplyVoucher = () => {
    if (!voucherCode) return;

    // Check if it's a valid generated voucher
    const savedVoucher = localStorage.getItem("premium_voucher_code");
    if (
      voucherCode === savedVoucher ||
      voucherCode.startsWith("FHSIL") ||
      voucherCode.startsWith("FHGLD")
    ) {
      const isGold = voucherCode.startsWith("FHGLD");
      // Gold gives 15% off, Silver gives 12% off (as an example, or just applied to the total)
      // Since bulk pricing already applies 12% at 5001-10000, >10000 could be 15% for Silver, 20% for Gold.
      const discountPercent = isGold ? 0.2 : 0.15;
      setVoucherDiscount(cartTotal * discountPercent);
      setVoucherApplied(true);
      toast.success(`${isGold ? "Gold" : "Silver"} Premium Voucher Applied!`);
    } else {
      toast.error("Invalid voucher code");
    }
  };

  const total =
    cartTotal -
    discountAmount -
    voucherDiscount +
    (items.length > 0 ? shippingCost : 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryPreference) {
      toast.error("Please select a delivery preference.");
      return;
    }

    setIsProcessing(true);

    try {
      if (deliveryPreference === "delivery" && formData.address) {
        const newAddress = {
          address: formData.address,
          city: formData.city,
          region: formData.region,
          lon: formData.lon,
          lat: formData.lat,
        };
        const exists = savedAddresses.some(
          (a) => a.address === newAddress.address,
        );
        if (!exists) {
          const updated = [...savedAddresses, newAddress];
          localStorage.setItem("fh_saved_addresses", JSON.stringify(updated));
          setSavedAddresses(updated);
        }
      }

      const existingOrders = JSON.parse(
        localStorage.getItem("fh_orders") || "[]",
      );
      const storedId = localStorage.getItem("id");
      const generatedId =
        "ORD-" + Math.random().toString(36).substring(2, 11).toUpperCase();
      const orderData = {
        id: storedId || generatedId,
        orderNumber: generatedId,
        ...formData,
        deliveryPreference,
        pickupDateTime:
          deliveryPreference === "pickup" && pickupDateTime
            ? format(new Date(pickupDateTime), "MMM dd yyyy h:mma")
            : null,
        orders: items.map(({ image, ...rest }) => rest),
        total: Number(total.toFixed(2)),
        subtotal: Number(cartTotal.toFixed(2)),
        shippingCost: shippingCost,
        discountAmount: discountAmount + voucherDiscount,
        createdAt: new Date().toISOString(),
      };

      const trackingPayload = {
        type: "external_form_submission",
        timestamp: Date.now(),
        formId:
          deliveryPreference === "pickup"
            ? "Pickup Order Form"
            : "Delivery Order Form",
        formData: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          ...(deliveryPreference === "delivery" && {
            full_address: formData.address,
            city: formData.city,
            state: formData.region,
          }),
          tags: ["Online Order"],
        },
        formLabels: {
          first_name: "First Name",
          last_name: "Last Name",
          email: "Email",
          phone: "Phone",
          ...(deliveryPreference === "delivery" && {
            full_address: "Address",
            city: "City",
            state: "Region",
          }),
        },
        url: window.location.href,
        title: document.title,
        path: window.location.pathname,
        trackingId: "tk_cc35982aeb8c48a9a5d0edb34e489e6e",
        locationId: "OZdF13TpWyTQ9He5f1Ap",
      };
      fetch("https://backend.leadconnectorhq.com/external-tracking/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", version: "2021-07-28" },
        body: JSON.stringify(trackingPayload),
      }).catch(() => {});

      const storedUserType = localStorage.getItem("userType");
      const storedUserId = localStorage.getItem("id");
      const isLoggedIn = !!storedUserId;
      const callbackPath = isLoggedIn
        ? storedUserType === "shopper"
          ? "/shopper-portal/verify-payment"
          : "/wholesale-portal/verify-payment"
        : "/verify-payment";
      const callback_url = `${window.location.origin}${callbackPath}`;

      const payload = {
        amount: Math.ceil(Number(total)),
        orderData,
        callback_url,
      };

      const response = await initiatePayment(payload);
      const data = response?.data;
      console.log(data);

      if (data?.status && data?.data?.authorization_url) {
        localStorage.setItem("reference", data.data.reference);
        localStorage.setItem("order", JSON.stringify(orderData));
        console.log("Order stored in localStorage:", orderData);
        window.location.href = data.data.authorization_url;
      } else {
        toast.error("Payment initialization failed. Please try again later.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during payment initialization.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[#FFF4EA] flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingCart className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-fh-navy mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          {isModal ? (
            <Button
              onClick={onClose}
              className="w-full bg-fh-orange hover:bg-fh-orangeHover text-white h-12 text-base font-semibold rounded-lg"
            >
              Continue Shopping
            </Button>
          ) : (
            <Button
              asChild
              className="w-full bg-fh-orange hover:bg-fh-orangeHover text-white h-12 text-base font-semibold rounded-lg"
            >
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={isModal ? "py-2" : "min-h-screen bg-[#FFF4EA] py-12"}>
      <div
        className={
          isModal ? "w-full px-2" : "container mx-auto px-4 lg:px-8 max-w-6xl"
        }
      >
        {!isModal && (
          <div className="mb-8">
            <Link
              to="/shop"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-fh-orange transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Link>
            <h1 className="text-3xl font-bold text-fh-navy mt-4">Checkout</h1>
          </div>
        )}
        {isModal && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-fh-navy">Checkout</h1>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-900/5">
              <div className="space-y-2 mb-6">
                <Label className="text-xl font-bold text-fh-navy block mb-4">
                  Delivery Preference
                </Label>
                <Select
                  value={deliveryPreference}
                  onValueChange={(val: any) => setDeliveryPreference(val)}
                >
                  <SelectTrigger className="bg-fh-gray/30 border-gray-200 focus:ring-fh-orange h-12 text-base">
                    <SelectValue placeholder="Choose One" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deliveryPreference === "delivery" ? (
                <>
                  <h2 className="text-xl font-bold text-fh-navy mb-6 border-t pt-6">
                    Delivery Information
                  </h2>
                  <form
                    id="checkout-form"
                    onSubmit={handlePlaceOrder}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address (important)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                    </div>
                    {savedAddresses.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <Label className="text-sm text-gray-500">
                          Quick Select Saved Address
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {savedAddresses.map((addr, idx) => (
                            <Button
                              key={idx}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs bg-orange-50/50 border-orange-200 hover:bg-orange-100 h-auto py-1.5 px-3 whitespace-normal text-left"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  address: addr.address,
                                  city: addr.city,
                                  region: addr.region,
                                  lon: addr.lon || prev.lon,
                                  lat: addr.lat || prev.lat,
                                }))
                              }
                            >
                              {addr.address.substring(0, 40)}
                              {addr.address.length > 40 ? "..." : ""}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 relative" ref={wrapperRef}>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => {
                          handleInputChange(e);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        required
                        autoComplete="off"
                        className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 max-h-60 overflow-auto">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                              onClick={() => {
                                const addressLine =
                                  suggestion.properties.formatted;
                                const city =
                                  suggestion.properties.city ||
                                  suggestion.properties.county ||
                                  "";
                                const lon = suggestion.properties.lon;
                                const lat = suggestion.properties.lat;
                                setFormData((prev) => ({
                                  ...prev,
                                  address: addressLine,
                                  city: city || prev.city,
                                  lon,
                                  lat,
                                }));
                                setShowSuggestions(false);
                              }}
                            >
                              {suggestion.properties.formatted}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City / Town *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region *</Label>
                        <Select
                          value={formData.region}
                          onValueChange={(val) =>
                            setFormData((prev) => ({ ...prev, region: val }))
                          }
                          required
                        >
                          <SelectTrigger className="bg-fh-gray/30 border-gray-200 focus:ring-fh-orange">
                            <SelectValue placeholder="Select Region" />
                          </SelectTrigger>
                          <SelectContent>
                            {ghanaRegions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </form>
                </>
              ) : deliveryPreference === "pickup" ? (
                <>
                  <h2 className="text-xl font-bold text-fh-navy mb-6 border-t pt-6">
                    Pickup Details
                  </h2>
                  <form
                    id="checkout-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!pickupDateTime) {
                        toast.error("Please select a pickup date and time");
                        return;
                      }
                      handlePlaceOrder(e);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickupFirstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickupLastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickupEmail">
                          Email Address (important)
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickupPhone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupDateTime">
                        Select Pickup Date & Time *
                      </Label>
                      <Input
                        id="pickupDateTime"
                        type="datetime-local"
                        value={pickupDateTime}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          if (selectedDate.getDay() === 0) {
                            toast.error(
                              "We are closed on Sundays. Please select a day from Monday to Saturday.",
                            );
                            setPickupDateTime("");
                          } else if (selectedDate.getHours() < 8) {
                            toast.error(
                              "Pickups are available from 8:00 AM onwards.",
                            );
                            setPickupDateTime("");
                          } else if (
                            (selectedDate.getHours() === 18 &&
                              selectedDate.getMinutes() > 0) ||
                            selectedDate.getHours() > 18
                          ) {
                            toast.error(
                              "Pickups are only available until 6:00 PM.",
                            );
                            setPickupDateTime("");
                          } else {
                            setPickupDateTime(e.target.value);
                          }
                        }}
                        required
                        className="bg-fh-gray/30 border-gray-200 focus-visible:ring-fh-orange"
                        min={`${new Date(Date.now() + 86400000).toISOString().split("T")[0]}T08:00`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pickup available minimum 1 day from today, between 8:00
                        AM and 6:00 PM.
                      </p>
                    </div>
                  </form>
                </>
              ) : null}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div
              className={cn(
                "bg-white rounded-xl p-6 shadow-sm border border-orange-900/5",
                !isModal && "sticky top-24",
              )}
            >
              <h2 className="text-xl font-bold text-fh-navy mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-[#E8EEF2] rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-fh-navy line-clamp-2">
                        {item.name}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-bold">
                          GHS {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-y border-gray-100 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal ({cartCount} items)
                  </span>
                  <span className="font-semibold">
                    GHS {cartTotal.toFixed(2)}
                  </span>
                </div>
                {isEligibleForDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Loyalty Discount (1%)</span>
                    <span className="font-semibold">
                      -GHS {discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {voucherApplied && (
                  <div className="flex justify-between text-sm text-fh-orange">
                    <span>Premium Voucher Discount</span>
                    <span className="font-semibold">
                      -GHS {voucherDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold">
                    GHS {shippingCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {hasHighQuantity && !voucherApplied && (
                <div className="mb-6 space-y-2">
                  <Label htmlFor="voucher" className="text-fh-navy text-sm">
                    Premium Voucher Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="voucher"
                      placeholder="e.g. FHGLD001"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      className="uppercase"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyVoucher}
                      className="bg-fh-navy hover:bg-fh-navyHover text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-fh-navy">Total</span>
                <span className="text-xl font-bold text-fh-orange">
                  GHS {total.toFixed(2)}
                </span>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full bg-fh-orange hover:bg-fh-orangeHover text-white h-12 text-base font-semibold rounded-lg"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay GHS ${total.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
