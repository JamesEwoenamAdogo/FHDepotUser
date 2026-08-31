import { Link, useLocation, useNavigate } from "react-router-dom";

export const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnPortal =
    location.pathname.startsWith("/wholesale-portal") ||
    location.pathname.startsWith("/shopper-portal");

  if (isOnPortal) {
    return null;
  }

  const goToTermsTop = () => {
    if (location.pathname === "/legal") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/legal");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  };

  return (
    <footer className="bg-fh-navy text-white pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                FH <span className="text-fh-orange">Depot</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Ghana's premium woman-led FMCG distribution company. We Only Deal
              In Quality.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-white mb-2">
              Quick Links
            </h4>
            <Link
              to="/shop"
              className="text-gray-300 hover:text-fh-orange transition-colors text-sm"
            >
              Shop Products
            </Link>
            <Link
              to="/login"
              className="text-gray-300 hover:text-fh-orange transition-colors text-sm"
            >
              Wholesale/Trade Customer
            </Link>
            <Link
              to="/login"
              className="text-gray-300 hover:text-fh-orange transition-colors text-sm"
            >
              Wholesaler Portal
            </Link>
            <Link
              to="/careers"
              className="text-gray-300 hover:text-fh-orange transition-colors text-sm"
            >
              Careers
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-fh-orange transition-colors text-sm"
            >
              Contact Us
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-white mb-2">Legal</h4>
            <button
              onClick={goToTermsTop}
              className="text-gray-300 hover:text-fh-orange transition-colors text-sm text-left"
            >
              Terms &amp; Conditions
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} FH Depot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
