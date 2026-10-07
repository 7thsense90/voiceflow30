import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PayoutMethod } from '../types';
import { SEOHead } from './SEOHead';
import {
  Wallet,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Calendar,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Users,
  Lock,
  ArrowDownLeft,
  FileText,
  ShieldCheck,
  Printer,
  Info,
  Receipt,
  MinusCircle,
  Check,
  ShieldAlert,
  Bot,
  HelpCircle,
  BarChart3,
  Copy,
  UserPlus,
  CheckSquare,
} from 'lucide-react';
import { PublisherEarningStatementTable } from './PublisherEarningStatementTable';
import { AuthModal } from './AuthModal';

export const CustomerEarningsView: React.FC = () => {
  const {
    currentUser,
    transactions,
    withdrawals,
    responses,
    campaigns,
    referrals,
    settings,
    showToast,
    submitWithdrawalRequest,
    processMonthlyWalletTransfer,
    setCurrentView,
  } = useApp();

  // Strictly nothing visible to unauthenticated customers
  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <AuthModal initialMode="login" />
        </div>
      </div>
    );
  }

  // Payout Form State (unlocked once net transferable balance is above $20)
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>('bank_transfer');
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);

  // Bank transfer specific fields
  const [bankAccountName, setBankAccountName] = useState(currentUser?.name || '');
  const [bankName, setBankName] = useState('');
  const [bankIbanOrNumber, setBankIbanOrNumber] = useState('');
  const [bankRoutingOrSwift, setBankRoutingOrSwift] = useState('');

  // Crypto specific fields
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('USDT (TRC20 / BEP20)');

  // Form submission feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedReferralLink, setCopiedReferralLink] = useState(false);

  const handleCopyReferralLink = () => {
    const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://voiceflow360.com'}/?ref=${currentUser?.referralCode || 'VF-USER'}`;
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedReferralLink(true);
      showToast('Referral link copied to clipboard! Share with friends.', 'success');
      setTimeout(() => setCopiedReferralLink(false), 3000);
    }).catch(() => {
      showToast(`Your referral code is: ${currentUser?.referralCode || 'VF-USER'}`, 'info');
    });
  };

  // User-specific records
  const userTransactions = transactions.filter((t) => t.userId === currentUser?.id);
  const userWithdrawals = withdrawals.filter((w) => w.userId === currentUser?.id);
  const userResponses = responses.filter((r) => r.userId === currentUser?.id);

  // Current calendar month details
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const daysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  // Next 1st of month calculation
  const nextFirstOfMonth = new Date(currentYear, currentMonthIndex + 1, 1);
  const nextMonthName = nextFirstOfMonth.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const daysUntilFirst = Math.max(
    1,
    Math.ceil((nextFirstOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // =========================================================================
  // PARTICIPATION AND REWARDS STATEMENT CALCULATIONS (1, 2, 3)
  // Business Rules:
  // 1- Total Rewards Earned: all the coins should be in 1- Total Rewards Earned
  // 2- Total Bot and Mock response deductions: deduct 60% against bot and mock response
  // 3- Total Redeemable Balance: after 60% deduction add remaining to the redeemable balance
  // =========================================================================

  // 1. Total Rewards Earned (all coins accumulated across all sources)
  const positiveTxCoins = userTransactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalRewardsEarnedCoins = Math.max(
    currentUser?.totalEarned || 0,
    positiveTxCoins,
    (currentUser?.coinBalance || 0) + (currentUser?.redeemedCoins || 0),
    currentUser?.coinBalance || 0
  );
  const totalRewardsEarnedUsd = (totalRewardsEarnedCoins * settings.coinToUsdRate).toFixed(2);

  // 2. Total Bot and Mock response deductions (60% deduction against bot and mock response)
  const totalBotAndMockDeductionsCoins = Math.round(totalRewardsEarnedCoins * 0.6);
  const totalBotAndMockDeductionsUsd = (totalBotAndMockDeductionsCoins * settings.coinToUsdRate).toFixed(2);

  // 3. Total Redeemable Balance (After 60% deduction, add remaining 40% to redeemable balance)
  const totalRedeemableBalanceCoins = Math.max(
    0,
    currentUser?.redeemableCoinBalance !== undefined && currentUser.redeemableCoinBalance > 0
      ? currentUser.redeemableCoinBalance
      : totalRewardsEarnedCoins - totalBotAndMockDeductionsCoins
  );
  const totalRedeemableBalanceUsd = (totalRedeemableBalanceCoins * settings.coinToUsdRate).toFixed(2);

  // Minimum Cashout Rules (2,000 Coins = $20 & 10 Referrals Joined)
  const MIN_WITHDRAWAL_COINS = 2000;
  const MIN_REFERRALS_REQUIRED = 10;

  const isBalanceAbove20 = totalRedeemableBalanceCoins >= MIN_WITHDRAWAL_COINS;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((totalRedeemableBalanceCoins / MIN_WITHDRAWAL_COINS) * 100))
  );
  const remainingCoins = Math.max(0, MIN_WITHDRAWAL_COINS - totalRedeemableBalanceCoins);

  // Referral Requirement: Refer 10 other members who join (1 customer on 1 IP)
  const completedUserReferrals = referrals.filter(
    (r) => r.referrerId === currentUser?.id && r.status === 'completed'
  );
  const joinedReferralsCount = Math.max(
    completedUserReferrals.length,
    currentUser?.referralsCount || 0
  );
  const isReferralsRequirementMet = joinedReferralsCount >= MIN_REFERRALS_REQUIRED;
  const remainingReferralsNeeded = Math.max(0, MIN_REFERRALS_REQUIRED - joinedReferralsCount);
  const referralProgressPercent = Math.min(
    100,
    Math.max(0, Math.round((joinedReferralsCount / MIN_REFERRALS_REQUIRED) * 100))
  );

  // Both checklist criteria must be true to unlock withdrawal
  const isWithdrawalFullyUnlocked = isBalanceAbove20 && isReferralsRequirementMet;

  const [coinsToWithdraw, setCoinsToWithdraw] = useState<number>(MIN_WITHDRAWAL_COINS);

  // Statement Identification
  const statementId = `STMT-${currentYear}${String(currentMonthIndex + 1).padStart(2, '0')}-${
    currentUser?.id ? currentUser.id.slice(-6).toUpperCase() : 'VF360'
  }`;

  // ==========================================
  // MONTHLY STATEMENT BREAKDOWN (BANK FORMAT)
  // ==========================================
  const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const [selectedStatementKey, setSelectedStatementKey] = useState<string>(currentMonthKey);
  const [statementTab, setStatementTab] = useState<'analytics' | 'monthly_bank'>('analytics');

  // Group transactions & statement periods by calendar month
  const monthlyStatementsMap = new Map<
    string,
    {
      key: string;
      monthName: string;
      year: number;
      monthIndex: number;
      periodDates: string;
      isCurrent: boolean;
      earningsCoins: number;
      earningsUsd: number;
      deductionsCoins: number;
      deductionsUsd: number;
      withdrawalsCoins: number;
      withdrawalsUsd: number;
      netBalanceCoins: number;
      netBalanceUsd: number;
      status: string;
      transactions: typeof userTransactions;
    }
  >();

  // 1. Current Billing Cycle (Active)
  monthlyStatementsMap.set(currentMonthKey, {
    key: currentMonthKey,
    monthName: `${currentMonthName} ${currentYear}`,
    year: currentYear,
    monthIndex: currentMonthIndex,
    periodDates: `${currentMonthName.slice(0, 3)} 01, ${currentYear} – ${currentMonthName.slice(0, 3)} ${daysInCurrentMonth}, ${currentYear}`,
    isCurrent: true,
    earningsCoins: totalRewardsEarnedCoins,
    earningsUsd: Number(totalRewardsEarnedUsd),
    deductionsCoins: totalBotAndMockDeductionsCoins,
    deductionsUsd: Number(totalBotAndMockDeductionsUsd),
    withdrawalsCoins: 0,
    withdrawalsUsd: 0,
    netBalanceCoins: totalRedeemableBalanceCoins,
    netBalanceUsd: Number(totalRedeemableBalanceUsd),
    status: `Active Cycle (Audits 1st)`,
    transactions: [],
  });

  // 2. Previous Month (Reconciled Cycle for historical bank comparison)
  const prevDate = new Date(currentYear, currentMonthIndex - 1, 1);
  const prevMonthIndex = prevDate.getMonth();
  const prevYear = prevDate.getFullYear();
  const prevMonthName = prevDate.toLocaleString('default', { month: 'long' });
  const prevKey = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}`;
  const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate();

  monthlyStatementsMap.set(prevKey, {
    key: prevKey,
    monthName: `${prevMonthName} ${prevYear}`,
    year: prevYear,
    monthIndex: prevMonthIndex,
    periodDates: `${prevMonthName.slice(0, 3)} 01, ${prevYear} – ${prevMonthName.slice(0, 3)} ${daysInPrevMonth}, ${prevYear}`,
    isCurrent: false,
    earningsCoins: 0,
    earningsUsd: 0,
    deductionsCoins: 0,
    deductionsUsd: 0,
    withdrawalsCoins: 0,
    withdrawalsUsd: 0,
    netBalanceCoins: 0,
    netBalanceUsd: 0,
    status: 'Audited & Settled',
    transactions: [],
  });

  // 3. Populate all user transactions into respective monthly buckets
  userTransactions.forEach((t) => {
    const tDate = new Date(t.date);
    const y = tDate.getFullYear();
    const m = tDate.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;

    if (!monthlyStatementsMap.has(key)) {
      const mName = tDate.toLocaleString('default', { month: 'long' });
      const lastDay = new Date(y, m + 1, 0).getDate();
      monthlyStatementsMap.set(key, {
        key,
        monthName: `${mName} ${y}`,
        year: y,
        monthIndex: m,
        periodDates: `${mName.slice(0, 3)} 01, ${y} – ${mName.slice(0, 3)} ${lastDay}, ${y}`,
        isCurrent: key === currentMonthKey,
        earningsCoins: 0,
        earningsUsd: 0,
        deductionsCoins: 0,
        deductionsUsd: 0,
        withdrawalsCoins: 0,
        withdrawalsUsd: 0,
        netBalanceCoins: 0,
        netBalanceUsd: 0,
        status: key === currentMonthKey ? `Active Cycle (Audits 1st)` : 'Audited & Settled',
        transactions: [],
      });
    }

    const mRecord = monthlyStatementsMap.get(key)!;
    mRecord.transactions.push(t);
    if (key !== currentMonthKey) {
      if (t.amount > 0) {
        mRecord.earningsCoins += t.amount;
        mRecord.earningsUsd += t.amount * settings.coinToUsdRate;
      } else if (t.amount < 0) {
        mRecord.deductionsCoins += Math.abs(t.amount);
        mRecord.deductionsUsd += Math.abs(t.amount) * settings.coinToUsdRate;
      }
    }
  });

  // Calculate withdrawals per month
  userWithdrawals.forEach((w) => {
    const wDate = new Date(w.requestedAt);
    const y = wDate.getFullYear();
    const m = wDate.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    if (monthlyStatementsMap.has(key)) {
      monthlyStatementsMap.get(key)!.withdrawalsUsd += w.usdAmount;
      monthlyStatementsMap.get(key)!.withdrawalsCoins += w.coins;
    }
  });

  // Recalculate net balance for each month
  monthlyStatementsMap.forEach((rec) => {
    rec.netBalanceUsd = Math.max(0, rec.earningsUsd - rec.deductionsUsd - rec.withdrawalsUsd);
    rec.netBalanceCoins = Math.max(0, rec.earningsCoins - rec.deductionsCoins - rec.withdrawalsCoins);
  });

  // Convert to sorted list (newest first)
  const monthlyStatements = Array.from(monthlyStatementsMap.values()).sort((a, b) =>
    b.key.localeCompare(a.key)
  );

  const activeStatement =
    monthlyStatements.find((s) => s.key === selectedStatementKey) || monthlyStatements[0];

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (totalRedeemableBalanceCoins < MIN_WITHDRAWAL_COINS) {
      setErrorMsg(
        `Redeemable balance will be displayed after Audit (performed on the 1st of every month). Your redeemable balance must be at least 2,000 Coins to request cashout.`
      );
      return;
    }

    if (coinsToWithdraw < MIN_WITHDRAWAL_COINS) {
      setErrorMsg(`Minimum redemption is 2,000 Coins.`);
      return;
    }

    if (coinsToWithdraw > totalRedeemableBalanceCoins) {
      setErrorMsg(
        `Requested amount exceeds your Total Redeemable Balance of ${totalRedeemableBalanceCoins.toLocaleString()} Coins.`
      );
      return;
    }

    let details = '';
    if (selectedMethod === 'bank_transfer') {
      if (!bankAccountName.trim() || !bankName.trim() || !bankIbanOrNumber.trim()) {
        setErrorMsg('Please provide your Bank Name, Account Holder Name, and Account/IBAN Number.');
        return;
      }
      details = `Bank: ${bankName.trim()} | Account: ${bankAccountName.trim()} | IBAN/Num: ${bankIbanOrNumber.trim()} ${
        bankRoutingOrSwift.trim() ? `| SWIFT/Routing: ${bankRoutingOrSwift.trim()}` : ''
      }`;
    } else if (selectedMethod === 'crypto') {
      if (!cryptoAddress.trim()) {
        setErrorMsg('Please enter your receiving Crypto / USDT Wallet Address.');
        return;
      }
      details = `Network: ${cryptoNetwork} | Address: ${cryptoAddress.trim()}`;
    } else {
      details = bankIbanOrNumber.trim() || bankAccountName.trim();
      if (!details) {
        setErrorMsg('Please specify your payment account details.');
        return;
      }
    }

    const res = submitWithdrawalRequest(coinsToWithdraw, selectedMethod, details);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to submit withdrawal.');
    } else {
      setSuccessMsg(
        `Redemption request for ${coinsToWithdraw.toLocaleString()} Coins successfully submitted! Participate in studies and earn rewards.`
      );
    }
  };

  const handleSimulateTransfer = () => {
    const res = processMonthlyWalletTransfer();
    if (res.success) {
      setTransferFeedback(
        `Monthly Quality Audit completed! Transferred ${res.transferredCoins.toLocaleString()} coins into your Net Transferable Balance.`
      );
      setTimeout(() => setTransferFeedback(null), 5000);
    }
  };

  const handlePrintStatement = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div id="customer-earnings-container" className="space-y-6 pb-16 max-w-5xl mx-auto px-2 sm:px-4">
      <SEOHead
        title="Participation and Rewards - Voice Flow 360"
        description="Participation and Rewards official statement: 1- Total Rewards Earned, 2- Total Bot and Mock response deductions, 3- Total Redeemable Balance."
        keywords={[
          'participation and rewards',
          'total rewards earned',
          'bot and mock response deductions',
          'total redeemable balance',
          'monthly quality audit',
        ]}
        canonicalPath="/my-earnings"
      />

      {/* ========================================================= */}
      {/* 1. PARTICIPATION AND REWARDS STATEMENT HEADER             */}
      {/* ========================================================= */}
      <div
        id="statement-document-header"
        className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm p-4 sm:p-6 md:p-8 space-y-6"
      >
        {/* Top Statement Identification Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                  Participation and Rewards
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 truncate">
                  {statementId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-0.5 break-words">
                Participation and Rewards
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handlePrintStatement}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Print or export statement"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Statement</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Statement Metadata Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Account Holder
            </span>
            <span className="font-extrabold text-slate-900 truncate block mt-0.5 text-sm">
              {currentUser?.name || 'Member'}
            </span>
            <span className="text-[11px] text-slate-500 truncate block">
              {currentUser?.email || ''}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Statement Cycle
            </span>
            <span className="font-extrabold text-slate-900 block mt-0.5 text-sm truncate">
              {currentMonthName} {currentYear}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              1st – {daysInCurrentMonth}th of {currentMonthName}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Next Audit &amp; Transfer
            </span>
            <span className="font-extrabold text-purple-900 block mt-0.5 text-sm truncate">
              {nextMonthName}
            </span>
            <span className="text-[11px] text-purple-700 font-semibold block truncate">
              In {daysUntilFirst} days (00:00 UTC)
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Redemption Requirement
            </span>
            <span className="font-extrabold text-emerald-800 block mt-0.5 text-sm truncate">
              2,000 Coins Minimum
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              Participate in studies and earn rewards
            </span>
          </div>
        </div>

        {/* Transfer Feedback Banner if triggered */}
        {transferFeedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{transferFeedback}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. THE 3 PARTICIPATION AND REWARDS STATEMENT CARDS        */}
        {/* ========================================================= */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-3.5">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Participation and Rewards Statement</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Audit performed by the 1st of every month • Redeemable balance displayed after audit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1- Total Rewards Earned */}
            <div
              id="statement-total-rewards-earned-card"
              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white to-purple-50/50 border-2 border-purple-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-purple-100">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                    1- Total Rewards Earned
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight break-words">
                    {totalRewardsEarnedCoins.toLocaleString()}
                  </div>
                  <span className="text-xs font-extrabold text-purple-800 mt-0.5 block">
                    Earned Coins (All Accumulated)
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-purple-100/80 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Gross Participation Credits</span>
                  <span className="text-purple-900 font-black">All Coins Credited Here</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  All coins from study participation, surveys, and activities are consolidated in Total Rewards Earned.
                </p>
              </div>
            </div>

            {/* 2- Total Bot and Mock response deductions */}
            <div
              id="statement-bot-mock-deductions-card"
              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white to-amber-50/40 border-2 border-amber-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-100">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                    2- Total Bot and Mock response deductions
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight break-words">
                    -{totalBotAndMockDeductionsCoins.toLocaleString()}
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 mt-0.5 block">
                    Coins Deducted (60% Bot &amp; Mock Audit)
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-amber-100/80 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Deduction Rate</span>
                  <span className="text-rose-600 font-extrabold">-60% Quality Audit</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  <strong>Notice:</strong> 60% deduction applied against bot, automated script, and mock responses.
                </p>
              </div>
            </div>

            {/* 3- Total Redeemable Balance */}
            <div
              id="statement-total-redeemable-balance-card"
              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white to-emerald-50/40 border-2 border-emerald-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-100">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                    3- Total Redeemable Balance
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight break-words">
                    {totalRedeemableBalanceCoins.toLocaleString()}
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 mt-0.5 block">
                    Redeemable Coins (Net 40% Balance)
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-100/80 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Redeemable Status</span>
                  <span className="text-emerald-700 font-extrabold">Active &amp; Transferable</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Remaining 40% verified rewards transferred to your Redeemable Balance. Unlocked for cashout once meeting the 2,000 coin minimum.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. PUBLIC EDUCATIONAL AUDIT EXPLANATION PANEL            */}
        {/* ========================================================= */}
        <div
          id="statement-audit-education-panel"
          className="rounded-2xl border-2 border-purple-200/90 bg-gradient-to-r from-purple-50/80 via-slate-50 to-indigo-50/80 p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-200/70 text-purple-900 text-[10px] font-black uppercase tracking-wider mb-1">
                <Info className="w-3 h-3 text-purple-700" />
                <span>Participation and Rewards Audit Notice</span>
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                How Participation and Rewards Are Audited on the 1st of Every Month
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                To maintain top-tier market research data for brand studies and sustain genuine coin rewards, all participation undergoes an automated audit conducted on the <strong>1st of every month</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                <span>1. Bot &amp; Script Inspection</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Automated review screens for scripts, automated tools, and speed anomalies. Robotic and artificial entries are rejected.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>2. Mock Response Deductions (-60%)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Mock submissions, bot entries, and unengaged feedback have a 60% quality deduction applied.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3. Post-Audit Redeemable Balance</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Remaining 40% verified rewards are transferred to your Total Redeemable Balance and ready for redemption.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/80 border border-purple-200/70 flex items-center justify-between text-xs text-purple-950 font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Quality Audit complete: 60% deducted against bot &amp; mock responses; remaining 40% added to Total Redeemable Balance.
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold hidden md:inline">
              Audit Settlement: Active
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. TOTAL REDEEMABLE BALANCE & CASHOUT INTERFACE           */}
      {/* ========================================================= */}
      <div
        id="statement-payout-section"
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-slate-200/90 shadow-sm space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Total Redeemable Balance &amp; Cashout
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Redeemable balance will be displayed after Audit. Audit will be performed by the 1st of every month.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('rewards-and-withdrawals')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read our complete, transparent Rewards &amp; Withdrawals Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Withdrawable Balance Pill */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shrink-0">
            <span className="text-xs font-bold text-slate-500">Total Redeemable:</span>
            <span className="text-sm font-black text-slate-900">
              {totalRedeemableBalanceCoins.toLocaleString()} Coins
            </span>
          </div>
        </div>

        {/* Progress Toward 2,000 Coins ($20) Minimum Requirement */}
        <div className="space-y-2 bg-slate-50/80 border border-slate-200/80 p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-700">
            <span>Progress Toward 2,000 Coins ($20) Redemption Threshold</span>
            <div className="flex items-center gap-1.5 font-black text-slate-900">
              <span>{totalRedeemableBalanceCoins.toLocaleString()} / 2,000 Coins</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] font-extrabold">
                2,000 Coins = $20
              </span>
              <span className="text-slate-500 font-bold">({progressPercent}%)</span>
            </div>
          </div>
          <div
            id="withdrawal-progress-bar"
            className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBalanceAbove20
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {isBalanceAbove20
                ? 'Threshold achieved ($20 unlocked)! Redemption form is active below.'
                : `Need ${remainingCoins.toLocaleString()} more coins in Redeemable Balance to cash out.`}
            </span>
            <span className="font-extrabold text-slate-800">
              Min: 2,000 Coins = $20
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4B. WITHDRAWAL UNLOCK CHECKLIST                           */}
        {/* ========================================================= */}
        <div
          id="withdrawal-qualification-checklist-card"
          className="rounded-2xl border-2 border-purple-200/90 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/60 p-5 sm:p-6 space-y-5 shadow-2xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-purple-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900">
                  Withdrawal Qualification Checklist
                </span>
                {isWithdrawalFullyUnlocked ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Requirements Met • Form Unlocked</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>Locked (Complete Both Checklist Items)</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
                Cashout Activation Requirements
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Both requirements below must be verified as true to unlock the withdrawal transfer form.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500">Checklist Progress:</span>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black ${
                  isWithdrawalFullyUnlocked
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {Number(isBalanceAbove20) + Number(isReferralsRequirementMet)} / 2 Completed
              </span>
            </div>
          </div>

          {/* Checklist Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checklist Item 1: Redeemable Balance >= $20 (2,000 Coins) */}
            <div
              className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                isBalanceAbove20
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {isBalanceAbove20 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      1. Redeemable Balance ($20 Min)
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      isBalanceAbove20
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {isBalanceAbove20 ? 'Completed ✓' : 'Incomplete'}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {totalRedeemableBalanceCoins.toLocaleString()} / 2,000 Coins
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      2,000 Coins = $20
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {isBalanceAbove20
                      ? 'Goal achieved! You have at least 2,000 coins ($20) in your active Redeemable Balance.'
                      : `You need ${remainingCoins.toLocaleString()} more coins in your Redeemable Balance to meet the $20 minimum.`}
                  </p>
                </div>
              </div>

              {!isBalanceAbove20 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentView('surveys')}
                    className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Participate in Studies (+Earn Coins)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Checklist Item 2: Refer 10 Other Members (One Customer per IP) */}
            <div
              className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                isReferralsRequirementMet
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {isReferralsRequirementMet ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Users className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                    <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      2. Refer 10 Joined Members
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      isReferralsRequirementMet
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {isReferralsRequirementMet ? 'Completed ✓' : `${joinedReferralsCount}/10 Joined`}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {joinedReferralsCount} / 10 Joined Members
                    </span>
                    <span className="text-xs font-extrabold text-purple-700">
                      1 Customer on 1 IP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {isReferralsRequirementMet
                      ? 'Goal achieved! You have referred 10 or more verified members who joined the platform.'
                      : `Refer the platform to 10 other users. When 10 users join, this requirement will be marked as true (need ${remainingReferralsNeeded} more).`}
                  </p>
                </div>
              </div>

              {/* Referral Link & Anti-Fraud Notice */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://voiceflow360.com'}/?ref=${currentUser?.referralCode || 'VF-USER'}`}
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-700 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyReferralLink}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedReferralLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                  <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>One customer on one IP. Duplicate accounts &amp; self-referrals are blocked.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locked State if Checklist Incomplete */}
        {!isWithdrawalFullyUnlocked ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Withdrawal Locked — Complete Both Checklist Items
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                  {!isBalanceAbove20 && !isReferralsRequirementMet
                    ? `You need ${remainingCoins.toLocaleString()} more coins in your Redeemable Balance to reach $20, and ${remainingReferralsNeeded} more members to join via your referral link.`
                    : !isBalanceAbove20
                    ? `Your referral requirement is complete! You only need ${remainingCoins.toLocaleString()} more coins in your Redeemable Balance to reach $20 and unlock cashout.`
                    : `Your $20 balance is ready! You only need ${remainingReferralsNeeded} more members to join via your referral link (1 customer per IP) to unlock cashout.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
              {!isBalanceAbove20 && (
                <button
                  type="button"
                  onClick={() => setCurrentView('surveys')}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Participate in Studies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {!isReferralsRequirementMet && (
                <button
                  type="button"
                  onClick={handleCopyReferralLink}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReferralLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Active Payout Form when Both Checklist Requirements Are Met */
          <div className="space-y-6 pt-2">
            {/* Unlocked Confirmation Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Withdrawal Unlocked! Both qualification requirements ($20 Redeemable Balance &amp; 10 Joined Referrals) are satisfied. Select your payout method below.
              </span>
            </div>
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              {/* Method Choice */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div
                    id="payout-method-bank-btn"
                    onClick={() => setSelectedMethod('bank_transfer')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      selectedMethod === 'bank_transfer'
                        ? 'border-purple-600 bg-purple-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Direct Bank Account</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Wire / ACH / IBAN transfer directly to your verified bank account.
                      </p>
                    </div>
                  </div>

                  <div
                    id="payout-method-crypto-btn"
                    onClick={() => setSelectedMethod('crypto')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      selectedMethod === 'crypto'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Crypto / USDT Wallet</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        TRC20 / BEP20 address with fast settlement and 0% platform fee.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount to Withdraw */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Redemption Amount (Coins)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="relative">
                    <input
                      id="earnings-withdraw-amount-input"
                      type="number"
                      min={MIN_WITHDRAWAL_COINS}
                      max={totalRedeemableBalanceCoins}
                      step="100"
                      value={coinsToWithdraw}
                      onChange={(e) => setCoinsToWithdraw(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black text-sm focus:bg-white focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">
                      Coins
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Verified Rewards (0% Platform Fee)
                      </span>
                      <span className="text-xl font-black text-emerald-700">
                        {coinsToWithdraw.toLocaleString()} Coins
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCoinsToWithdraw(totalRedeemableBalanceCoins)}
                      className="text-xs font-bold text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 cursor-pointer"
                    >
                      Max Available
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              {selectedMethod === 'bank_transfer' ? (
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                    Bank Account Details
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Account Holder Full Name
                      </span>
                      <input
                        id="bank-account-name-input"
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">Bank Name</span>
                      <input
                        id="bank-name-input"
                        type="text"
                        placeholder="e.g. Chase, Bank of America, HSBC"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        IBAN / Account Number
                      </span>
                      <input
                        id="bank-iban-input"
                        type="text"
                        placeholder="e.g. 12345678901234"
                        value={bankIbanOrNumber}
                        onChange={(e) => setBankIbanOrNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Routing Number / SWIFT (Optional)
                      </span>
                      <input
                        id="bank-swift-input"
                        type="text"
                        placeholder="e.g. CHUS33XX"
                        value={bankRoutingOrSwift}
                        onChange={(e) => setBankRoutingOrSwift(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                    Crypto Address (USDT)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">Network</span>
                      <input
                        type="text"
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Receiving USDT Wallet Address
                      </span>
                      <input
                        id="crypto-address-input"
                        type="text"
                        placeholder="e.g. 0x... or T..."
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                id="submit-payout-btn"
                type="submit"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-purple-900 hover:to-indigo-900 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Submit Redemption Request for {coinsToWithdraw.toLocaleString()} Coins
                </span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. CUSTOMER EARNINGS STATEMENT (GROUP BY & REPORTING)     */}
      {/* ========================================================= */}
      <div
        id="statement-ledger-section"
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-slate-200/90 shadow-sm space-y-6"
      >
        {/* Statement Header & Format Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <BarChart3 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {statementTab === 'analytics' ? 'Grouped Statement' : 'Monthly Activity Breakdown'}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  REF: VF-{currentUser?.id ? currentUser.id.slice(-6).toUpperCase() : '003921'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Earnings Statement &amp; Activity
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Official earnings statement grouped by Date, Category, Activity, and Status with verified questions, rewards, and credited activity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              onClick={handlePrintStatement}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: GROUP BY EARNING STATEMENT                   */}
        {/* ---------------------------------------------------- */}
        {statementTab === 'analytics' ? (
          <PublisherEarningStatementTable
            currentUser={currentUser}
            userTransactions={userTransactions}
            userResponses={userResponses}
            campaigns={campaigns}
            settings={settings}
            userEarnedUsd={Number(totalRewardsEarnedUsd)}
            userTotalCoins={totalRewardsEarnedCoins}
            totalDeductionsCoins={totalBotAndMockDeductionsCoins}
            netTransferableCoins={totalRedeemableBalanceCoins}
          />
        ) : (
          /* ---------------------------------------------------- */
          /* VIEW 2: MONTHLY STATEMENT SUMMARY & AUDIT RECONCILE */
          /* ---------------------------------------------------- */
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-purple-600" />
                  <span>Statement Breakdown by Month</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  Select a statement cycle below to view itemized entries
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/95 border-b border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Statement Period</th>
                      <th className="py-3 px-4">Cycle Dates</th>
                      <th className="py-3 px-4 text-right">Total Earnings (+)</th>
                      <th className="py-3 px-4 text-right">Total Deductions (-)</th>
                      <th className="py-3 px-4 text-right">Redemptions (-)</th>
                      <th className="py-3 px-4 text-right">Net Closing Balance</th>
                      <th className="py-3 px-4 text-center">Audit Status</th>
                      <th className="py-3 px-4 text-center">Select Cycle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {monthlyStatements.map((stmt) => {
                      const isSelected = stmt.key === selectedStatementKey;
                      return (
                        <tr
                          key={stmt.key}
                          onClick={() => setSelectedStatementKey(stmt.key)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-50/70 font-semibold'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {stmt.monthName}
                              </span>
                              {stmt.isCurrent && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                  Active
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {stmt.periodDates}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-700 whitespace-nowrap text-xs sm:text-sm">
                            +{stmt.earningsCoins.toLocaleString()} Coins
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {stmt.deductionsCoins > 0 ? (
                              <span className="font-black text-rose-600 text-xs">
                                -{stmt.deductionsCoins.toLocaleString()} Coins
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                0 (0 Deductions)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-600 font-mono text-xs">
                            {stmt.withdrawalsCoins > 0
                              ? `-${stmt.withdrawalsCoins.toLocaleString()} Coins`
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                            {stmt.netBalanceCoins.toLocaleString()} Coins
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                stmt.isCurrent
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {stmt.isCurrent ? (
                                <Clock className="w-3 h-3 text-amber-600" />
                              ) : (
                                <Check className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{stmt.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStatementKey(stmt.key);
                              }}
                              className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? 'Viewing' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ITEMIZED STATEMENT FOR SELECTED MONTH */}
            <div className="rounded-2xl border-2 border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      Itemized Statement: {activeStatement.monthName}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-mono mt-0.5">
                    Cycle: {activeStatement.periodDates} • Unit: Verified Coins
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Cycle Status:</span>
                  <span className="text-xs font-extrabold text-slate-800 px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    {activeStatement.isCurrent
                      ? 'Active Cycle (Auditing on 1st)'
                      : 'Reconciled & Settled'}
                  </span>
                </div>
              </div>

              {/* Summary Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Opening Balance
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">0 Coins</span>
                  <span className="text-[10px] text-slate-400 block">Cycle Start</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Total Earnings (+)
                  </span>
                  <span className="text-sm font-black text-emerald-700 block mt-0.5">
                    +{activeStatement.earningsCoins.toLocaleString()} Coins
                  </span>
                  <span className="text-[10px] text-emerald-600 block">Surveys, Quizzes &amp; Invites</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Total Deductions (-)
                  </span>
                  <span
                    className={`text-sm font-black block mt-0.5 ${
                      activeStatement.deductionsCoins > 0 ? 'text-rose-600' : 'text-slate-700'
                    }`}
                  >
                    -{activeStatement.deductionsCoins.toLocaleString()} Coins
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {activeStatement.deductionsCoins === 0 ? '0 Cutoffs / Clean' : 'Penalties applied'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Net Period Balance
                  </span>
                  <span className="text-sm font-black text-purple-900 block mt-0.5">
                    {activeStatement.netBalanceCoins.toLocaleString()} Coins
                  </span>
                  <span className="text-[10px] text-purple-700 block">Verified Net Available</span>
                </div>
              </div>

              {/* Simple Ledger Table */}
              <div className="overflow-x-auto rounded-xl bg-white border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3.5">Post Date</th>
                      <th className="py-2.5 px-3.5">Transaction Description / Ref</th>
                      <th className="py-2.5 px-3.5">Category</th>
                      <th className="py-2.5 px-3.5 text-right">Deductions (-)</th>
                      <th className="py-2.5 px-3.5 text-right">Credits (+)</th>
                      <th className="py-2.5 px-3.5 text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                    {activeStatement.transactions.length === 0 ? (
                      activeStatement.earningsCoins > 0 ? (
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                            {currentMonthName.slice(0, 3)} 01, {currentYear}
                          </td>
                          <td className="py-3 px-3.5 text-slate-900 font-sans font-semibold">
                            Initial Research &amp; Survey Account Credit (Member Balance Credited)
                          </td>
                          <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                            <span className="inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Credit (Earnings)
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap text-slate-300 font-mono">
                            —
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono text-emerald-700 font-bold">
                            +{activeStatement.earningsCoins.toLocaleString()} Coins
                          </td>
                          <td className="py-3 px-3.5 text-right text-slate-900 font-black whitespace-nowrap font-mono">
                            {activeStatement.netBalanceCoins.toLocaleString()} Coins
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-sans text-xs">
                            <Receipt className="w-6 h-6 mx-auto mb-1.5 text-slate-300 stroke-[1.5]" />
                            <p className="font-semibold text-slate-600">
                              No transactions recorded for this statement cycle.
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {activeStatement.isCurrent
                                ? 'Participate in studies and earn rewards to accumulate audited balance.'
                                : 'This billing cycle was completed with zero activity.'}
                            </p>
                          </td>
                        </tr>
                      )
                    ) : (
                      (() => {
                        let runningBal = 0;
                        return activeStatement.transactions.map((t) => {
                          const isCredit = t.amount >= 0;
                          const valCoins = Math.abs(t.amount);
                          if (isCredit) {
                            runningBal += valCoins;
                          } else {
                            runningBal = Math.max(0, runningBal - valCoins);
                          }

                          return (
                            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                                {new Date(t.date).toLocaleDateString([], {
                                  month: 'short',
                                  day: '2-digit',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="py-3 px-3.5 text-slate-900 font-sans font-semibold max-w-xs truncate">
                                {t.description}
                              </td>
                              <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                                <span
                                  className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    isCredit
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  {isCredit ? 'Credit (Earnings)' : 'Deduction (Quality Audit)'}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                {!isCredit ? (
                                  <span className="text-rose-600 font-bold">
                                    -{valCoins.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                {isCredit ? (
                                  <span className="text-emerald-700 font-bold">
                                    +{valCoins.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-right text-slate-900 font-black whitespace-nowrap font-mono">
                                {runningBal.toLocaleString()} Coins
                              </td>
                            </tr>
                          );
                        });
                      })()
                    )}
                  </tbody>
                </table>
              </div>

              {/* Statement Quality Audit Footnote */}
              <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 font-sans">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Statement Quality Auditing:</strong> As disclosed in Section 4.2 Quality Guidelines, automated checks on the 1st of every month deduct invalid or robotic responses. Legitimate submissions are credited with zero deductions and transferred to your Net Transferable Balance. Participate in studies and earn rewards!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. PAST PAYOUT REQUEST HISTORY                            */}
      {/* ========================================================= */}
      {userWithdrawals.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Payout Request History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record of completed and processing cashout withdrawals.
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
              {userWithdrawals.length} {userWithdrawals.length === 1 ? 'request' : 'requests'}
            </span>
          </div>

          <div className="space-y-3">
            {userWithdrawals.map((w) => {
              const statusBadge =
                {
                  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  processing: 'bg-sky-100 text-sky-800 border-sky-200',
                  pending: 'bg-amber-100 text-amber-800 border-amber-200',
                  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
                }[w.status] || 'bg-slate-100 text-slate-800 border-slate-200';

              return (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      {w.payoutMethod === 'bank_transfer' ? (
                        <Building2 className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Wallet className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {w.coins.toLocaleString()} Coins
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge}`}
                        >
                          {w.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                        {w.accountDetails}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Requested on {new Date(w.requestedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700 block">
                      {w.payoutMethod.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {w.status === 'completed'
                        ? 'Transferred to account'
                        : 'Under admin compliance review'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerEarningsView;
