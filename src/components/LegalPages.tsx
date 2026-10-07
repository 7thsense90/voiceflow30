import React, { useState } from 'react';
import { SEOHead } from './SEOHead';

export const PageWrapper: React.FC<{
  title: string;
  subtitle?: string;
  description?: string;
  canonicalPath?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, description, canonicalPath, children }) => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <SEOHead
      title={title}
      description={
        description ||
        `Official ${title} for Voice Flow 360 - Independent consumer research and conversational feedback platform.`
      }
      canonicalPath={canonicalPath}
    />
    <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
    {subtitle && <p className="text-sm text-slate-500 mb-8">{subtitle}</p>}
    {!subtitle && <div className="mb-8" />}
    <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-purple-600 hover:prose-a:text-purple-500">
      {children}
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <PageWrapper
    title="Privacy Policy"
    description="Learn how Voice Flow 360 protects your personal data, survey responses, and reward cashout privacy in compliance with global standards and Google AdSense policies."
    canonicalPath="/privacy"
  >
    <h3>1. Information We Collect</h3>
    <p>
      When you use Voice Flow 360, we may collect personal information such as your name, email address, demographic preferences (for survey targeting), and payment or wallet details to facilitate coin reward redemptions. We also collect usage data, device telemetry, and browser information to maintain system security, detect bot fraud, and optimize survey matching.
    </p>
    
    <h3>2. How We Use Your Information</h3>
    <p>
      We use your information to provide, maintain, and improve our services, process payout transactions, prevent fraud, send system updates, and deliver authentic market research to brand partners in an aggregated, anonymized format.
    </p>
    
    <h3>3. Data Sharing and Disclosure</h3>
    <p>
      We do not sell your personal data. We only share information with trusted third-party service providers (such as cloud hosting infrastructure and payout processors) strictly as required to operate our services.
    </p>
    
    <h3>4. Google AdSense &amp; Third-Party Advertising Policy</h3>
    <p>
      Voice Flow 360 intends to use Google AdSense to display advertisements once the website is approved and advertising is enabled. Advertisements will appear only on eligible public articles and research content pages.
    </p>
    <p>
      Advertisements will not be displayed within customer dashboards, survey sessions, wallets, withdrawal pages or administrative areas. Participant rewards are earned for eligible, accepted survey responses and are not awarded for viewing, clicking or otherwise interacting with advertisements.
    </p>
    <p>
      The following disclosures explain how advertising cookies and related technologies may be used when advertising is enabled:
    </p>
    <ul className="list-disc pl-6 space-y-2 text-slate-600">
      <li>
        <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies and similar identifiers to serve ads based on a user's prior visits to Voice Flow 360 or other websites on the Internet.
      </li>
      <li>
        <strong>Personalized Advertising:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visits to our site and/or other sites across the World Wide Web.
      </li>
      <li>
        <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 underline">Google Ads Settings</a>.
      </li>
      <li>
        <strong>Third-Party Opt-Out Portals:</strong> You can also opt out of participating third-party ad networks and vendors&apos; use of cookies for personalized advertising by visiting the <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 underline">Digital Advertising Alliance (www.aboutads.info)</a> or the <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 underline">Network Advertising Initiative (NAI) Opt-Out Tool</a>.
      </li>
      <li>
        <strong>How Google Uses Information:</strong> For more information on how Google collects and uses information when you visit sites that use Google AdSense, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 underline">How Google uses information from sites or apps that use our services</a>.
      </li>
    </ul>

    <h3>5. Cookies and Tracking Technologies</h3>
    <p>
      We use cookies, web beacons, and local storage to store session preferences, secure account sessions, analyze site performance, and serve relevant advertisements. You can configure your browser to decline all cookies or to alert you when a cookie is sent. However, certain interactive features (such as survey progression and authenticated rewards) may require cookies to function correctly.
    </p>

    <h3>6. European Economic Area (EEA) &amp; UK User Rights (GDPR)</h3>
    <p>
      In accordance with the European Union General Data Protection Regulation (GDPR) and Google&apos;s EU User Consent Policy, users located in the EEA and the UK are presented with choices regarding cookie usage and personalized ads. You have the right to access, rectify, port, or erase your data, and withdraw consent at any time.
    </p>

    <h3>7. California Privacy Rights (CCPA / CPRA)</h3>
    <p>
      Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents have the right to know what personal information is collected, request deletion of their personal information, and opt out of the sale or sharing of their personal information for cross-context behavioral advertising. Voice Flow 360 does not sell personal information for monetary consideration.
    </p>

    <h3>8. Children&apos;s Online Privacy Protection (COPPA)</h3>
    <p>
      Voice Flow 360 is intended strictly for users who are at least 18 years of age (or the legal age of majority in their jurisdiction). We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
    </p>

    <h3>9. Data Security &amp; Contact Information</h3>
    <p>
      We employ robust technical and organizational security measures to protect your information. If you have questions regarding this Privacy Policy, our advertising integrations, or wish to exercise your privacy rights, please contact our Data Protection Officer at <a href="mailto:privacy@voiceflow360.com" className="font-semibold text-purple-600">privacy@voiceflow360.com</a> or via our <a href="#contact" className="font-semibold text-purple-600">Contact Us</a> page.
    </p>
    
    <p className="text-sm text-slate-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
  </PageWrapper>
);

export const TermsOfService: React.FC = () => (
  <PageWrapper
    title="Terms of Service"
    description="Review the official terms of service, reward redemption guidelines, anti-fraud standards, and user rights for Voice Flow 360."
    canonicalPath="/terms"
  >
    <h3>1. Acceptance of Terms</h3>
    <p>By accessing and using Voice Flow 360, you accept and agree to be bound by these Terms of Service. If you do not agree, you must not use our platform.</p>
    
    <h3>2. User Eligibility</h3>
    <p>You must be at least 18 years old or the age of majority in your jurisdiction to participate in surveys and redeem rewards on our platform.</p>
    
    <h3>3. Earning and Redeeming Rewards</h3>
    <p>
      Coins earned through completed, accepted surveys undergo monthly quality reviews before transferring to your Redeemable Wallet on the 1st of each calendar month. Redemptions require reaching our standardized minimum threshold of 2,000 Coins ($20.00 USD) and are disbursed via our authorized payment rails: Direct Bank Transfer (ACH, SEPA, Wire) and Cryptocurrency (USDT, BTC). All redemptions are subject to the detailed <a href="/rewards" className="font-semibold text-purple-600 hover:underline">Rewards &amp; Withdrawals Policy</a>. We reserve the right to audit, adjust, or invalidate coins earned through fraudulent activity, automated scripts, contradictory answers, or violation of these terms.
    </p>
    
    <h3>4. Prohibited Conduct</h3>
    <p>You agree not to use automated scripts, multiple accounts, or false information to artificially inflate your rewards. Violation will result in immediate account suspension and forfeiture of all coins.</p>
    
    <h3>5. Modifications to Service &amp; Fixed Conversion Ratio Policy</h3>
    <p>
      We reserve the right to modify platform operational features, available survey campaigns, and technical infrastructure. However, in accordance with our published <a href="/rewards" className="font-semibold text-purple-600 hover:underline">Rewards &amp; Withdrawals Policy</a>, all already-earned and credited coins maintain our published fixed conversion ratio of <strong>100 Coins = $1.00 USD ($0.01 per coin)</strong>. Any prospective modifications to minimum payout thresholds or disbursement rails will be announced with at least 30 days&apos; advance notice to active participants, ensuring no retroactive devaluation of accrued rewards. Contact <a href="mailto:legal@voiceflow360.com" className="font-semibold text-purple-600">legal@voiceflow360.com</a> for legal inquiries.
    </p>
    
    <p className="text-sm text-slate-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
  </PageWrapper>
);

export const AboutUs: React.FC = () => (
  <PageWrapper title="About Us">
    <p className="text-lg leading-relaxed text-slate-700 mb-6">
      Voice Flow 360 is a next-generation consumer intelligence platform designed to bridge the gap between forward-thinking brands and engaged consumers.
    </p>
    
    <h3>Our Mission</h3>
    <p>We believe that your opinion is valuable and should be rewarded fairly. Our mission is to make providing feedback as easy and conversational as chatting with a friend, while helping brands build better products.</p>
    
    <h3>How It Works</h3>
    <p>Instead of traditional, boring web forms, we use a conversational chat interface. You simply chat with our automated system to answer questions about products, services, and brands. For every completed and accepted campaign, you earn coins that can be redeemed for cash via Direct Bank Transfer or Cryptocurrency once reaching our standardized $20 (2,000 Coins) threshold.</p>
    
    <h3>For Brands</h3>
    <p>We provide brands with high-quality, actionable insights through AI-powered conversational surveys. Our engaging format results in higher completion rates and more authentic feedback from a diverse audience.</p>
  </PageWrapper>
);

export const ContactUs: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageWrapper
      title="Contact Us"
      description="Need support with your Voice Flow 360 survey rewards or brand partnership? Contact our customer and platform team."
      canonicalPath="/contact"
    >
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div>
          <p className="text-slate-600 leading-relaxed">
            Have a question, feedback, partnership inquiry, or need help with a reward redemption? Our dedicated support team is here to assist you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100">
            <h4 className="font-bold text-slate-900 text-sm mb-1">General Inquiries</h4>
            <p className="text-xs text-slate-500 mb-2">Platform questions &amp; general assistance</p>
            <a href="mailto:contact@voiceflow360.com" className="text-xs font-bold text-purple-700 hover:text-purple-900 underline block break-all">
              contact@voiceflow360.com
            </a>
          </div>
          
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Support &amp; Rewards</h4>
            <p className="text-xs text-slate-500 mb-2">Payouts, coins &amp; account queries</p>
            <a href="mailto:support@voiceflow360.com" className="text-xs font-bold text-amber-700 hover:text-amber-900 underline block break-all">
              support@voiceflow360.com
            </a>
          </div>
          
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Brand Partnerships</h4>
            <p className="text-xs text-slate-500 mb-2">Enterprise surveys &amp; custom research</p>
            <a href="mailto:partners@voiceflow360.com" className="text-xs font-bold text-blue-700 hover:text-blue-900 underline block break-all">
              partners@voiceflow360.com
            </a>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-lg mb-2">Send us a direct message</h4>
          <p className="text-xs text-slate-500 mb-6">Our team usually responds within 24 business hours.</p>
          
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto font-black text-lg">
                ✓
              </div>
              <h5 className="font-bold text-emerald-900 text-sm">Message Sent Successfully!</h5>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you for contacting Voice Flow 360. A confirmation has been routed to <strong>support@voiceflow360.com</strong> and our team will get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'general', message: '' });
                }}
                className="mt-3 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Department / Inquiry Type</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="general">General Inquiries (contact@voiceflow360.com)</option>
                  <option value="support">Rewards &amp; Member Support (support@voiceflow360.com)</option>
                  <option value="partners">Brand Partnerships &amp; Enterprise (partners@voiceflow360.com)</option>
                  <option value="privacy">Data Privacy &amp; Compliance (privacy@voiceflow360.com)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our team help you today?"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="px-7 py-3 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-colors font-bold text-sm shadow-sm cursor-pointer"
              >
                Send Message to Voice Flow 360
              </button>
            </form>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

