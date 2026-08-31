import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const words = ["Quality", "Excellence", "Perfection"];

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [inView, motionValue, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  const goToPageTop = (path: string) => {
    navigate(path);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  useEffect(() => {
    let currentText = "";
    let currentIndex = 0;
    let isDeleting = false;
    const fullText = words[wordIndex];
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (!isDeleting && currentIndex < fullText.length) {
        currentText += fullText[currentIndex];
        setTypedText(currentText);
        currentIndex++;
        timeout = setTimeout(type, 150);
      } else if (!isDeleting && currentIndex === fullText.length) {
        timeout = setTimeout(() => {
          isDeleting = true;
          type();
        }, 4000);
      } else if (isDeleting && currentIndex > 0) {
        currentText = currentText.slice(0, -1);
        setTypedText(currentText);
        currentIndex--;
        timeout = setTimeout(type, 50);
      } else if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    timeout = setTimeout(type, 500);

    return () => clearTimeout(timeout);
  }, [wordIndex]);
  // Chat widget moved to App.tsx for global access
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-fh-navy overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://vibe.filesafe.space/1780236389749984913/assets/bdc4a90a-276a-4675-bc56-8fa4cad7e580.png"
            alt="FH Depot Warehouse"
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-fh-navy via-fh-navy/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-fh-navy via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="pt-[120px]"
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                We Only Deal In <br />
                <span className="text-fh-orange inline-flex items-center mt-2 h-[1.2em]">
                  {typedText}
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 mb-10 max-w-2xl leading-relaxed">
                Ghana’s Premium Woman-Led FMCG Distribution Company. Supplying
                supermarkets, hotels, and retail chains with world-class
                beverages and consumer goods.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-fh-orange hover:bg-fh-orangeHover text-white h-14 px-8 text-lg"
                >
                  <Link to="/shop">
                    Shop Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-14 px-8 text-lg backdrop-blur-sm"
                >
                  <Link to="/wholesale">Wholesale Orders</Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-fh-orange h-14 px-8 text-lg"
                  onClick={() => goToPageTop("/wholesale")}
                >
                  Become a Distributor
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/20 pt-8 pb-[120px]"
            >
              <div>
                <p className="text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={10} suffix="k+" />
                </p>
                <p className="text-gray-300 text-sm">Products Delivered</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={500} suffix="+" />
                </p>
                <p className="text-gray-300 text-sm">Wholesale Partners</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={99} suffix="%" />
                </p>
                <p className="text-gray-300 text-sm">On-Time Delivery</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={24} suffix="/7" />
                </p>
                <p className="text-gray-300 text-sm">Customer Support</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-fh-gray">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-fh-navy mb-4">
              Why Choose FH Depot?
            </h2>
            <p className="text-lg text-gray-600">
              We provide an enterprise-grade distribution network tailored for
              Ghana's fast-moving consumer goods market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Package,
                title: "Extensive Catalog",
                desc: "Access thousands of premium beverages and snacks from top global brands.",
              },
              {
                icon: Truck,
                title: "Fast Logistics",
                desc: "Priority delivery routes ensuring your shelves are never empty.",
              },
              {
                icon: ShieldCheck,
                title: "Quality Assured",
                desc: "100% authentic products sourced directly from manufacturers.",
              },
              {
                icon: TrendingUp,
                title: "Trade Pricing",
                desc: "Exclusive wholesale discounts and credit facilities for partners.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-fh-navy/5 rounded-xl flex items-center justify-center mb-6 text-fh-orange">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-fh-navy mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-fh-navy mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-gray-600">
                Explore our wide range of quality products.
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              className="hidden md:flex text-fh-orange hover:text-fh-orangeHover hover:bg-fh-orange/10"
            >
              <Link to="/shop">
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Carbonated Drinks",
                img: "https://vibe.filesafe.space/1780236389749984913/assets/a1c8b17a-c09f-4bc7-9dae-8be82f2c5de1.png",
              },
              {
                name: "Non-Carbonated Drinks",
                img: "https://vibe.filesafe.space/1780236389749984913/assets/3e24ffe0-2664-4f41-a351-b6088696c22d.png",
              },
              {
                name: "Water",
                img: "https://vibe.filesafe.space/1780236389749984913/assets/cf4dee86-4c8b-44cb-8587-585db564454a.png",
              },
              {
                name: "Juices",
                img: "https://vibe.filesafe.space/1780236389749984913/assets/684d7a2b-44d9-4db5-98f1-c52b7d35b299.png",
              },
              {
                name: "Wines",
                img: "https://vibe.filesafe.space/1780236389749984913/assets/639c9a74-63ac-4791-8d9d-9aa93dd09aec.png",
              },
              {
                name: "Snacks",
                img: "https://vibe.filesafe.space/1780236389749984913/assets/83cea278-8c7a-4e57-9052-f9ff16e768f1.png",
              },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={`/shop?category=${cat.name}`}
                className="group relative h-40 rounded-xl overflow-hidden bg-fh-gray flex items-end p-4 transition-transform hover:-translate-y-1"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-fh-navy/90 via-fh-navy/40 to-transparent z-10"></div>
                <span className="relative z-20 text-white font-medium group-hover:text-fh-orange transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-fh-navy relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-fh-orange/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to scale your inventory?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join hundreds of retailers and businesses in Ghana who trust FH
              Depot for their wholesale supplies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-fh-orange hover:bg-fh-orangeHover text-white h-14 px-8 text-lg"
                onClick={() => goToPageTop("/wholesale")}
              >
                Become a Trade Customer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-fh-navy h-14 px-8 text-lg"
                onClick={() => goToPageTop("/contact")}
              >
                Contact Sales Team
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
