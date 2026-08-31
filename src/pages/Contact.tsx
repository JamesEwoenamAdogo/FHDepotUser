import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-fh-gray pt-16 pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-fh-navy mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600">
            Get in touch with our team for wholesale inquiries, support, or
            general questions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-fh-navy mb-6">
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-fh-orange/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-fh-orange" />
                  </div>
                  <div>
                    <p className="font-medium text-fh-navy mb-1">Head Office</p>
                    <p className="text-gray-500 text-sm">
                      42 Haatso-Atomic Rd, Accra, Ghana
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-fh-orange/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-fh-orange" />
                  </div>
                  <div>
                    <p className="font-medium text-fh-navy mb-1">Phone</p>
                    <p className="text-gray-500 text-sm">+233 20 123 4567</p>
                    <p className="text-gray-500 text-sm">+233 24 987 6543</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-fh-orange/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-fh-orange" />
                  </div>
                  <div>
                    <p className="font-medium text-fh-navy mb-1">Email</p>
                    <p className="text-gray-500 text-sm">sales@fhdepot.com</p>
                    <p className="text-gray-500 text-sm">support@fhdepot.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-fh-orange/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-fh-orange" />
                  </div>
                  <div>
                    <p className="font-medium text-fh-navy mb-1">
                      Business Hours
                    </p>
                    <p className="text-gray-500 text-sm font-semibold mt-2">
                      Walk In Ordering:
                    </p>
                    <p className="text-gray-500 text-sm">
                      Mon - Fri: 7:30 AM - 6:00 PM
                    </p>
                    <p className="text-gray-500 text-sm">
                      Sat: 7:30 AM - 6:00 PM
                    </p>
                    <p className="text-gray-500 text-sm font-semibold mt-2">
                      Online Ordering:
                    </p>
                    <p className="text-gray-500 text-sm">24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-fh-navy mb-6">
                Send us a Message
              </h3>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  const trackingPayload = {
                    type: "external_form_submission",
                    timestamp: Date.now(),
                    formId: "Contact Form",
                    formData: {
                      first_name: formData.get("firstName"),
                      last_name: formData.get("lastName"),
                      email: formData.get("email"),
                      phone: formData.get("phone"),
                      "contact.subject": formData.get("subject"),
                      "contact.inquiry_message": formData.get("message"),
                    },
                    formLabels: {
                      first_name: "First Name",
                      last_name: "Last Name",
                      email: "Email",
                      phone: "Phone Number",
                      "contact.subject": "Subject",
                      "contact.inquiry_message": "Message",
                    },
                    url: window.location.href,
                    title: document.title,
                    path: window.location.pathname,
                    userAgent: navigator.userAgent,
                    trackingId: "tk_cc35982aeb8c48a9a5d0edb34e489e6e",
                    locationId: "OZdF13TpWyTQ9He5f1Ap",
                    sessionId: crypto.randomUUID(),
                    properties: {
                      deviceType: /Mobile|Android|iPhone/i.test(
                        navigator.userAgent,
                      )
                        ? "mobile"
                        : "desktop",
                    },
                  };

                  fetch(
                    "https://backend.leadconnectorhq.com/external-tracking/events",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        version: "2021-07-28",
                      },
                      body: JSON.stringify(trackingPayload),
                    },
                  ).catch(() => {});

                  e.currentTarget.reset();
                  alert("Message sent successfully!");
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-fh-navy">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      placeholder="John"
                      className="bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-fh-navy">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      placeholder="Doe"
                      className="bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-fh-navy">
                      Email Address (Optional)
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className="bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-fh-navy">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      required
                      placeholder="+233 XX XXX XXXX"
                      className="bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-fh-navy">
                    Subject
                  </Label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-fh-gray/30 text-sm focus:outline-none focus:ring-1 focus:ring-fh-orange focus:border-fh-orange"
                  >
                    <option>General Inquiry</option>
                    <option>Wholesale Order</option>
                    <option>Delivery Issue</option>
                    <option>Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-fh-navy">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    className="bg-fh-gray/30 border-gray-200 focus:border-fh-orange"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-fh-orange hover:bg-fh-orangeHover text-white"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="max-w-6xl mx-auto mt-16 rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[400px]">
          <iframe
            src="https://maps.google.com/maps?q=42%20Haatso-Atomic%20Rd,%20Accra,%20Ghana&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="FH Depot Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
