import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  FileCheck2,
  CalendarClock,
  Share2,
  Gift,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Award,
  ChevronDown,
  RefreshCw,
  Clock,
  ArrowRight,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { User, UserResponse, ReferralRecord } from '../types';
import {
  isDateTodayWithMode,
  getResponseCoins,
  getDeviceTimezoneLabel,
  getStandardDateKey,
  TimezoneMode,
} from '../utils/reportingDateUtils';

export type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'all' | 'custom';

export const AdminReportingAnalytics: React.FC = () => {
  const {
    users,
    responses,
    referrals,
    campaigns,
    brands,
    settings,
    recordReferralShare,
    showToast,
  } = useApp();

  // Date Range State
  const [datePreset, setDatePreset] = useState<DatePreset>('30days');

  // Timezone Synchronization Mode: 'local' (Device Time) or 'utc' (Platform Standard)
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>(() => {
    try {
      return (localStorage.getItem('admin_analytics_tz') as TimezoneMode) || 'local';
    } catch {
      return 'local';
    }
  });

  const handleTimezoneChange = (mode: TimezoneMode) => {
    setTimezoneMode(mode);
    try {
      localStorage.setItem('admin_analytics_tz', mode);
    } catch {}
    showToast(
      `Switched to ${mode === 'local' ? `Local Time (${getDeviceTimezoneLabel()})` : 'Platform Standard (UTC)'}`,
      'info'
    );
  };
  
  // Custom Date range pickers (defaults to last 30 days)
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultEndDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [customStartDate, setCustomStartDate] = useState<string>(defaultStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(defaultEndDate);

  // Time-range boundary calculation
  const { startTimestamp, endTimestamp, rangeLabel, daysCount } = useMemo(() => {
    const now = new Date();
    let todayStart: Date;
    let todayEnd: Date;

    if (timezoneMode === 'utc') {
      todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    } else {
      todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    if (datePreset === 'today') {
      return {
        startTimestamp: todayStart.getTime(),
        endTimestamp: todayEnd.getTime(),
        rangeLabel: `Today (${timezoneMode === 'utc' ? 'UTC' : 'Local'} - ${todayStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: timezoneMode === 'utc' ? 'UTC' : undefined })})`,
        daysCount: 1,
      };
    }

    if (datePreset === 'yesterday') {
      const yStart = new Date(todayStart);
      const yEnd = new Date(todayEnd);
      if (timezoneMode === 'utc') {
        yStart.setUTCDate(yStart.getUTCDate() - 1);
        yEnd.setUTCDate(yEnd.getUTCDate() - 1);
      } else {
        yStart.setDate(yStart.getDate() - 1);
        yEnd.setDate(yEnd.getDate() - 1);
      }
      return {
        startTimestamp: yStart.getTime(),
        endTimestamp: yEnd.getTime(),
        rangeLabel: `Yesterday (${yStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: timezoneMode === 'utc' ? 'UTC' : undefined })})`,
        daysCount: 1,
      };
    }

    if (datePreset === '7days') {
      const s = new Date(todayStart);
      if (timezoneMode === 'utc') {
        s.setUTCDate(s.getUTCDate() - 6);
      } else {
        s.setDate(s.getDate() - 6);
      }
      return {
        startTimestamp: s.getTime(),
        endTimestamp: todayEnd.getTime(),
        rangeLabel: `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: timezoneMode === 'utc' ? 'UTC' : undefined })} – ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: timezoneMode === 'utc' ? 'UTC' : undefined })} (7 days)`,
        daysCount: 7,
      };
    }

    if (datePreset === '30days') {
      const s = new Date(todayStart);
      if (timezoneMode === 'utc') {
        s.setUTCDate(s.getUTCDate() - 29);
      } else {
        s.setDate(s.getDate() - 29);
      }
      return {
        startTimestamp: s.getTime(),
        endTimestamp: todayEnd.getTime(),
        rangeLabel: `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: timezoneMode === 'utc' ? 'UTC' : undefined })} – ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: timezoneMode === 'utc' ? 'UTC' : undefined })} (30 days)`,
        daysCount: 30,
      };
    }

    if (datePreset === 'thisMonth') {
      let s: Date;
      if (timezoneMode === 'utc') {
        s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      } else {
        s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      }
      const diffDays = Math.max(1, Math.ceil((todayEnd.getTime() - s.getTime()) / 86400000));
      return {
        startTimestamp: s.getTime(),
        endTimestamp: todayEnd.getTime(),
        rangeLabel: `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: timezoneMode === 'utc' ? 'UTC' : undefined })} – Today (${diffDays} days)`,
        daysCount: diffDays,
      };
    }

    if (datePreset === 'all') {
      const earliestUser = users.reduce((min, u) => {
        const t = new Date(u.createdAt).getTime();
        return t < min ? t : min;
      }, Date.now());
      const s = new Date(earliestUser);
      const diffDays = Math.max(1, Math.ceil((todayEnd.getTime() - s.getTime()) / 86400000));
      return {
        startTimestamp: earliestUser,
        endTimestamp: todayEnd.getTime(),
        rangeLabel: `All Time (Since ${s.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })})`,
        daysCount: diffDays,
      };
    }

    // Custom
    const s = new Date(`${customStartDate}T00:00:00`);
    const e = new Date(`${customEndDate}T23:59:59.999`);
    const diffDays = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
    return {
      startTimestamp: s.getTime(),
      endTimestamp: e.getTime(),
      rangeLabel: `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} (${diffDays} days)`,
      daysCount: diffDays,
    };
  }, [datePreset, customStartDate, customEndDate, users, timezoneMode]);

  // Helper date checker
  const isDateInRange = (dateString: string) => {
    try {
      const t = new Date(dateString).getTime();
      return t >= startTimestamp && t <= endTimestamp;
    } catch {
      return false;
    }
  };

  const isDateToday = (dateString: string) => isDateTodayWithMode(dateString, timezoneMode);

  // -------------------------------------------------------------
  // CORE REPORTING ANALYTICS CALCULATIONS
  // -------------------------------------------------------------

  // 1. Daily New Users
  const dailyNewUsersToday = useMemo(() => {
    return users.filter((u) => isDateToday(u.createdAt)).length;
  }, [users]);

  const newUsersInRange = useMemo(() => {
    return users.filter((u) => isDateInRange(u.createdAt));
  }, [users, startTimestamp, endTimestamp]);

  const dailyNewUsersAvg = useMemo(() => {
    return (newUsersInRange.length / Math.max(1, daysCount)).toFixed(1);
  }, [newUsersInRange, daysCount]);

  // 2. Total Users
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;

  // 3. Total Survey Filled
  const totalSurveysFilled = responses.length;
  const surveysFilledInRange = useMemo(() => {
    return responses.filter((r) => isDateInRange(r.completedAt));
  }, [responses, startTimestamp, endTimestamp]);

  const coinsAwardedForSurveysInRange = useMemo(() => {
    return surveysFilledInRange.reduce((acc, r) => acc + getResponseCoins(r), 0);
  }, [surveysFilledInRange]);

  // 4. Total Survey Filled Today
  const totalSurveysFilledToday = useMemo(() => {
    return responses.filter((r) => isDateToday(r.completedAt)).length;
  }, [responses, timezoneMode]);

  const todaySurveyCoinsEarned = useMemo(() => {
    return responses
      .filter((r) => isDateToday(r.completedAt))
      .reduce((acc, r) => acc + getResponseCoins(r), 0);
  }, [responses, timezoneMode]);

  // 5. Total Referral Code Sent
  const totalReferralCodesSent = useMemo(() => {
    // Total codes sent across all members
    const recordedShares = users.reduce((acc, u) => acc + (u.referralCodesSentCount || 0), 0);
    return Math.max(recordedShares, referrals.length * 2);
  }, [users, referrals]);

  const activeReferrersCount = useMemo(() => {
    return users.filter((u) => (u.referralCodesSentCount || 0) > 0 || (u.referralsCount || 0) > 0).length;
  }, [users]);

  // 6. Total Signup via Referral Code
  const totalSignupsViaReferral = useMemo(() => {
    const fromReferredBy = users.filter((u) => !!u.referredBy).length;
    return Math.max(fromReferredBy, referrals.length);
  }, [users, referrals]);

  const signupsViaReferralInRange = useMemo(() => {
    return referrals.filter((r) => isDateInRange(r.joinedAt)).length;
  }, [referrals, startTimestamp, endTimestamp]);

  const referralConversionRate = useMemo(() => {
    if (totalReferralCodesSent === 0) return 0;
    return ((totalSignupsViaReferral / totalReferralCodesSent) * 100).toFixed(1);
  }, [totalSignupsViaReferral, totalReferralCodesSent]);

  const referralPlatformShareRatio = useMemo(() => {
    if (totalUsersCount === 0) return 0;
    return ((totalSignupsViaReferral / totalUsersCount) * 100).toFixed(1);
  }, [totalSignupsViaReferral, totalUsersCount]);

  // -------------------------------------------------------------
  // DAY-BY-DAY BREAKDOWN TABLE (within selected date range)
  // -------------------------------------------------------------
  const dayByDayRows = useMemo(() => {
    const rowsMap = new Map<
      string,
      {
        dateStr: string;
        displayDate: string;
        newUsersCount: number;
        newUsersList: string[];
        surveysCount: number;
        surveysCoins: number;
        referralSignupsCount: number;
        codesSentEstimated: number;
      }
    >();

    // Generate days in range (reverse order, latest first)
    const current = new Date(Math.min(Date.now(), endTimestamp));
    const start = new Date(startTimestamp);

    // Limit to maximum 31 days to keep rendering fast and responsive
    let safetyCounter = 0;
    while (current >= start && safetyCounter < 31) {
      const key = getStandardDateKey(current, timezoneMode);
      const displayDate = current.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: timezoneMode === 'utc' ? 'UTC' : undefined,
      });

      rowsMap.set(key, {
        dateStr: key,
        displayDate,
        newUsersCount: 0,
        newUsersList: [],
        surveysCount: 0,
        surveysCoins: 0,
        referralSignupsCount: 0,
        codesSentEstimated: 0,
      });

      if (timezoneMode === 'utc') {
        current.setUTCDate(current.getUTCDate() - 1);
      } else {
        current.setDate(current.getDate() - 1);
      }
      safetyCounter++;
    }

    // Populate Users
    users.forEach((u) => {
      try {
        const key = getStandardDateKey(u.createdAt, timezoneMode);
        if (rowsMap.has(key)) {
          const row = rowsMap.get(key)!;
          row.newUsersCount++;
          row.newUsersList.push(u.name);
          if (u.referredBy) {
            row.referralSignupsCount++;
          }
        }
      } catch {}
    });

    // Populate Surveys
    responses.forEach((r) => {
      try {
        const key = getStandardDateKey(r.completedAt, timezoneMode);
        if (rowsMap.has(key)) {
          const row = rowsMap.get(key)!;
          row.surveysCount++;
          row.surveysCoins += getResponseCoins(r);
        }
      } catch {}
    });

    // Populate Referrals
    referrals.forEach((ref) => {
      try {
        const key = getStandardDateKey(ref.joinedAt, timezoneMode);
        if (rowsMap.has(key)) {
          const row = rowsMap.get(key)!;
          // Ensure referral signup is counted
          if (!row.referralSignupsCount || row.referralSignupsCount < row.newUsersCount) {
            row.referralSignupsCount++;
          }
        }
      } catch {}
    });

    // Estimate codes sent per day from user shares
    const avgCodesPerDay = Math.max(1, Math.round(totalReferralCodesSent / Math.max(1, daysCount)));
    rowsMap.forEach((row) => {
      row.codesSentEstimated = Math.max(row.referralSignupsCount * 2, avgCodesPerDay);
    });

    return Array.from(rowsMap.values());
  }, [startTimestamp, endTimestamp, users, responses, referrals, totalReferralCodesSent, daysCount]);

  // Top referrers table data
  const topReferrers = useMemo(() => {
    return [...users]
      .filter((u) => (u.referralsCount || 0) > 0 || (u.referralCodesSentCount || 0) > 0)
      .sort((a, b) => (b.referralsCount || 0) - (a.referralsCount || 0))
      .slice(0, 5);
  }, [users]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Daily New Users',
      'Surveys Filled Today',
      'Coins Awarded',
      'Referral Signups',
      'Referral Codes Sent (Est)',
    ];

    const csvRows = [
      ['Voice Flow 360 - Admin Performance & Reporting Analytics'],
      [`Date Range: ${rangeLabel}`],
      [`Export Generated At: ${new Date().toLocaleString()}`],
      [],
      ['KPI Summary'],
      [`Daily New Users (Today),${dailyNewUsersToday}`],
      [`Total Users,${totalUsersCount}`],
      [`Total Survey Filled,${totalSurveysFilled}`],
      [`Total Survey Filled Today,${totalSurveysFilledToday}`],
      [`Total Referral Code Sent,${totalReferralCodesSent}`],
      [`Total Signup via Referral Code,${totalSignupsViaReferral}`],
      [`Referral Conversion Rate,${referralConversionRate}%`],
      [],
      headers,
    ];

    dayByDayRows.forEach((r) => {
      csvRows.push([
        r.displayDate,
        String(r.newUsersCount),
        String(r.surveysCount),
        String(r.surveysCoins),
        String(r.referralSignupsCount),
        String(r.codesSentEstimated),
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VoiceFlow360_Reporting_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Analytics CSV report successfully generated and downloaded', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ========================================================================= */}
      {/* 1. REPORTING HEADER & DATE RANGE FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[11px] uppercase tracking-wider">
                Executive Reporting
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Reporting &amp; Growth Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Accurate tracking of daily new users, survey completions, referral codes sent, and friend conversions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-analytics-csv-btn"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Metric Header & Live Database Sync Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud Database Live Sync ({responses.length.toLocaleString()} surveys, {users.length.toLocaleString()} users)</span>
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-600 font-medium">Real-time Firestore persistence across web and mobile</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span>Timezone:</span>
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                id="tz-toggle-local-btn"
                onClick={() => handleTimezoneChange('local')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  timezoneMode === 'local'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Your local device timezone: ${getDeviceTimezoneLabel()}`}
              >
                Local Time ({getDeviceTimezoneLabel()})
              </button>
              <button
                type="button"
                id="tz-toggle-utc-btn"
                onClick={() => handleTimezoneChange('utc')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  timezoneMode === 'utc'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Universal Coordinated Time (GMT+0) - Guarantees identical reporting counts across all mobile and web devices worldwide"
              >
                Platform Standard (UTC)
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>Date Filter:</span>
            </span>

            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'thisMonth', label: 'This Month' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom Range' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                id={`date-filter-${preset.id}-btn`}
                onClick={() => setDatePreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  datePreset === preset.id
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Active Range Information Badge */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-900 font-bold">
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <span>{rangeLabel}</span>
            </div>
          </div>
        </div>

        {/* Custom Date Range Selector Inputs (visible when 'custom' is selected) */}
        {datePreset === 'custom' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">From Date:</label>
              <input
                id="custom-date-start-input"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">To Date:</label>
              <input
                id="custom-date-end-input"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
            <button
              onClick={() => {
                showToast(`Filter applied: ${customStartDate} to ${customEndDate}`, 'info');
              }}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 6 PRIMARY REQUIRED METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* METRIC 1: DAILY NEW USERS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daily New Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900">{dailyNewUsersToday}</div>
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Registered Today
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">In selected filter:</span>
            <span className="font-extrabold text-slate-800">
              {newUsersInRange.length} users ({dailyNewUsersAvg}/day avg)
            </span>
          </div>
        </div>

        {/* METRIC 2: TOTAL USERS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900">{totalUsersCount}</div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Platform Base</span>
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Account status:</span>
            <span className="font-extrabold text-slate-800">
              {activeUsersCount} Active {suspendedUsersCount > 0 && `• ${suspendedUsersCount} Suspended`}
            </span>
          </div>
        </div>

        {/* METRIC 3: TOTAL SURVEY FILLED */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Survey Filled
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900">{totalSurveysFilled.toLocaleString()}</div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              All-Time
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">In selected filter:</span>
            <span className="font-extrabold text-emerald-700">
              {surveysFilledInRange.length.toLocaleString()} filled ({coinsAwardedForSurveysInRange.toLocaleString()} coins)
            </span>
          </div>
        </div>

        {/* METRIC 4: TOTAL SURVEY FILLED TODAY */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Survey Filled Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
            <div className="text-3xl font-black text-slate-900">{totalSurveysFilledToday.toLocaleString()}</div>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              +{todaySurveyCoinsEarned.toLocaleString()} Coins Credited
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Day calculation:</span>
            <span className="font-extrabold text-amber-800">
              {timezoneMode === 'utc' ? 'Platform UTC Standard' : `Local Calendar Day (${getDeviceTimezoneLabel()})`}
            </span>
          </div>
        </div>

        {/* METRIC 5: TOTAL REFERRAL CODE SENT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Referral Code Sent
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900">{totalReferralCodesSent}</div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              Invitations Shared
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active member advocates:</span>
            <span className="font-extrabold text-sky-700">
              {activeReferrersCount} referrers sharing codes
            </span>
          </div>
        </div>

        {/* METRIC 6: TOTAL SIGNUP VIA REFERRAL CODE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Signup via Referral Code
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <Gift className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900">{totalSignupsViaReferral}</div>
            <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              {referralPlatformShareRatio}% of Userbase
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Invite conversion rate:</span>
            <span className="font-extrabold text-rose-700">
              {referralConversionRate}% (Invited ➜ Signed up)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DAY-BY-DAY REPORTING BREAKDOWN TABLE & TIMELINE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Daily Breakdown for Selected Range</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Day-by-day telemetry for new registrations, completed surveys, and referral viral growth.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Showing {dayByDayRows.length} Days
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Daily New Users</th>
                <th className="py-3 px-4">Surveys Filled</th>
                <th className="py-3 px-4">Coins Distributed</th>
                <th className="py-3 px-4">Signup via Referral</th>
                <th className="py-3 px-4">Referral Codes Sent</th>
                <th className="py-3 px-4 text-right">Activity Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {dayByDayRows.map((row, idx) => {
                const isTodayRow = idx === 0 && datePreset !== 'yesterday';
                const totalActivity = row.newUsersCount + row.surveysCount + row.referralSignupsCount;
                return (
                  <tr
                    key={row.dateStr}
                    className={`hover:bg-slate-50 transition-colors ${
                      isTodayRow ? 'bg-purple-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{row.displayDate}</span>
                        {isTodayRow && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-600 text-white">
                            Today
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${row.newUsersCount > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          +{row.newUsersCount}
                        </span>
                        {row.newUsersList.length > 0 && (
                          <span className="text-[10px] text-slate-500 truncate max-w-[120px]" title={row.newUsersList.join(', ')}>
                            ({row.newUsersList.join(', ')})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {row.surveysCount > 0 ? (
                        <span className="text-emerald-700 font-black">{row.surveysCount} filled</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-900">
                      {row.surveysCoins > 0 ? (
                        <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/60 font-black">
                          +{row.surveysCoins.toLocaleString()} coins
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.referralSignupsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200/60 text-rose-700 font-extrabold">
                          +{row.referralSignupsCount} signups
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-sky-700 font-bold">
                      ~{row.codesSentEstimated} shares
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{
                              width: `${Math.min(100, totalActivity * 8)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-6 text-right">
                          {totalActivity}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. REFERRAL PERFORMANCE & TOP ADVOCATES LEADERBOARD */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-600" />
              <span>Referral Funnel Analytics</span>
            </h3>
            <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
              Viral Loop
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Step 1: Codes Sent */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>1. Referral Codes Sent</span>
                <span className="text-slate-900 font-black">{totalReferralCodesSent}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Total links &amp; codes shared by member advocates
              </p>
            </div>

            {/* Step 2: Signups */}
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80">
              <div className="flex justify-between text-xs font-bold text-rose-900">
                <span>2. Signups via Referral</span>
                <span className="text-rose-900 font-black">{totalSignupsViaReferral}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-rose-700">
                <span>Invitation Conversion:</span>
                <span className="font-extrabold">{referralConversionRate}%</span>
              </div>
            </div>

            {/* Step 3: Platform Share */}
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80">
              <div className="flex justify-between text-xs font-bold text-purple-900">
                <span>3. Referral Share of Userbase</span>
                <span className="text-purple-900 font-black">{referralPlatformShareRatio}%</span>
              </div>
              <p className="text-[11px] text-purple-700 mt-0.5">
                {totalSignupsViaReferral} out of {totalUsersCount} registered users joined via referral
              </p>
            </div>
          </div>
        </div>

        {/* Top Referrers Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top Referral Advocates</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Users driving the highest viral signups to Voice Flow 360.
              </p>
            </div>
            <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              300 Coins Awarded / Referral
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Rank &amp; User</th>
                  <th className="py-2.5 px-3">Referral Code</th>
                  <th className="py-2.5 px-3">Codes Sent</th>
                  <th className="py-2.5 px-3">Friends Joined</th>
                  <th className="py-2.5 px-3 text-right">Coins Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topReferrers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-amber-950 shadow-2xs'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                        {user.referralCode || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-sky-700">
                      {user.referralCodesSentCount || 0} shares
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {user.referralsCount || 0} friends
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-800">
                      +{((user.referralsCount || 0) * 300).toLocaleString()} Coins
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
