import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Ticket,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { applyVoucher, verifyVoucherOtp } from "@/lib/Api";
import Checkout from "@/pages/Checkout";

export const CartSheet = ({ children }: { children: React.ReactNode }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const navigate = useNavigate();

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherStep, setVoucherStep] = useState(1);
  const [voucherForm, setVoucherForm] = useState({
    name: "",
    phone: "",
    otp: "",
  });
  const [generatedVoucher, setGeneratedVoucher] = useState("");
  const [voucherType, setVoucherType] = useState<"Silver" | "Gold">("Silver");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    // Check if any item has quantity > 10000
    const hasHighQuantity = items.some((item) => item.quantity > 10000);
    if (hasHighQuantity && !localStorage.getItem("applied_premium_voucher")) {
      setShowVoucherModal(true);
    }
  }, [items]);

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (voucherStep === 1) {
      if (!voucherForm.name || !voucherForm.phone) {
        toast({
          title: "Error",
          description: "Please fill all fields",
          variant: "destructive",
        });
        return;
      }
      try {
        const response = await applyVoucher({
          name: voucherForm.name,
          phone: voucherForm.phone,
        });
        if (response?.data?.success) {
          localStorage.setItem("id", response.data.id);
          toast({
            title: "OTP Sent",
            description: `Verification code sent to ${voucherForm.phone}`,
          });
          setVoucherStep(2);
        } else {
          toast({
            title: "Error",
            description: response?.data?.message || "Failed to send OTP",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred",
          variant: "destructive",
        });
      }
    } else if (voucherStep === 2) {
      if (!voucherForm.otp) {
        toast({
          title: "Error",
          description: "Please enter OTP",
          variant: "destructive",
        });
        return;
      }
      try {
        const id = localStorage.getItem("id") || "";
        const response = await verifyVoucherOtp({ id, otp: voucherForm.otp });
        if (response?.data?.success) {
          // Generate voucher code
          const isGold =
            items.reduce((sum, item) => sum + item.quantity, 0) > 20000;
          const type = isGold ? "Gold" : "Silver";
          const code =
            response.data.voucherCode ||
            (isGold
              ? `FHGLD00${Math.floor(Math.random() * 9) + 1}`
              : `FHSIL00${Math.floor(Math.random() * 9) + 1}`);

          setVoucherType(type);
          setGeneratedVoucher(code);
          localStorage.setItem("premium_voucher_code", code);
          localStorage.setItem("applied_premium_voucher", "true");
          setVoucherStep(3);
        } else {
          toast({
            title: "Error",
            description: response?.data?.message || "Invalid OTP",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to verify OTP",
          variant: "destructive",
        });
      }
    }
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    navigate("/shop");
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-md bg-[#FFF4EA] border-l-0 p-6 flex flex-col">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold text-fh-navy">
              <ShoppingCart className="w-6 h-6" /> Your Cart
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-2 space-y-6">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                Your cart is empty.
              </div>
            ) : (
              items.map((item) => {
                const getBulkPrice = (price: number, quantity: number) => {
                  if (quantity >= 5001) return price * 0.88;
                  if (quantity >= 3001) return price * 0.9;
                  if (quantity >= 501) return price * 0.95;
                  return price;
                };
                const itemTotal =
                  getBulkPrice(item.price, item.quantity) * item.quantity;

                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#E8EEF2] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-fh-navy font-semibold text-sm mb-1">
                        {item.name}
                      </h4>
                      <p className="font-bold text-black">
                        GHS {itemTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#FDF8F5] border border-orange-900/10 rounded-lg h-9">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(0, item.quantity - 1),
                            )
                          }
                          className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-fh-orange transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.quantity || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              updateQuantity(item.id, 0);
                            } else {
                              const num = parseInt(val);
                              if (!isNaN(num) && num >= 0) {
                                updateQuantity(item.id, num);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            if (
                              !e.target.value ||
                              parseInt(e.target.value) <= 0
                            ) {
                              updateQuantity(item.id, 1);
                            }
                          }}
                          className="w-10 text-center text-sm font-medium bg-transparent border-none focus:outline-none p-0 m-0 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-fh-orange transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-6 border-t border-orange-900/10 space-y-5 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-fh-navy font-semibold text-lg">
                Subtotal
              </span>
              <span className="text-black font-bold text-xl">
                GHS {cartTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Taxes and shipping calculated at checkout.
            </p>

            <div className="space-y-3">
              <Button
                className="w-full bg-fh-orange hover:bg-fh-orangeHover text-white h-12 text-base font-semibold rounded-lg"
                onClick={() => {
                  setIsCartOpen(false);
                  if (localStorage.getItem("id")) {
                    setShowCheckoutModal(true);
                  } else {
                    navigate("/checkout");
                  }
                }}
              >
                Proceed to Checkout
              </Button>
              {!localStorage.getItem("id") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("/login?type=shopper&mode=signup");
                  }}
                  className="w-full h-14 flex flex-col items-center justify-center border-fh-orange text-fh-orange hover:bg-fh-orange/5 rounded-lg"
                >
                  <span className="font-semibold">
                    Sign Up/Create a Shopper's Account
                  </span>
                  <span className="text-xs font-normal opacity-80">
                    1% Discount on Next Shopping
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-black hover:bg-orange-900/5 h-12 text-sm font-semibold rounded-lg"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showVoucherModal} onOpenChange={setShowVoucherModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-fh-navy text-center">
              Premium Bulk Voucher
            </DialogTitle>
            <DialogDescription className="text-center">
              You've unlocked a premium bulk discount! Apply for your voucher
              below.
            </DialogDescription>
          </DialogHeader>

          {voucherStep === 1 && (
            <form onSubmit={handleVoucherSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter your name"
                  value={voucherForm.name}
                  onChange={(e) =>
                    setVoucherForm({ ...voucherForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="Enter phone number"
                  type="tel"
                  value={voucherForm.phone}
                  onChange={(e) =>
                    setVoucherForm({ ...voucherForm, phone: e.target.value })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-fh-navy hover:bg-fh-navyHover text-white"
              >
                Send Verification Code
              </Button>
            </form>
          )}

          {voucherStep === 2 && (
            <form onSubmit={handleVoucherSubmit} className="space-y-4 py-4">
              <div className="space-y-2 text-center">
                <Label>
                  Enter the 4-digit code sent to {voucherForm.phone}
                </Label>
                <Input
                  placeholder="0000"
                  className="text-center text-2xl tracking-widest h-14"
                  maxLength={4}
                  value={voucherForm.otp}
                  onChange={(e) =>
                    setVoucherForm({ ...voucherForm, otp: e.target.value })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-fh-orange hover:bg-fh-orangeHover text-white"
              >
                Verify & Get Voucher
              </Button>
            </form>
          )}

          {voucherStep === 3 && (
            <div className="py-6 flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-xl text-fh-navy">
                  Verification Successful!
                </h3>
                <p className="text-gray-500">
                  Here is your {voucherType} premium voucher code.
                </p>
              </div>

              <div
                className={`w-full p-6 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden ${
                  voucherType === "Gold"
                    ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400"
                    : "bg-gradient-to-br from-gray-50 to-gray-200 border-gray-300"
                }`}
              >
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 opacity-10">
                  <Ticket className="w-full h-full" />
                </div>
                <span
                  className={`text-sm font-bold uppercase tracking-widest mb-2 ${voucherType === "Gold" ? "text-yellow-700" : "text-gray-600"}`}
                >
                  {voucherType} Tier Voucher
                </span>
                <span className="text-3xl font-black tracking-wider text-fh-navy">
                  {generatedVoucher}
                </span>
              </div>

              <Button
                className="w-full bg-fh-navy text-white"
                onClick={() => {
                  setShowVoucherModal(false);
                  toast({
                    title: "Voucher Saved",
                    description:
                      "Use this code at checkout for your premium discount!",
                  });
                }}
              >
                Back to Cart
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-y-auto bg-[#FDF5E6]">
          <Checkout
            isModal={true}
            onClose={() => setShowCheckoutModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
