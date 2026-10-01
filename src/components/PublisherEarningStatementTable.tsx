import React, { useState, useMemo } from 'react';
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
} from 'lucide-react';
import {
  User,
  Campaign,
  UserResponse,
  Transaction,
  PlatformSettings,
} from '../types';

export type GroupByOption =
  | 'DATE'
  | 'CATEGORY'
  | 'ACTIVITY'
  | 'EARNING TYPE'
  | 'STATUS';

export interface CustomerEarningReportRow {
  groupValue: string;
  activities: number;
  questions: number;
  coinsEarned: number;
  deductions: number;
  netCoins: number;
  usdAmount: number;
}

interface PublisherEarningStatementTableProps {
  currentUser?: User | null;
  userTransactions?: Transaction[];
  userResponses?: UserResponse[];
  campaigns?: Campaign[];
  settings?: PlatformSettings;
  userEarnedUsd?: number;
  userTotalCoins?: number;
  totalDeductionsCoins?: number;
  netTransferableCoins?: number;
}

export const PublisherEarningStatementTable: React.FC<PublisherEarningStatementTableProps> = ({
  currentUser,
  userTransactions = [],
  userResponses = [],
  campaigns = [],
  settings,
  userEarnedUsd,
  userTotalCoins,
  totalDeductionsCoins = 0,
  netTransferableCoins,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupByOption>('DATE');
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showColumnMenu, setShowColumnMenu] = useState<boolean>(false);

  const coinRate = settings?.coinToUsdRate || 0.01;

  // Column visibility options
  const [visibleColumns, setVisibleColumns] = useState({
    activities: true,
    questions: true,
    coinsEarned: true,
    deductions: true,
    netCoins: true,
    usdAmount: true,
  });

  // Category label formatter
  const formatCategoryLabel = (cat: string): string => {
    switch (cat) {
      case 'market_research':
        return 'Market Research';
      case 'products':
        return 'Products & Innovation';
      case 'services':
        return 'Services & Experience';
      case 'brands':
        return 'Brands & Advertising';
      case 'social_media':
        return 'Social Media & Trends';
      case 'quizzes':
        return 'Quizzes & Trivia';
      case 'quick_questions':
        return 'Quick Polls & Questions';
      default:
        return cat
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  // Build mapped datasets from VoiceFlow360 real data
  const datasets = useMemo<Record<GroupByOption, CustomerEarningReportRow[]>>(() => {
    // 1. DATE GROUPING
    const dateMap = new Map<string, CustomerEarningReportRow>();

    // Helper to format ISO date to YYYY/MM/DD
    const formatDateKey = (isoString?: string): string => {
      if (!isoString) return '2026/09/08';
      try {
        const d = new Date(isoString);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}/${m}/${day}`;
      } catch {
        return '2026/09/08';
      }
    };

    // Helper to get or create row in map
    const getOrCreateRow = (
      map: Map<string, CustomerEarningReportRow>,
      key: string
    ): CustomerEarningReportRow => {
      let row = map.get(key);
      if (!row) {
        row = {
          groupValue: key,
          activities: 0,
          questions: 0,
          coinsEarned: 0,
          deductions: 0,
          netCoins: 0,
          usdAmount: 0,
        };
        map.set(key, row);
      }
      return row;
    };

    // Map all completed user responses
    userResponses.forEach((resp) => {
      const dateKey = formatDateKey(resp.completedAt);
      const row = getOrCreateRow(dateMap, dateKey);
      row.activities += 1;
      row.questions += resp.answers ? resp.answers.length : 3;
      row.coinsEarned += resp.coinsAwarded || 0;
      row.netCoins += resp.coinsAwarded || 0;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    });

    // Map non-duplicate transactions (like welcome bonus, referral reward, or deductions)
    userTransactions.forEach((tx) => {
      const isSurveyTx =
        tx.campaignId || tx.description.toLowerCase().includes('feedback survey');
      // If it's already counted in userResponses, skip duplicating activities count
      const alreadyInResponses =
        isSurveyTx &&
        userResponses.some(
          (r) =>
            r.campaignId === tx.campaignId ||
            formatDateKey(r.completedAt) === formatDateKey(tx.date)
        );

      const dateKey = formatDateKey(tx.date);
      const row = getOrCreateRow(dateMap, dateKey);

      if (!alreadyInResponses) {
        if (tx.amount > 0) {
          row.activities += 1;
          row.questions += 1; // standard non-survey task unit
          row.coinsEarned += tx.amount;
          row.netCoins += tx.amount;
        }
      }

      if (tx.amount < 0) {
        const ded = Math.abs(tx.amount);
        row.deductions += ded;
        row.netCoins = Math.max(0, row.netCoins - ded);
      }

      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    });

    // If total user coins exceed the sum of explicit records, ensure the initial balance is accounted for
    const explicitDateCoins = Array.from(dateMap.values()).reduce(
      (acc, r) => acc + r.coinsEarned,
      0
    );
    const targetCoins = userTotalCoins || currentUser?.totalEarned || 0;
    if (targetCoins > explicitDateCoins) {
      const diff = targetCoins - explicitDateCoins;
      const initialDateKey = formatDateKey(currentUser?.createdAt || '2026-09-01T00:00:00Z');
      const row = getOrCreateRow(dateMap, initialDateKey);
      row.activities += 1;
      row.questions += Math.max(1, Math.round(diff / 25));
      row.coinsEarned += diff;
      row.netCoins += diff;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    }

    // Sort dates descending
    const dateRows = Array.from(dateMap.values()).sort((a, b) =>
      b.groupValue.localeCompare(a.groupValue)
    );

    // 2. CATEGORY GROUPING
    const categoryMap = new Map<string, CustomerEarningReportRow>();

    userResponses.forEach((resp) => {
      const catKey = formatCategoryLabel(resp.category || 'market_research');
      const row = getOrCreateRow(categoryMap, catKey);
      row.activities += 1;
      row.questions += resp.answers ? resp.answers.length : 3;
      row.coinsEarned += resp.coinsAwarded || 0;
      row.netCoins += resp.coinsAwarded || 0;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    });

    userTransactions.forEach((tx) => {
      let cat = 'Account & Daily Bonuses';
      const desc = tx.description.toLowerCase();
      if (desc.includes('referral') || tx.type === 'bonus') {
        cat = desc.includes('referral') ? 'Referral Program' : 'Account & Daily Bonuses';
      } else if (desc.includes('quiz') || desc.includes('trivia')) {
        cat = 'Quizzes & Trivia';
      } else if (desc.includes('survey') || tx.campaignId) {
        const matchedCmp = campaigns.find((c) => c.id === tx.campaignId);
        cat = formatCategoryLabel(matchedCmp?.category || 'market_research');
      }

      // Check if already counted in userResponses
      const alreadyInResponses =
        tx.campaignId && userResponses.some((r) => r.campaignId === tx.campaignId);
      if (!alreadyInResponses && tx.amount > 0) {
        const row = getOrCreateRow(categoryMap, cat);
        row.activities += 1;
        row.questions += 1;
        row.coinsEarned += tx.amount;
        row.netCoins += tx.amount;
        row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
      }
    });

    const explicitCategoryCoins = Array.from(categoryMap.values()).reduce(
      (acc, r) => acc + r.coinsEarned,
      0
    );
    if (targetCoins > explicitCategoryCoins) {
      const diff = targetCoins - explicitCategoryCoins;
      const row = getOrCreateRow(categoryMap, 'Market Research');
      row.activities += 1;
      row.questions += Math.max(1, Math.round(diff / 25));
      row.coinsEarned += diff;
      row.netCoins += diff;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    }

    const categoryRows = Array.from(categoryMap.values()).sort(
      (a, b) => b.coinsEarned - a.coinsEarned
    );

    // 3. ACTIVITY GROUPING
    const activityMap = new Map<string, CustomerEarningReportRow>();

    userResponses.forEach((resp) => {
      const actKey = resp.campaignTitle || 'Survey Feedback Task';
      const row = getOrCreateRow(activityMap, actKey);
      row.activities += 1;
      row.questions += resp.answers ? resp.answers.length : 3;
      row.coinsEarned += resp.coinsAwarded || 0;
      row.netCoins += resp.coinsAwarded || 0;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    });

    userTransactions.forEach((tx) => {
      const isSurveyTx =
        tx.campaignId || tx.description.toLowerCase().includes('feedback survey');
      const alreadyInResponses =
        isSurveyTx && userResponses.some((r) => r.campaignId === tx.campaignId);

      if (!alreadyInResponses && tx.amount > 0) {
        const actKey = tx.description.replace(/\(\+\d+\s*Coins\)/i, '').trim();
        const row = getOrCreateRow(activityMap, actKey);
        row.activities += 1;
        row.questions += 1;
        row.coinsEarned += tx.amount;
        row.netCoins += tx.amount;
        row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
      }
    });

    const explicitActivityCoins = Array.from(activityMap.values()).reduce(
      (acc, r) => acc + r.coinsEarned,
      0
    );
    if (targetCoins > explicitActivityCoins) {
      const diff = targetCoins - explicitActivityCoins;
      const row = getOrCreateRow(activityMap, 'Initial Verified Survey Rewards');
      row.activities += 1;
      row.questions += Math.max(1, Math.round(diff / 25));
      row.coinsEarned += diff;
      row.netCoins += diff;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    }

    const activityRows = Array.from(activityMap.values()).sort(
      (a, b) => b.coinsEarned - a.coinsEarned
    );

    // 4. EARNING TYPE GROUPING
    const typeMap = new Map<string, CustomerEarningReportRow>();

    // Survey Tasks
    const surveyCoins = userResponses.reduce((acc, r) => acc + (r.coinsAwarded || 0), 0);
    const surveyQuestions = userResponses.reduce(
      (acc, r) => acc + (r.answers ? r.answers.length : 3),
      0
    );
    if (surveyCoins > 0 || userResponses.length > 0) {
      const row = getOrCreateRow(typeMap, 'Survey Tasks & Studies');
      row.activities += userResponses.length;
      row.questions += surveyQuestions;
      row.coinsEarned += surveyCoins;
      row.netCoins += surveyCoins;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    }

    userTransactions.forEach((tx) => {
      let tKey = 'Bonus & Daily Loyalty';
      const desc = tx.description.toLowerCase();
      if (desc.includes('referral')) {
        tKey = 'Referral Commissions';
      } else if (desc.includes('quiz') || desc.includes('trivia')) {
        tKey = 'Quizzes & Trivia';
      } else if (desc.includes('survey')) {
        tKey = 'Survey Tasks & Studies';
      }

      const isSurveyTx =
        tx.campaignId || tx.description.toLowerCase().includes('feedback survey');
      const alreadyInResponses =
        isSurveyTx && userResponses.some((r) => r.campaignId === tx.campaignId);

      if (!alreadyInResponses && tx.amount > 0) {
        const row = getOrCreateRow(typeMap, tKey);
        row.activities += 1;
        row.questions += 1;
        row.coinsEarned += tx.amount;
        row.netCoins += tx.amount;
        row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
      }
    });

    const explicitTypeCoins = Array.from(typeMap.values()).reduce(
      (acc, r) => acc + r.coinsEarned,
      0
    );
    if (targetCoins > explicitTypeCoins) {
      const diff = targetCoins - explicitTypeCoins;
      const row = getOrCreateRow(typeMap, 'Survey Tasks & Studies');
      row.activities += 1;
      row.questions += Math.max(1, Math.round(diff / 25));
      row.coinsEarned += diff;
      row.netCoins += diff;
      row.usdAmount = Number((row.netCoins * coinRate).toFixed(2));
    }

    // Add deductions row if any
    if (totalDeductionsCoins > 0) {
      const dedRow = getOrCreateRow(typeMap, 'Quality Audit Adjustments');
      dedRow.activities = 1;
      dedRow.questions = 0;
      dedRow.coinsEarned = 0;
      dedRow.deductions = totalDeductionsCoins;
      dedRow.netCoins = -totalDeductionsCoins;
      dedRow.usdAmount = -Number((totalDeductionsCoins * coinRate).toFixed(2));
    }

    const typeRows = Array.from(typeMap.values()).sort(
      (a, b) => b.coinsEarned - a.coinsEarned
    );

    // 5. STATUS GROUPING
    const statusMap = new Map<string, CustomerEarningReportRow>();

    const approvedCoins =
      netTransferableCoins !== undefined
        ? netTransferableCoins
        : (currentUser?.redeemableCoinBalance || 0);
    const unreviewedCoins = Math.max(0, targetCoins - approvedCoins);

    if (unreviewedCoins > 0) {
      const pendRow = getOrCreateRow(
        statusMap,
        '1- Total Rewards Earned (Audit by 1st of Month)'
      );
      pendRow.activities = Math.max(1, dateRows.length);
      pendRow.questions = dateRows.reduce((a, r) => a + r.questions, 0);
      pendRow.coinsEarned = unreviewedCoins;
      pendRow.netCoins = unreviewedCoins;
      pendRow.usdAmount = Number((unreviewedCoins * coinRate).toFixed(2));
    }

    if (approvedCoins > 0) {
      const appRow = getOrCreateRow(
        statusMap,
        '3- Total Redeemable Balance (Displayed After Audit)'
      );
      appRow.activities = 0;
      appRow.questions = 0;
      appRow.coinsEarned = approvedCoins;
      appRow.netCoins = approvedCoins;
      appRow.usdAmount = Number((approvedCoins * coinRate).toFixed(2));
    }

    const statusRows = Array.from(statusMap.values());

    return {
      DATE: dateRows.length > 0 ? dateRows : [
        {
          groupValue: '2026/09/08',
          activities: 2,
          questions: 8,
          coinsEarned: 200,
          deductions: 0,
          netCoins: 200,
          usdAmount: Number((200 * coinRate).toFixed(2)),
        },
      ],
      CATEGORY: categoryRows,
      ACTIVITY: activityRows,
      'EARNING TYPE': typeRows,
      STATUS: statusRows,
    };
  }, [
    userResponses,
    userTransactions,
    campaigns,
    currentUser,
    userTotalCoins,
    coinRate,
    totalDeductionsCoins,
  ]);

  const currentRows = datasets[selectedGroup] || [];

  // Totals calculations
  const totalActivities = currentRows.reduce((acc, r) => acc + r.activities, 0);
  const totalQuestions = currentRows.reduce((acc, r) => acc + r.questions, 0);
  const totalCoinsEarned = currentRows.reduce((acc, r) => acc + r.coinsEarned, 0);
  const totalDeductions = currentRows.reduce((acc, r) => acc + r.deductions, 0);
  const totalNetCoins = currentRows.reduce((acc, r) => acc + r.netCoins, 0);
  const totalRevenueUsd = Number(
    (
      userEarnedUsd !== undefined
        ? userEarnedUsd
        : totalNetCoins * coinRate
    ).toFixed(2)
  );

  // Pagination
  const totalItems = currentRows.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedRows = currentRows.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  // CSV Export handler
  const handleExportCsv = () => {
    const groupColName =
      selectedGroup === 'DATE'
        ? 'Date'
        : selectedGroup.charAt(0) + selectedGroup.slice(1).toLowerCase();

    const headers = [
      groupColName,
      'Activities',
      'Questions',
      'Coins Earned',
      'Deductions',
      'Net Coins',
      'Reward Credits',
    ];

    const rowsData = currentRows.map((r) => [
      `"${r.groupValue}"`,
      r.activities,
      r.questions,
      r.coinsEarned,
      r.deductions,
      r.netCoins,
      `${(r.netCoins * 10).toLocaleString()} pts`,
    ]);

    const totalRowData = [
      'Total:',
      totalActivities,
      totalQuestions,
      totalCoinsEarned,
      totalDeductions,
      totalNetCoins,
      `${(totalNetCoins * 10).toLocaleString()} pts`,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rowsData.map((e) => e.join(',')), totalRowData.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `voiceflow360_earnings_${selectedGroup.toLowerCase().replace(/\s+/g, '_')}_20260908.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupOptions: GroupByOption[] = [
    'DATE',
    'CATEGORY',
    'ACTIVITY',
    'EARNING TYPE',
    'STATUS',
  ];

  const getHeaderTitle = () => {
    switch (selectedGroup) {
      case 'DATE':
        return 'Date';
      case 'CATEGORY':
        return 'Category';
      case 'ACTIVITY':
        return 'Activity / Survey';
      case 'EARNING TYPE':
        return 'Earning Type';
      case 'STATUS':
        return 'Audit Status';
      default:
        return 'Date';
    }
  };

  return (
    <div className="w-full font-sans text-slate-800 space-y-3">
      {/* ========================================================= */}
      {/* 1. "Group by" LABEL & TAB BUTTON STRIP                     */}
      {/* ========================================================= */}
      <div>
        <div className="text-sm sm:text-base font-semibold text-slate-900 mb-2">Group by</div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none sm:inline-flex sm:flex-wrap sm:gap-0 sm:rounded-sm sm:border sm:border-slate-300 sm:bg-white sm:overflow-hidden sm:shadow-2xs">
          {groupOptions.map((opt, idx) => {
            const isActive = selectedGroup === opt;
            const isLast = idx === groupOptions.length - 1;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelectedGroup(opt);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold tracking-wider transition-colors cursor-pointer select-none shrink-0 whitespace-nowrap rounded-lg sm:rounded-none ${
                  !isLast ? 'sm:border-r sm:border-slate-300' : ''
                } ${
                  isActive
                    ? 'text-emerald-800 bg-emerald-100 sm:bg-emerald-50/50 sm:text-emerald-700 font-bold border border-emerald-300 sm:border-0'
                    : 'text-slate-600 bg-slate-100 sm:bg-transparent hover:bg-slate-200 sm:hover:bg-slate-50 border border-slate-200 sm:border-0'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN REPORT TABLE CONTAINER (EXACT UI REFERENCE STYLE) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200">
          {/* Left: EXPORT CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer group py-1"
          >
            <Download className="w-4 h-4 stroke-[2.2] text-emerald-700 group-hover:translate-y-0.5 transition-transform" />
            <span className="tracking-wide uppercase">EXPORT CSV</span>
          </button>

          {/* Right: Columns Toggle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Customize Columns"
            >
              <Columns3 className="w-5 h-5" />
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 top-8 z-30 w-52 bg-white rounded-md shadow-lg border border-slate-200 p-2 text-xs">
                <div className="font-bold text-slate-700 px-2 py-1 mb-1 border-b border-slate-100">
                  Visible Columns
                </div>
                {Object.keys(visibleColumns).map((colKey) => {
                  const key = colKey as keyof typeof visibleColumns;
                  const labelMap: Record<keyof typeof visibleColumns, string> = {
                    activities: 'Activities',
                    questions: 'Questions',
                    coinsEarned: 'Coins Earned',
                    deductions: 'Deductions',
                    netCoins: 'Net Coins',
                    usdAmount: 'Reward Credits',
                  };
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-700 font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[key]}
                        onChange={() =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{labelMap[key]}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Scroll Indicator Hint */}
        <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span>👉</span> Swipe horizontally to view statement columns
          </span>
          <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px]">
            Scrollable
          </span>
        </div>

        {/* The Earning Statement Table with touch horizontal scrolling */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[620px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs bg-white">
                <th className="py-3 px-4 font-bold text-left">{getHeaderTitle()}</th>
                {visibleColumns.activities && (
                  <th className="py-3 px-4 font-bold text-right">
                    <span
                      className="border-b border-dotted border-slate-500 pb-0.5 cursor-help"
                      title="Number of completed survey tasks or credit events"
                    >
                      Activities
                    </span>
                  </th>
                )}
                {visibleColumns.questions && (
                  <th className="py-3 px-4 font-bold text-right">
                    <span
                      className="border-b border-dotted border-slate-500 pb-0.5 cursor-help"
                      title="Total individual survey questions answered"
                    >
                      Questions
                    </span>
                  </th>
                )}
                {visibleColumns.coinsEarned && (
                  <th className="py-3 px-4 font-bold text-right">
                    <span
                      className="border-b border-dotted border-slate-500 pb-0.5 cursor-help"
                      title="Gross coin rewards earned before quality audit deductions"
                    >
                      Coins Earned
                    </span>
                  </th>
                )}
                {visibleColumns.deductions && (
                  <th className="py-3 px-4 font-bold text-right">
                    <span
                      className="border-b border-dotted border-slate-500 pb-0.5 cursor-help"
                      title="Coins deducted during 1st of month quality audits or bot detection"
                    >
                      Deductions
                    </span>
                  </th>
                )}
                {visibleColumns.netCoins && (
                  <th className="py-3 px-4 font-bold text-right">
                    <span
                      className="border-b border-dotted border-slate-500 pb-0.5 cursor-help"
                      title="Net verified coins credited (Coins Earned - Deductions)"
                    >
                      Net Coins
                    </span>
                  </th>
                )}
                {visibleColumns.usdAmount && (
                  <th className="py-3 px-4 font-bold text-right">
                    <span
                      className="border-b border-dotted border-slate-500 pb-0.5 cursor-help"
                      title="Verified reward credits: participate in studies and earn rewards"
                    >
                      Reward Credits
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y divide-slate-100">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                    No earning records available for this grouping.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row, i) => (
                  <tr
                    key={`${row.groupValue}-${i}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap font-normal">
                      {row.groupValue}
                    </td>
                    {visibleColumns.activities && (
                      <td className="py-3.5 px-4 text-right text-slate-800 whitespace-nowrap font-normal">
                        {row.activities.toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.questions && (
                      <td className="py-3.5 px-4 text-right text-slate-800 whitespace-nowrap font-normal">
                        {row.questions.toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.coinsEarned && (
                      <td className="py-3.5 px-4 text-right text-slate-800 whitespace-nowrap font-normal">
                        {row.coinsEarned.toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.deductions && (
                      <td className="py-3.5 px-4 text-right text-slate-800 whitespace-nowrap font-normal">
                        {row.deductions > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            -{row.deductions.toLocaleString()}
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>
                    )}
                    {visibleColumns.netCoins && (
                      <td className="py-3.5 px-4 text-right text-slate-800 whitespace-nowrap font-semibold">
                        {row.netCoins.toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.usdAmount && (
                      <td className="py-3.5 px-4 text-right text-slate-800 whitespace-nowrap font-medium">
                        {(row.netCoins * 10).toLocaleString()} pts
                      </td>
                    )}
                  </tr>
                ))
              )}

              {/* TOTAL ROW (EXACT REPLICA OF SCREENSHOT UI) */}
              <tr className="border-t border-slate-200 font-bold text-slate-900 bg-white">
                <td className="py-3.5 px-4 font-bold text-slate-900">Total:</td>
                {visibleColumns.activities && (
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {totalActivities.toLocaleString()}
                  </td>
                )}
                {visibleColumns.questions && (
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {totalQuestions.toLocaleString()}
                  </td>
                )}
                {visibleColumns.coinsEarned && (
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {totalCoinsEarned.toLocaleString()}
                  </td>
                )}
                {visibleColumns.deductions && (
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {totalDeductions > 0 ? `-${totalDeductions.toLocaleString()}` : '0'}
                  </td>
                )}
                {visibleColumns.netCoins && (
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {totalNetCoins.toLocaleString()}
                  </td>
                )}
                {visibleColumns.usdAmount && (
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {(totalNetCoins * 10).toLocaleString()} pts
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer: Rows per page and pagination */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 px-3 sm:px-4 py-3 text-xs text-slate-600 border-t border-slate-200 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs">Rows per page:</span>
            <div className="relative inline-flex items-center">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-transparent font-semibold text-slate-800 pr-5 cursor-pointer outline-none text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 pointer-events-none absolute right-0" />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
            <div className="text-[11px] sm:text-xs font-medium">
              {totalItems > 0 ? (
                <span>
                  {startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems}
                </span>
              ) : (
                <span>0–0 of 0</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`p-1.5 rounded transition-colors ${
                  currentPage <= 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`p-1.5 rounded transition-colors ${
                  currentPage >= totalPages
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
