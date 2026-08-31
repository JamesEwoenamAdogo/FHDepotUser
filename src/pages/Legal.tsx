import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Legal = () => {
  return (
    <div className="min-h-screen bg-fh-gray py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-fh-navy mb-4">
              Legal Policies
            </h1>
            <p className="text-gray-600 text-lg">
              Review our terms, policies, and operational guidelines.
            </p>
          </div>

          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <TabsTrigger
                value="terms"
                className="data-[state=active]:bg-fh-navy data-[state=active]:text-white py-3 rounded-lg text-sm md:text-base"
              >
                Terms & Conditions
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="data-[state=active]:bg-fh-navy data-[state=active]:text-white py-3 rounded-lg text-sm md:text-base"
              >
                Privacy Policy
              </TabsTrigger>
              <TabsTrigger
                value="refund"
                className="data-[state=active]:bg-fh-navy data-[state=active]:text-white py-3 rounded-lg text-sm md:text-base"
              >
                Refund Policy
              </TabsTrigger>
              <TabsTrigger
                value="credit"
                className="data-[state=active]:bg-fh-navy data-[state=active]:text-white py-3 rounded-lg text-sm md:text-base"
              >
                Credit & Debt
              </TabsTrigger>
            </TabsList>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose prose-gray max-w-none">
              <TabsContent value="terms" className="mt-0">
                <h2 className="text-3xl font-bold text-fh-navy mb-6">
                  Terms and Conditions
                </h2>
                <p className="text-gray-600 mb-4">
                  Last Updated: {new Date().toLocaleDateString()}
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  1. Introduction
                </h3>
                <p>
                  Welcome to FH Depot. These Terms and Conditions govern your
                  use of our website, wholesale portal, and distribution
                  services. By accessing our platform, you agree to comply with
                  these terms, which are in alignment with Ghanaian national
                  standards and international business practices.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  2. Account Registration
                </h3>
                <p>
                  Wholesale/Trade customers must provide accurate, current, and
                  complete business information during registration. FH Depot
                  reserves the right to verify business credentials and suspend
                  accounts providing false information.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  3. Orders and Pricing
                </h3>
                <p>
                  All prices are listed in Ghana Cedis (GHS) unless otherwise
                  stated. We reserve the right to modify prices based on market
                  fluctuations. Orders are subject to availability and
                  acceptance by FH Depot.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  4. Delivery and Logistics
                </h3>
                <p>
                  Delivery timelines are estimates and may be affected by
                  factors beyond our control. Risk of loss passes to the buyer
                  upon delivery. Customers must inspect goods upon receipt and
                  report any discrepancies immediately.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  5. Intellectual Property
                </h3>
                <p>
                  All content on this website, including logos, text, and
                  graphics, is the property of FH Depot and is protected by
                  intellectual property laws.
                </p>
              </TabsContent>

              <TabsContent value="privacy" className="mt-0">
                <h2 className="text-3xl font-bold text-fh-navy mb-6">
                  Privacy Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  Last Updated: {new Date().toLocaleDateString()}
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  1. Information Collection
                </h3>
                <p>
                  We collect information necessary to provide our distribution
                  services, including business details, contact information,
                  delivery addresses, and payment data. This aligns with the
                  Ghana Data Protection Act, 2012 (Act 843).
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  2. Use of Information
                </h3>
                <p>
                  Your data is used to process orders, manage accounts, improve
                  our services, and communicate important updates. We do not
                  sell your personal or business information to third parties.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  3. Data Security
                </h3>
                <p>
                  We implement industry-standard security measures to protect
                  your data from unauthorized access, alteration, or disclosure.
                  Payment processing is handled by secure, compliant third-party
                  gateways.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  4. Cookies and Tracking
                </h3>
                <p>
                  Our website uses cookies to enhance user experience and
                  analyze site traffic. You can manage cookie preferences
                  through your browser settings.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  5. Your Rights
                </h3>
                <p>
                  You have the right to access, correct, or request deletion of
                  your personal data held by FH Depot, subject to legal and
                  operational retention requirements.
                </p>
              </TabsContent>

              <TabsContent value="refund" className="mt-0">
                <h2 className="text-3xl font-bold text-fh-navy mb-6">
                  Refund Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  Last Updated: {new Date().toLocaleDateString()}
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  1. Eligible Refunds
                </h3>
                <p>
                  Refunds or replacements may be issued for damaged goods,
                  expired products upon delivery, or incorrect order
                  fulfillment. Claims must be made within 48 hours of delivery.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  2. Return Procedures
                </h3>
                <p>
                  To initiate a return, contact your dedicated account manager
                  or our support team with your order number and photographic
                  evidence of the issue. Items must be returned in their
                  original packaging.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  3. Non-Refundable Products
                </h3>
                <p>
                  Opened consumables, temperature-sensitive items that have been
                  improperly stored after delivery, and clearance items are
                  generally not eligible for refunds.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  4. Refund Timelines
                </h3>
                <p>
                  Approved refunds will be processed within 5-7 business days.
                  Funds will be returned to the original payment method or
                  credited to your wholesale account balance, depending on your
                  preference.
                </p>
              </TabsContent>

              <TabsContent value="credit" className="mt-0">
                <h2 className="text-3xl font-bold text-fh-navy mb-6">
                  Credit and Debt Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  Last Updated: {new Date().toLocaleDateString()}
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  1. Credit Eligibility
                </h3>
                <p>
                  Credit facilities are available to approved wholesale/trade
                  customers who meet our financial criteria and have a minimum
                  of 6 months trading history with FH Depot.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  2. Payment Terms
                </h3>
                <p>
                  Standard credit terms are strictly 14 to 30 days from the date
                  of invoice, as specified in your approved credit agreement.
                  All payments must be made in full by the due date.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  3. Overdue Penalties
                </h3>
                <p>
                  Accounts exceeding their payment terms will incur a late
                  payment interest charge of 2% per month on the outstanding
                  balance. Credit facilities will be automatically suspended for
                  accounts over 15 days past due.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  4. Debt Recovery Procedures
                </h3>
                <p>
                  FH Depot reserves the right to employ third-party debt
                  collection agencies or take legal action to recover
                  outstanding debts. The customer will be liable for all costs
                  associated with debt recovery.
                </p>

                <h3 className="text-xl font-semibold text-fh-navy mt-8 mb-3">
                  5. Credit Review
                </h3>
                <p>
                  Credit limits and terms are reviewed annually or upon request.
                  FH Depot reserves the right to reduce or withdraw credit
                  facilities at our discretion based on payment history and
                  market conditions.
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Legal;
