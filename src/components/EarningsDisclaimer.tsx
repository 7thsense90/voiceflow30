import React from 'react';
import { PageWrapper } from './LegalPages';
import { SEOHead } from './SEOHead';
import { AlertCircle, CheckCircle2, ShieldAlert, Scale, HelpCircle, Ban, Clock, Award, Info, ExternalLink } from 'lucide-react';
import { Link } from './Link';

export const EarningsDisclaimer: React.FC = () => {
  return (
    <PageWrapper
      title="Earnings & Research Honorarium Disclaimer"
      subtitle="Transparent disclosure regarding survey availability, response acceptance, reward rules, and realistic expectations on Voice Flow 360."
    >
      <SEOHead
        title="Earnings & Rewards Disclaimer - Voice Flow 360"
        description="Official Earnings Disclaimer for Voice Flow 360: Availability and acceptance vary, earnings are not guaranteed, rewards are never paid for ad interactions, and all withdrawals adhere to the published rewards policy."
        canonicalPath="/earnings-disclaimer"
      />

      {/* Primary Caution Callout Banner */}
      <div className="p-4 sm:p-5 mb-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-extrabold block text-amber-900 text-sm sm:text-base">
            Important Notice Regarding Participant Compensation &amp; Expectations
          </strong>
          <p className="text-amber-900/90 font-normal">
            Voice Flow 360 is a consumer market research panel, not an employer, salary substitute, investment opportunity, or get-rich-quick scheme. All coins and credits awarded represent voluntary research honorariums provided solely in exchange for authentic, attentive survey feedback. <strong>Earnings are not guaranteed, availability and response acceptance vary, and rewards are never paid for ad interactions.</strong>
          </p>
        </div>
      </div>

      {/* 3 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 not-prose">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Availability &amp; Acceptance Vary</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Survey inventory fluctuates with brand researcher demand, demographic targets, and quota caps. Responses must pass automated and manual quality audits before acceptance.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Earnings Are Not Guaranteed</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We make no representations or promises of any specific monetary outcome or continuous income. Participation is voluntary and supplemental discretionary compensation only.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Ban className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Rewards for Ad Interactions</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Coins are exclusively honorariums for completed, authentic market research. Rewards are never offered or paid for viewing, clicking, or interacting with third-party ads.
          </p>
        </div>
      </div>

      <h3>1. Nature of the Platform &amp; Research Honorariums</h3>
      <p>
        Voice Flow 360 operates an independent conversational consumer intelligence portal. We connect consumer participants with academic researchers, market intelligence desks, and consumer goods analysts seeking honest, first-hand opinions. Participation in surveys, audio questions, and questionnaires is entirely voluntary. Any compensation credited to participant accounts is an honorarium (token of appreciation) for time and thoughtful cognitive effort, not wages, commission, or salary.
      </p>

      <h3>2. Survey Availability &amp; Acceptance Criteria Vary</h3>
      <p>
        The frequency, volume, and coin value of available survey opportunities vary significantly across participants and over time. You should note that:
      </p>
      <ul>
        <li>
          <strong>Demographic Quotas:</strong> Commercial research studies require specific respondent demographics (e.g., geographic region, age, household ownership of specific devices). If your demographic profile is outside an active study&apos;s quota, you may not be invited or eligible.
        </li>
        <li>
          <strong>Acceptance Depends on Quality:</strong> Submitting answers does not automatically guarantee credit acceptance. In accordance with our anti-fraud and response quality protocols, every submission undergoes automated and editorial review. Submissions containing contradictory replies, gibberish, copy-pasted text, automated script patterns, or excessively rushed completion times will be rejected without coin award.
        </li>
        <li>
          <strong>No Minimum Study Guarantee:</strong> Voice Flow 360 does not guarantee that any specific number of studies will be available on any given day, week, or month.
        </li>
      </ul>

      <h3>3. Earnings Are Not Guaranteed &amp; Realistic Expectations</h3>
      <p>
        We do not represent, promise, or guarantee that any participant will earn any specific monetary amount or attain any financial objective through Voice Flow 360. Earnings depend entirely upon factors including:
      </p>
      <ul>
        <li>The volume of active research studies matching your profile;</li>
        <li>Your consistent availability and speed in completing open survey quotas before they close;</li>
        <li>The thoroughness, authenticity, and approval rate of your submitted survey responses;</li>
        <li>Your adherence to our platform rules and community guidelines.</li>
      </ul>
      <p>
        Most active participants use Voice Flow 360 in spare moments (such as breaks or commutes) to offset modest discretionary expenses, like a cup of coffee, streaming subscription, or occasional gift card. <strong>Voice Flow 360 should never be relied upon as a primary source of income, employment substitute, or means to satisfy recurring living expenses or debt obligations.</strong>
      </p>

      <h3>4. Absolute Policy: Rewards Are NOT Paid for Ad Interactions</h3>
      <p>
        To maintain strict compliance with global advertising network policies and market research integrity standards:
      </p>
      <ul>
        <li>
          <strong>Independent Third-Party Advertising:</strong> Third-party display advertising (such as Google AdSense banners) shown on Voice Flow 360 is delivered solely as independent sponsorship media to support editorial platform hosting costs.
        </li>
        <li>
          <strong>Zero Ad Interaction Compensation:</strong> <strong>Under no circumstances are platform coins, cashouts, or credits offered, promised, or paid for viewing, clicking, or interacting with advertisements or sponsor marketing units.</strong>
        </li>
        <li>
          <strong>Strict Prohibition:</strong> Any automated interaction, artificial traffic generation, or encouragement of ad clicks is strictly prohibited and constitutes an immediate violation of our Terms of Service, resulting in account termination and total forfeiture of accrued balances.
        </li>
      </ul>

      <h3>5. Consistency with Published Rewards &amp; Withdrawal Policy</h3>
      <p>
        All rewards accrued on Voice Flow 360 are governed strictly by our published{' '}
        <Link to="/rewards-and-withdrawals" className="font-semibold text-purple-600 underline">
          Rewards &amp; Withdrawals Policy
        </Link>:
      </p>
      <ul>
        <li>
          <strong>Fixed Conversion Ratio:</strong> 100 platform coins = $1.00 USD ($0.01 per coin) across all supported redemption rails. We do not employ fluctuating, hidden, or confusing conversion units.
        </li>
        <li>
          <strong>Minimum Withdrawal Threshold:</strong> 2,000 reviewed and approved coins ($20.00 USD) for Direct Bank Transfer (ACH, SEPA, Wire) and Cryptocurrency (USDT, BTC).
        </li>
        <li>
          <strong>Eligibility:</strong> Participants must be at least 18 years old and meet the applicable age-of-majority requirement in their jurisdiction.
        </li>
        <li>
          <strong>Monthly Review Approval vs. Withdrawal Processing:</strong> Coins earned through completed surveys are initially recorded as <em>Pending Quality Review</em> during the active calendar month. Only successfully reviewed and approved coins transfer to your Redeemable Wallet on the <strong>1st of each calendar month</strong>. Once an eligible withdrawal request is submitted:
          <ul className="mt-1">
            <li><strong>Bank Transfers:</strong> Expected within 2 to 5 business days after processing;</li>
            <li><strong>Cryptocurrency:</strong> Expected within 24 to 48 hours after processing.</li>
          </ul>
        </li>
        <li>
          <strong>Zero Platform Fees:</strong> Voice Flow 360 charges 0% platform disbursement fees. However, participants are solely responsible for any destination bank intermediary charges or blockchain network gas fees.
        </li>
      </ul>

      <h3>6. Independent Contractor &amp; Tax Status</h3>
      <p>
        Participation in Voice Flow 360 does not establish an employment, agency, joint venture, or partnership relationship with Voice Flow 360 or any brand researcher. You are solely responsible for evaluating your local tax obligations, reporting any honorarium disbursements received, and paying all applicable local, state, or federal taxes in your jurisdiction.
      </p>

      <h3>7. Questions &amp; Additional Information</h3>
      <p>
        For further details regarding operational guidelines, withdrawal procedures, and quality standards, please review our comprehensive resources:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 not-prose">
        <Link
          to="/rewards-and-withdrawals"
          className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-xs font-bold text-slate-800 flex items-center justify-between"
        >
          <span>Rewards &amp; Withdrawals Policy</span>
          <span className="text-purple-600">&rarr;</span>
        </Link>
        <Link
          to="/faq"
          className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-xs font-bold text-slate-800 flex items-center justify-between"
        >
          <span>Frequently Asked Questions</span>
          <span className="text-purple-600">&rarr;</span>
        </Link>
        <Link
          to="/contact"
          className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-xs font-bold text-slate-800 flex items-center justify-between"
        >
          <span>Contact Support Desk</span>
          <span className="text-purple-600">&rarr;</span>
        </Link>
      </div>

      <p className="text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200">
        Published by Voice Flow 360 Compliance &amp; Legal Desk &bull; Updated October 2026 &bull; voiceflow360.com
      </p>
    </PageWrapper>
  );
};

export default EarningsDisclaimer;
