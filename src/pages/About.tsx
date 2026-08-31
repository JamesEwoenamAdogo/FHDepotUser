import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, Eye } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-fh-gray pt-16 pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-fh-navy mb-6">
              Our Story
            </h1>
            <p className="text-xl text-gray-600 mb-6 font-medium">
              Ghana's leading woman-led FMCG distribution company, delivering
              quality products to businesses and homes nationwide.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Founded by Freda Donkor, an award-winning entrepreneur, FH Depot
              was built on a clear vision: to streamline the distribution of
              premium beverages, snacks, and corporate supplies across Ghana.
              What started as a solution to the inefficiencies and delays in
              sourcing quality goods has grown into a trusted partner for
              hundreds of retailers, hotels, restaurants, and corporate offices
              nationwide.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Today, FH Depot is known for reliable sourcing, consistent product
              quality, and responsive service that helps businesses keep their
              shelves stocked and operations running smoothly.
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-fh-orange hover:bg-fh-orangeHover text-white h-12 px-6"
              >
                <Link to="/wholesale">Join Our Network</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-fh-navy text-fh-navy hover:bg-fh-navy/5 h-12 px-6"
              >
                <a href="#team">View Our Team</a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <img
                src="https://wsrv.nl/?url=https%3A%2F%2Fvibe.filesafe.space%2F1777550826607701741%2Fattachments%2Fbc79ab57-11ec-4cec-85fd-b103f1beda3a.png&w=600&output=webp&q=70"
                alt="FH Depot Leadership"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-fh-orange/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-6 -right-6 w-48 h-48 bg-fh-navy/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-fh-navy rounded-3xl p-12 text-white mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fh-orange/20 rounded-full blur-3xl"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 text-center">
            <div>
              <div className="text-4xl font-bold text-fh-orange mb-2">10+</div>
              <div className="text-white/80">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-fh-orange mb-2">500+</div>
              <div className="text-white/80">Corporate Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-fh-orange mb-2">50k+</div>
              <div className="text-white/80">Deliveries Made</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-fh-orange mb-2">100%</div>
              <div className="text-white/80">Quality Guarantee</div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="bg-white border border-gray-100 rounded-2xl p-10 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-fh-orange/10 rounded-full flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-fh-orange" />
            </div>
            <h2 className="text-3xl font-bold text-fh-navy mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To provide seamless, reliable, and premium FMCG distribution
              services across Ghana, empowering businesses with the products
              they need to thrive while delivering exceptional value and
              customer service.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-10 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-fh-navy/10 rounded-full flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-fh-navy" />
            </div>
            <h2 className="text-3xl font-bold text-fh-navy mb-4">Our Vision</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To be West Africa's most trusted and innovative FMCG distribution
              network, setting the standard for quality, efficiency, and
              corporate partnerships in the beverage and retail sector.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div id="team" className="text-center mb-16">
          <h2 className="text-4xl font-bold text-fh-navy mb-4">
            Meet Our Team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The dedicated professionals behind FH Depot's success, all wearing
            our signature navy and orange uniforms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              name: "Sebastian Selasi Yormasah",
              role: "Chief Finance Officer",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fassets.cdn.filesafe.space%2FOZdF13TpWyTQ9He5f1Ap%2Fmedia%2F6a3aaa51181eb301d4437121.png&w=400&h=500&output=webp&q=70",
            },
            {
              name: "Eric Kojo Mensah",
              role: "Head of Operations",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fvibe.filesafe.space%2F1780236389749984913%2Fattachments%2Fda371e54-6c6d-413e-848c-4916dfef951e.jpg&w=400&h=500&output=webp&q=70",
            },
            {
              name: "Priscilla Naana Asabea Simpeh",
              role: "Executive Administrator",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fassets.cdn.filesafe.space%2FOZdF13TpWyTQ9He5f1Ap%2Fmedia%2F6a3a7964ae7d476839fa6dc8.png&w=400&h=500&output=webp&q=70",
            },
            {
              name: "Bernard Kwame Ampofo",
              role: "Procurement & Supply Chain Officer",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fassets.cdn.filesafe.space%2FOZdF13TpWyTQ9He5f1Ap%2Fmedia%2F6a3a84e12ed3b9e323a4e1df.png&w=400&h=500&output=webp&q=70",
            },
            {
              name: "Diana Ameyedowo",
              role: "Receivables/Payables Accountant",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fassets.cdn.filesafe.space%2FOZdF13TpWyTQ9He5f1Ap%2Fmedia%2F6a3a79642ed3b9e3239e6539.png&w=400&h=500&output=webp&q=70",
            },
            {
              name: "Gifty Sapaty",
              role: "Senior Sales Executive",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fassets.cdn.filesafe.space%2FOZdF13TpWyTQ9He5f1Ap%2Fmedia%2F6a3aa5adb2e956bc2407c424.png&w=400&h=500&output=webp&q=70",
            },
            {
              name: "Rita Kedeh",
              role: "Waybill Supervisor",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fassets.cdn.filesafe.space%2FOZdF13TpWyTQ9He5f1Ap%2Fmedia%2F6a3aa4ca181eb301d442a5b2.png&w=400&h=500&output=webp&q=70",
            },
            {
              name: "Francillia Grace Gyimah",
              role: "Waybill Supervisor",
              image:
                "https://wsrv.nl/?url=https%3A%2F%2Fassets.cdn.filesafe.space%2FOZdF13TpWyTQ9He5f1Ap%2Fmedia%2F6a3aa4ca109a1ab49dce6eb9.png&w=400&h=500&output=webp&q=70",
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-fh-navy mb-1">
                  {member.name}
                </h3>
                <p className="text-fh-orange font-medium">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
