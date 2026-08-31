import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Phone,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart/CartSheet";
import { useCart } from "@/context/CartContext";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const isLoggedIn = !!localStorage.getItem("id");
  const isShopper =
    !localStorage.getItem("businessName") &&
    !localStorage.getItem("contactPerson");
  const dashboardPath = isShopper ? "/shopper-portal" : "/wholesale-portal";
  const isOnPortal =
    location.pathname.startsWith("/wholesale-portal") ||
    location.pathname.startsWith("/shopper-portal");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (isOnPortal) {
    return null;
  }

  return (
    <header
      className={`w-full transition-all duration-300 relative z-50 ${isScrolled ? "bg-white shadow-sm" : "bg-white"}`}
    >
      {/* Main Navigation */}
      <div className="container mx-auto px-4 lg:px-8 bg-white">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center">
              <img
                src="https://vibe.filesafe.space/1777550826607701741/attachments/1c3b8668-f070-42b5-a193-3739e35b027a.png"
                alt="FH Depot"
                className="h-12 object-contain"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Order/Shop", path: "/shop" },
                { name: "Careers", path: "/careers" },
                { name: "Contact Us", path: "/contact" },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold transition-all hover:text-fh-orange ${
                    location.pathname === link.path
                      ? "text-fh-navy underline decoration-2 underline-offset-8 decoration-fh-orange"
                      : "text-gray-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {!isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-3">
                {/* Login dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-fh-orange hover:bg-fh-orange/10 rounded-md transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Login</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden w-52">
                      <Link
                        to="/login"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-fh-orange/10 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-fh-navy/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-fh-navy" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fh-navy">
                            Wholesale Login
                          </p>
                          <p className="text-xs text-gray-500">
                            Trade customer portal
                          </p>
                        </div>
                      </Link>
                      <Link
                        to="/login?type=shopper"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-fh-orange/10 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-fh-navy/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-fh-navy" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fh-navy">
                            Shopper Login
                          </p>
                          <p className="text-xs text-gray-500">
                            Individual shopper portal
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Sign Up dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-fh-orange hover:bg-fh-orangeHover rounded-md transition-colors">
                    Sign Up
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden w-52">
                      <Link
                        to="/wholesale"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-fh-orange/10 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-fh-navy/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-fh-navy" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fh-navy">
                            Wholesaler
                          </p>
                          <p className="text-xs text-gray-500">
                            Trade customer signup
                          </p>
                        </div>
                      </Link>
                      <Link
                        to="/login?mode=signup&type=shopper"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-fh-orange/10 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-fh-navy/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-fh-navy" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fh-navy">
                            Shopper
                          </p>
                          <p className="text-xs text-gray-500">
                            Individual shopper signup
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className="text-gray-600 hover:text-fh-navy hover:bg-fh-navy/10 px-3"
                >
                  <Link to={dashboardPath}>Dashboard</Link>
                </Button>
                <div className="w-8 h-8 rounded-full bg-fh-navy text-white flex items-center justify-center font-bold text-sm uppercase">
                  {(
                    localStorage.getItem("businessName") ||
                    localStorage.getItem("contactPerson") ||
                    localStorage.getItem("name") ||
                    "U"
                  ).charAt(0)}
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate("/");
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            )}

            <CartSheet>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-fh-orange hover:bg-fh-orange/10 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-fh-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </CartSheet>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — fixed overlay, always on top */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
          }}
        >
          {/* Dark backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(18,58,99,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Floating panel */}
          <div
            style={{ position: "relative", zIndex: 1 }}
            className="bg-white shadow-2xl w-[calc(100%-2rem)] mx-auto mt-4 rounded-xl px-4 pt-5 pb-6 flex flex-col gap-4"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <img
                src="https://vibe.filesafe.space/1777550826607701741/attachments/1c3b8668-f070-42b5-a193-3739e35b027a.png"
                alt="FH Depot"
                className="h-10 object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-fh-gray transition-colors"
              >
                <X className="w-5 h-5 text-fh-navy" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-fh-gray border border-gray-200 text-sm"
              />
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-1">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Order/Shop", path: "/shop" },
                { name: "Careers", path: "/careers" },
                { name: "Contact Us", path: "/contact" },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`p-3 rounded-lg font-semibold transition-colors text-base ${
                    location.pathname === link.path
                      ? "bg-fh-orange/10 text-fh-orange"
                      : "text-gray-700 hover:bg-fh-orange/10 hover:text-fh-orange"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* CTAs */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              {!isLoggedIn ? (
                <>
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      className="flex-1 text-center bg-fh-navy text-white py-3 rounded-lg font-semibold hover:bg-fh-navyHover transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Wholesale Login
                    </Link>
                    <Link
                      to="/login?type=shopper"
                      className="flex-1 text-center bg-fh-navy text-white py-3 rounded-lg font-semibold hover:bg-fh-navyHover transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Shopper Login
                    </Link>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/wholesale"
                      className="flex-1 text-center bg-fh-orange text-white py-3 rounded-lg font-semibold hover:bg-fh-orangeHover transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Wholesaler Signup
                    </Link>
                    <Link
                      to="/login?mode=signup&type=shopper"
                      className="flex-1 text-center bg-white border border-fh-orange text-fh-orange py-3 rounded-lg font-semibold hover:bg-fh-orange/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Shopper Signup
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to={dashboardPath}
                    className="w-full text-center bg-fh-navy text-white py-3 rounded-lg font-semibold hover:bg-fh-navyHover transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate("/");
                    }}
                    className="w-full text-center bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              <Link
                to="/shop"
                className="w-full text-center bg-fh-orange text-white py-3 rounded-lg font-semibold hover:bg-fh-orangeHover transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
