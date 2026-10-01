import React from 'react';
import { PageWrapper } from './LegalPages';
import { SEOHead } from './SEOHead';
import { AlertCircle, CheckCircle2, ShieldAlert, Scale, HelpCircle } from 'lucide-react';
import { Link } from './Link';

export const EarningsDisclaimer: React.FC = () => {
  return (
    <PageWrapper
      title="Earnings & Research Honorarium Disclaimer"
      subtitle="Transparent guidance on panel participation, reward rates, and realistic expectations on Voice Flow 360."
    >
      <SEOHead
        title="Earnings & Rewards Disclaimer - Voice Flow 360"
        description="Official Earnings Disclaimer for Voice Flow 360. Understand reward structures, research honorariums, coin conversions, and realistic participant expectations."
        canonicalUrl="/earnings-disclaimer"
      />

      <div className="p-4 mb-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-extrabold block text-amber-900 mb-1">
            Important Notice Regarding Participant Compensation
          </strong>
          Voice Flow 360 is a consumer market research panel, not an employer, full-time job, investment vehicle, or get-rich-quick opportunity. Any coins, credits, or gift card disbursements earned on this platform represent voluntary research honorariums provided in exchange for your authentic feedback.
        </div>
      </div>

      <h3>1. Nature of the Platform</h3>
      <p>
        Voice Flow 360 connects consumers with enterprise brands, academic researchers, and market analysts seeking genuine consumer sentiment. Participation in surveys, polls, and research questionnaires is strictly voluntary. The compensation provided is an honorarium or token of appreciation for the time spent providing thoughtful, truthful responses.
      </p>

      <h3>2. No Guarantee of Specific Income</h3>
      <p>
        We do not represent, promise, or guarantee that any participant will earn any specific monetary amount or attain a specific lifestyle by using Voice Flow 360. Earnings depend entirely upon several external factors, including but not limited to:
      </p>
      <ul>
        <li>
          <strong>Demographic Suitability:</strong> Market research studies frequently require specific target demographics (e.g., geographic location, age group, product usage habits). Survey availability fluctuates based on current brand requirements.
        </li>
        <li>
          <strong>Survey Frequency &amp; Completion:</strong> The number of studies available to you at any given time varies. No minimum daily or monthly survey volume is guaranteed.
        </li>
        <li>
          <strong>Response Quality:</strong> In accordance with our Quality Audit Policy, responses flagged as automated, low-effort, or nonsensical are subject to penalty deductions or rejection.
        </li>
        <li>
          <strong>Individual Effort:</strong> The actual time and consistency an individual chooses to dedicate to participating in open studies.
        </li>
      </ul>

      <h3>3. Typical Experience and Realistic Expectations</h3>
      <p>
        Most active participants use Voice Flow 360 during spare moments (such as commutes or breaks) to offset minor discretionary expenses, such as a cup of coffee, streaming subscriptions, or modest gift cards. You should never rely on Voice Flow 360 as a primary source of income, employment substitute, or method to satisfy debt obligations.
      </p>

      <h3>4. Coin Values &amp; Cashout Thresholds</h3>
      <p>
        Platform coins are internal loyalty reward points that hold no monetary value outside of the Voice Flow 360 redemption system. Coin-to-currency conversion rates (standard: 100 coins = $1.00 USD) and minimum withdrawal thresholds (standard: 2,000 coins = $20.00 USD) are clearly published in the rewards wallet and subject to platform terms.
      </p>

      <h3>5. Referral Program Disclaimers</h3>
      <p>
        Any examples, testimonials, or marketing illustrations depicting referral rewards reflect hypothetical or top-tier outcomes and do not constitute average results. Participants who share referral links must comply with all applicable advertising disclosure guidelines (including FTC Endorsement Guides) by disclosing that they receive a compensation bonus when friends join.
      </p>

      <h3>6. Independent Contractor Status</h3>
      <p>
        Nothing in your use of Voice Flow 360 creates an employer-employee, agency, or partnership relationship. You are solely responsible for declaring any honorarium disbursements and paying any applicable taxes required under the laws of your jurisdiction.
      </p>

      <h3>7. Questions &amp; Support</h3>
      <p>
        If you have questions regarding our compensation policies or redemption terms, please visit our{' '}
        <Link to="/faq" className="font-semibold text-purple-600 underline">
          FAQ &amp; Help Center
        </Link>{' '}
        or reach out to our team at{' '}
        <a href="mailto:support@voiceflow360.com" className="font-semibold text-purple-600">
          support@voiceflow360.com
        </a>.
      </p>

      <p className="text-xs text-slate-400 mt-8">
        Last updated: {new Date().toLocaleDateString()} &bull; Voice Flow 360 Compliance Team
      </p>
    </PageWrapper>
  );
};
export default EarningsDisclaimer;
