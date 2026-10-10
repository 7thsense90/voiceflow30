import React, { useState } from 'react';
import { SEOHead } from './SEOHead';
import { Link } from './Link';

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
    subtitle="Last updated: October 2026"
    description="Learn how Voice Flow 360 protects your personal data, survey responses, and reward cashout privacy in compliance with global standards and Google AdSense policies."
    canonicalPath="/privacy"
  >
    <p className="text-sm text-slate-500 mb-6 font-medium">Last updated: October 2026</p>
    <h3>1. Information We Collect</h3>
    <p>
      When you use Voice Flow 360, we collect information necessary to operate our research panel, match you with survey campaigns, and process coin reward redemptions:
    </p>
    <ul className="list-disc pl-6 space-y-2 text-slate-600">
      <li>
        <strong>Account &amp; Profile Identifiers:</strong> Name, email address, password, demographic attributes (such as country, region, age bracket, and industry category), and payout details (bank routing/account or cryptocurrency wallet address) for reward disbursement.
      </li>
      <li>
        <strong>Survey Responses &amp; Audio Input:</strong> Typed survey answers, scale ratings, multiple-choice selections, and, when you choose to use voice features, spoken audio recordings and their automated transcriptions.
      </li>
      <li>
        <strong>Technical &amp; Telemetry Data:</strong> IP address, device type, browser characteristics, and completion velocity telemetry used strictly for automated quality verification, bot suppression, and fraud prevention.
      </li>
    </ul>
    
    <h3>2. How We Handle Survey Responses, Audio &amp; Verbatim Answers</h3>
    <p>
      We use your responses to provide consumer sentiment research to brand researchers and partners:
    </p>
    <ul className="list-disc pl-6 space-y-2 text-slate-600">
      <li>
        <strong>Aggregated Reports &amp; Verbatim Insights:</strong> Sponsoring brand clients and researchers receive access to aggregated benchmark reports, statistical summaries (CSAT, NPS, rating averages), transcribed answers, and verbatim quotation excerpts.
      </li>
      <li>
        <strong>Spoken Audio Recordings:</strong> Spoken audio recordings are transcribed and evaluated for sentiment tone. Audio snippets and transcripts may be reviewed for quality audits and shared in research deliverables. Individual responses are not described as completely anonymous because verbatim text or audio recordings can reflect distinctive personal perspectives.
      </li>
      <li>
        <strong>Protection of Account Identifiers:</strong> Sponsoring brands and external research clients never receive your account password, email address, bank account details, or cryptocurrency wallet identifiers.
      </li>
    </ul>
    
    <h3>3. Data Sharing and Disclosure</h3>
    <p>
      We do not sell personal contact lists. We disclose data only in the following contexts: (a) with trusted cloud infrastructure providers and payout processors to operate the platform and deliver disbursements; (b) with sponsoring research clients in the form of survey responses, transcripts, and aggregated datasets as described above; and (c) when legally required by subpoena, court order, or applicable law.
    </p>
    <p>
      <strong>Participant Consent &amp; Available Controls:</strong> By submitting a survey or recording voice responses, you consent to the processing, transcription, and research sharing of those submissions. You may review your profile, cease participation at any time, or request account closure and data deletion by contacting our Data Protection Officer at <a href="mailto:privacy@voiceflow360.com" className="font-semibold text-purple-600">privacy@voiceflow360.com</a>.
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

    <h3>8. Age Eligibility &amp; Protection of Minors</h3>
    <p>
      Participants must be at least 18 years old and meet the applicable age-of-majority requirement in their jurisdiction. We do not knowingly collect personal information from individuals under the legal age of majority. If you become aware that an ineligible individual has provided us with personal information, please contact us immediately.
    </p>

    <h3>9. Data Security &amp; Contact Information</h3>
    <p>
      We employ robust technical and organizational security measures to protect your information. If you have questions regarding this Privacy Policy, our advertising integrations, or wish to exercise your privacy rights, please contact our Data Protection Officer at <a href="mailto:privacy@voiceflow360.com" className="font-semibold text-purple-600">privacy@voiceflow360.com</a> or via our <Link to="/contact" className="font-semibold text-purple-600 hover:underline">Contact Us</Link> page.
    </p>
    
    <p className="text-sm text-slate-500 mt-8">Last updated: October 2026</p>
  </PageWrapper>
);

export const TermsOfService: React.FC = () => (
  <PageWrapper
    title="Terms of Service"
    subtitle="Last updated: October 2026"
    description="Review the official terms of service, reward redemption guidelines, anti-fraud standards, and user rights for Voice Flow 360."
    canonicalPath="/terms"
  >
    <p className="text-sm text-slate-500 mb-6 font-medium">Last updated: October 2026</p>
    <h3>1. Acceptance of Terms</h3>
    <p>By accessing and using Voice Flow 360, you accept and agree to be bound by these Terms of Service. If you do not agree, you must not use our platform.</p>
    
    <h3>2. User Eligibility</h3>
    <p>
      Participants must be at least 18 years old and meet the applicable age-of-majority requirement in their jurisdiction to register, participate in surveys, or earn and redeem rewards.
    </p>
    
    <h3>3. Earning and Redeeming Rewards</h3>
    <p>
      Coins earned through completed, accepted surveys undergo monthly quality reviews before transferring to your Redeemable Wallet on the 1st of each calendar month. Redemptions require reaching our standardized minimum threshold of 2,000 Coins ($20.00 USD) and are disbursed via our authorized payment rails: Direct Bank Transfer (ACH, SEPA, Wire) and Cryptocurrency (USDT, BTC). All redemptions are subject to the detailed <Link to="/rewards-and-withdrawals" className="font-semibold text-purple-600 hover:underline">Rewards &amp; Withdrawals Policy</Link>. We reserve the right to audit, adjust, or invalidate coins earned through fraudulent activity, automated scripts, contradictory answers, or violation of these terms.
    </p>
    
    <h3>4. Prohibited Conduct</h3>
    <p>You agree not to use automated scripts, multiple accounts, or false information to artificially inflate your rewards. Violation will result in immediate account suspension and forfeiture of all coins.</p>
    
    <h3>5. Modifications to Service &amp; Fixed Conversion Ratio Policy</h3>
    <p>
      We reserve the right to modify platform operational features, available survey campaigns, and technical infrastructure. However, in accordance with our published <Link to="/rewards-and-withdrawals" className="font-semibold text-purple-600 hover:underline">Rewards &amp; Withdrawals Policy</Link>, all already-earned and credited coins maintain our published fixed conversion ratio of <strong>100 Coins = $1.00 USD ($0.01 per coin)</strong>. Any prospective modifications to minimum payout thresholds or disbursement rails will be announced with at least 30 days&apos; advance notice to active participants, ensuring no retroactive devaluation of accrued rewards. Contact <a href="mailto:legal@voiceflow360.com" className="font-semibold text-purple-600">legal@voiceflow360.com</a> for legal inquiries.
    </p>
    
    <p className="text-sm text-slate-500 mt-8">Last updated: October 2026</p>
  </PageWrapper>
);

export const AboutUs: React.FC = () => (
  <PageWrapper title="About Us">
    <p className="text-xs text-slate-500 mb-4 font-medium">
      Voice Flow 360 is operated by [YOUR COMPANY LEGAL NAME], [CITY, COUNTRY]. Contact: contact@voiceflow360.com.
    </p>
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
          <p className="text-xs text-slate-500 mt-2">
            Voice Flow 360 is operated by [YOUR COMPANY LEGAL NAME], [CITY, COUNTRY]. Contact: contact@voiceflow360.com.
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

