import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  LayoutDashboard,
  History,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { CartSheet } from "@/components/cart/CartSheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Shop from "@/pages/Shop";

export const ShopperLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    if (!localStorage.getItem("id")) {
      navigate("/login?type=shopper");
    }
  }, [navigate]);

  const navItems = [
    { name: "Dashboard", path: "/shopper-portal", icon: LayoutDashboard },
    { name: "Order History", path: "/shopper-portal/history", icon: History },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Shopper Portal</h2>
          <p className="text-sm text-white/70">
            {localStorage.getItem("phone") || "Loyal Customer"}
          </p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-2 text-white/70 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          <li>
            <Link
              to="/shopper-portal"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/shopper-portal"
                  ? "bg-white/20 text-white border-l-4 border-white"
                  : "hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                setIsShopOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <Package className="w-5 h-5" />
              Place Order
            </button>
          </li>
          {navItems.slice(1).map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-white/20 text-white border-l-4 border-white"
                    : "hover:bg-white/10"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FDF5E6] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-full md:w-64 bg-fh-orange text-white flex-shrink-0 flex flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-64 bg-fh-orange text-white z-50 flex flex-col shadow-xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-fh-orange"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <CartSheet>
              <button className="relative p-2 text-gray-500 hover:text-fh-orange">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-fh-navy text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </CartSheet>
            <div className="w-8 h-8 rounded-full bg-fh-orange text-white flex items-center justify-center font-bold text-sm uppercase">
              {(
                localStorage.getItem("businessName") ||
                localStorage.getItem("contactPerson") ||
                localStorage.getItem("name") ||
                "S"
              ).charAt(0)}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("id");
                localStorage.removeItem("userType");
                localStorage.removeItem("phone");
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                localStorage.removeItem("contactPerson");
                localStorage.removeItem("businessName");
                localStorage.removeItem("email");
                navigate("/");
              }}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-3 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet context={{ setIsShopOpen }} />
        </div>
      </main>

      <Dialog open={isShopOpen} onOpenChange={setIsShopOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-y-auto bg-fh-gray">
          <Shop />
        </DialogContent>
      </Dialog>
    </div>
  );
};
