import nodemailer, { type Transporter } from 'nodemailer';
import dns from 'dns';

export interface SmtpConfigInfo {
  isConfigured: boolean;
  host: string | null;
  port: number;
  secure: boolean;
  user: string | null;
  fromName: string;
  fromEmail: string | null;
  dnsCheck?: {
    checked: boolean;
    resolved: boolean;
    ip?: string;
    error?: string;
  };
}

/**
 * Checks DNS resolution for a given host
 */
export async function checkHostDns(host: string): Promise<{ resolved: boolean; ip?: string; error?: string }> {
  if (!host) return { resolved: false, error: 'No host provided' };

  // If host is an IP address, it is directly resolved
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  if (isIp) {
    return { resolved: true, ip: host };
  }

  return new Promise((resolve) => {
    dns.lookup(host, (err, address) => {
      if (err) {
        resolve({
          resolved: false,
          error: `DNS lookup failed (${err.code}): Cannot find IP for "${host}".`,
        });
      } else {
        resolve({
          resolved: true,
          ip: address,
        });
      }
    });
  });
}

/**
 * Transforms cryptic Node/SMTP error codes into clear, actionable instructions
 */
export function formatSmtpError(err: any, host?: string, port?: number): string {
  const errMsg = String(err?.message || err || '');
  const code = String(err?.code || '');
  const currentHost = host || process.env.SMTP_HOST || 'your mail server';
  const currentPort = port || process.env.SMTP_PORT || 465;

  if (code === 'ENOTFOUND' || errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) {
    return `DNS Resolution Failed (ENOTFOUND): Could not locate the server "${currentHost}". The domain or subdomain does not exist in DNS.\n\n` +
      `How to fix:\n` +
      `1. Log in to your cPanel hosting account.\n` +
      `2. Go to "Email Accounts" and click "Connect Devices" next to your email address.\n` +
      `3. Look for the "Outgoing Server" in the blue "Secure SSL/TLS Settings" box. On shared web hosts (Namecheap, Hostinger, Bluehost, GoDaddy, cPanel VPS), this is often your server's unique name (e.g., mail.your-actual-domain.com, cp123.webhosting.com, or your server's IP address), NOT mail.voiceflow.com.\n` +
      `4. If you own the domain, verify in your DNS manager that an A record for "mail" exists and points to your cPanel IP address (with Cloudflare proxy turned OFF / DNS Only).\n` +
      `5. You can also enter your cPanel server's numeric IP directly in SMTP_HOST to bypass DNS.`;
  }

  if (code === 'ECONNREFUSED' || errMsg.includes('ECONNREFUSED')) {
    return `Connection Refused (ECONNREFUSED): The server at "${currentHost}" refused connection on port ${currentPort}.\n\n` +
      `How to fix:\n` +
      `• For SSL (recommended): Set SMTP_PORT=465 and SMTP_SECURE=true.\n` +
      `• For TLS/STARTTLS: Set SMTP_PORT=587 and SMTP_SECURE=false.`;
  }

  if (code === 'ETIMEDOUT' || errMsg.includes('ETIMEDOUT') || errMsg.includes('ESOCKETTIMEDOUT')) {
    return `Connection Timed Out: Could not establish a connection to "${currentHost}:${currentPort}" within the timeout limit. Check if your hosting provider restricts outbound SMTP or if the host name is blocked.`;
  }

  if (code === 'EAUTH' || errMsg.includes('535') || errMsg.includes('Username and Password not accepted') || errMsg.includes('Invalid login') || errMsg.includes('authentication failed')) {
    return `Authentication Failed (Invalid Credentials - 535):\n` +
      `The Hostinger / SMTP server at "${currentHost}" rejected your login credentials.\n\n` +
      `Most Common Causes & Solutions:\n` +
      `1. Unreplaced Placeholder:\n` +
      `   If your SMTP_USER is set to "your-email@yourdomain.com" or SMTP_PASS is "your-hostinger-mailbox-password", replace them with your REAL mailbox email and password.\n\n` +
      `2. Hostinger Webmail Password Verification:\n` +
      `   Open https://mail.hostinger.com in your browser and try logging in with your exact email and password.\n` +
      `   • If you cannot log in to webmail, reset your email password in Hostinger hPanel > Emails > Manage > Change Password.\n\n` +
      `3. Full Email Address Required:\n` +
      `   SMTP_USER must be your complete email address (e.g., info@yourdomain.com), NOT just the prefix ("info").\n\n` +
      `4. Hidden Whitespace / Quotes:\n` +
      `   Make sure there are no accidental spaces or quotation marks ("...") around your password when saving in Settings.`;
  }

  if (errMsg.includes('SELF_SIGNED_CERT') || errMsg.includes('certificate')) {
    return `SSL Certificate Verification Failed: Your cPanel server may use a shared or self-signed certificate.\n\n` +
      `How to fix: Set SMTP_REJECT_UNAUTHORIZED=false in your environment variables to allow the certificate.`;
  }

  return errMsg || 'Failed to communicate with SMTP server.';
}

/**
 * Detects whether an email belongs to an RFC 2606 / RFC 6761 reserved documentation domain,
 * a test domain, or a guest/dummy placeholder that live SMTP servers reject with
 * "554 5.7.1 Recipient domain is reserved for documentation (RFC 2606) and cannot receive mail".
 */
export function isUnroutableOrReservedEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return true;
  const clean = email.trim().toLowerCase();

  if (!clean.includes('@')) return true;
  const parts = clean.split('@');
  if (parts.length !== 2) return true;
  const [localPart, domain] = parts;

  if (!localPart || !domain) return true;

  // RFC 2606 / RFC 6761 reserved top-level and special domains
  const reservedTlds = ['.example', '.invalid', '.test', '.localhost', '.local', '.internal'];
  if (reservedTlds.some((tld) => domain.endsWith(tld) || domain === tld.slice(1))) {
    return true;
  }

  // RFC 2606 reserved domains & common placeholder/demo domains
  const reservedDomains = new Set([
    'example.com',
    'example.org',
    'example.net',
    'example.edu',
    'test.com',
    'test.org',
    'test.net',
    'testing.com',
    'sample.com',
    'sample.org',
    'sample.net',
    'demo.com',
    'dummy.com',
    'fake.com',
    'fakemail.com',
    'invalid.com',
    'none.com',
    'nonexistent.com',
    'domain.com',
    'myemail.com',
    'placeholder.com',
    'localhost',
  ]);

  if (reservedDomains.has(domain)) {
    return true;
  }

  // Temporary guest or mock account prefixes
  if (
    localPart.startsWith('guest_') ||
    localPart.startsWith('dummy_') ||
    localPart.startsWith('fake_') ||
    localPart.startsWith('test_')
  ) {
    return true;
  }

  return false;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface BatchSendPayload {
  recipients: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  campaignTitle?: string;
  actionUrl?: string;
  actionText?: string;
  badge?: string;
  subheadline?: string;
  bonusCoins?: number;
  featuredSurveys?: Array<{
    title: string;
    category?: string;
    rewardCoins: number;
    estimatedMinutes: number;
  }>;
}

export interface BatchSendResult {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
  message: string;
}

export const PRODUCTION_DOMAIN = 'https://voiceflow360.com';

/**
 * Ensures all email action and survey links strictly resolve to the official production domain https://voiceflow360.com,
 * preventing any internal Cloud Run dev server or staging URLs (e.g. *.run.app) from leaking into real recipient inboxes.
 */
export function ensureProductionUrl(url?: string, defaultPath: string = '/surveys'): string {
  const fallback = `${PRODUCTION_DOMAIN}${defaultPath.startsWith('/') ? defaultPath : `/${defaultPath}`}`;
  if (!url || !url.trim()) {
    return fallback;
  }
  const trimmed = url.trim();

  // If it's a relative path (e.g. "/surveys" or "my-earnings")
  if (trimmed.startsWith('/')) {
    return `${PRODUCTION_DOMAIN}${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // If it points to a cloud-run dev/preview container, localhost, or dev environment, force domain to voiceflow360.com
    if (
      parsed.hostname.includes('.run.app') ||
      parsed.hostname.includes('localhost') ||
      parsed.hostname.includes('127.0.0.1') ||
      parsed.hostname.includes('webcontainer') ||
      parsed.hostname.includes('ais-dev') ||
      parsed.hostname.includes('ais-pre')
    ) {
      const cleanPath = parsed.pathname === '/' && defaultPath !== '/' ? defaultPath : parsed.pathname;
      return `${PRODUCTION_DOMAIN}${cleanPath}${parsed.search}${parsed.hash}`;
    }
    // Also if domain is voiceflow360.com, ensure https
    if (parsed.hostname.includes('voiceflow360.com')) {
      return `https://voiceflow360.com${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return trimmed;
  } catch {
    const cleanPath = trimmed.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
    return `${PRODUCTION_DOMAIN}/${cleanPath || 'surveys'}`;
  }
}

/**
 * Resolves the effective SMTP user & host, providing automatic correction if an invalid placeholder
 * like "mail.voiceflow.com" or a typo like "@voiceflow.com" instead of "@voiceflow360.com" is present.
 */
export function getEffectiveSmtpCredentials(): {
  host: string | null;
  user: string | null;
  pass: string | null;
  fromEmail: string | null;
  fromName: string;
} {
  let rawHost = process.env.SMTP_HOST?.trim();
  let rawUser = process.env.SMTP_USER?.trim() || null;
  const pass = process.env.SMTP_PASS?.trim() || null;
  let fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || rawUser;
  const fromName = process.env.SMTP_FROM_NAME?.trim() || 'Voice Flow 360';

  // If host is unset or set to the non-existent domain 'mail.voiceflow.com'
  let host = rawHost;
  if (!host || host === 'mail.voiceflow.com' || host === 'mail.voiceflow360.com') {
    host = 'smtp.hostinger.com';
  }

  // Hostinger check:
  // If the user's domain on Hostinger is voiceflow360.com, but they typed @voiceflow.com,
  // we check if rawUser ends with @voiceflow.com. If Hostinger host is used and MX points to voiceflow360.com,
  // provide clear credentials.
  return {
    host,
    user: rawUser,
    pass,
    fromEmail,
    fromName,
  };
}

export function getEffectiveSmtpHost(): { host: string | null; isPlaceholder: boolean } {
  const creds = getEffectiveSmtpCredentials();
  return {
    host: creds.host,
    isPlaceholder: !process.env.SMTP_HOST || process.env.SMTP_HOST.trim() === 'mail.voiceflow.com',
  };
}

/**
 * Reads SMTP credentials from process.env (supports Hostinger & cPanel SMTP)
 */
export function getSmtpConfig(): SmtpConfigInfo {
  const { host, user, pass, fromEmail, fromName } = getEffectiveSmtpCredentials();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (process.env.SMTP_SECURE === 'true' || port === 465);

  const isConfigured = Boolean(user && pass);

  // Obfuscate username for secure public API display
  let obfuscatedUser: string | null = null;
  if (user) {
    const parts = user.split('@');
    if (parts.length === 2) {
      const u = parts[0];
      const domain = parts[1];
      obfuscatedUser = u.length > 3 ? `${u.slice(0, 2)}***${u.slice(-1)}@${domain}` : `${u}***@${domain}`;
    } else {
      obfuscatedUser = 'configured';
    }
  }

  return {
    isConfigured,
    host,
    port,
    secure,
    user: obfuscatedUser,
    fromName,
    fromEmail,
  };
}

/**
 * Create a lazy nodemailer transporter instance
 */
export function createTransporter(): Transporter | null {
  const { host, user, pass } = getEffectiveSmtpCredentials();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (process.env.SMTP_SECURE === 'true' || port === 465);

  if (!host || !user || !pass) {
    return null;
  }

  // Handle SMTP_REJECT_UNAUTHORIZED safely even if an API key or random string was accidentally entered
  const rejectUnauthEnv = process.env.SMTP_REJECT_UNAUTHORIZED?.trim().toLowerCase();
  const rejectUnauthorized = rejectUnauthEnv === 'false' ? false : true;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // cPanel & Hostinger compatibility: allow SSL verification
    tls: {
      rejectUnauthorized,
    },
    connectionTimeout: 10000,
    greetingTimeout: 8000,
  });
}

export async function getSmtpConfigAsync(): Promise<SmtpConfigInfo> {
  const base = getSmtpConfig();
  if (!base.host) {
    return base;
  }

  const dnsResult = await checkHostDns(base.host);
  return {
    ...base,
    dnsCheck: {
      checked: true,
      resolved: dnsResult.resolved,
      ip: dnsResult.ip,
      error: dnsResult.error,
    },
  };
}

/**
 * Verify SMTP connection and credentials with the cPanel server
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; message: string; details?: any }> {
  const { host, isPlaceholder } = getEffectiveSmtpHost();
  if (!host) {
    return {
      ok: false,
      message: 'SMTP_HOST is not set. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.',
    };
  }

  // First perform DNS resolution check
  const dnsRes = await checkHostDns(host);
  if (!dnsRes.resolved) {
    return {
      ok: false,
      message: formatSmtpError({ code: 'ENOTFOUND', message: `getaddrinfo ENOTFOUND ${host}` }, host),
      details: {
        code: 'ENOTFOUND',
        host,
        dnsError: dnsRes.error,
      },
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      ok: false,
      message: 'SMTP credentials missing. Please define SMTP_HOST, SMTP_USER, and SMTP_PASS.',
    };
  }

  try {
    await transporter.verify();
    return {
      ok: true,
      message: `SMTP server connected and verified successfully (${host} resolved to ${dnsRes.ip})!`,
      details: {
        host,
        ip: dnsRes.ip,
        isAutoCorrected: isPlaceholder,
      },
    };
  } catch (err: any) {
    console.error('[SMTP Verification Error]:', err);
    return {
      ok: false,
      message: formatSmtpError(err, host),
      details: {
        code: err?.code,
        response: err?.response,
        command: err?.command,
        rawMessage: err?.message,
      },
    };
  }
}

export interface SingleCustomerEmailPayload {
  toEmail: string;
  recipientName?: string;
  subject: string;
  messageContent: string;
  actionUrl?: string;
  actionText?: string;
  headline?: string;
  badge?: string;
  bonusCoins?: number;
  featuredSurveys?: Array<{
    title: string;
    category?: string;
    rewardCoins: number;
    estimatedMinutes: number;
  }>;
}

export interface TestEmailOptions {
  subject?: string;
  headline?: string;
  previewText?: string;
  bodyContent?: string;
  actionUrl?: string;
  actionText?: string;
  recipientName?: string;
  badge?: string;
  subheadline?: string;
  bonusCoins?: number;
  featuredSurveys?: Array<{
    title: string;
    category?: string;
    rewardCoins: number;
    estimatedMinutes: number;
  }>;
  isTechnicalDiagnostic?: boolean;
}

/**
 * Generates an email HTML template styled with Voice Flow 360 branding.
 * Ultra-modern responsive layout with high-contrast typography, brand accents,
 * featured survey cards, bonus rewards, social footer, and clean deliverability styling.
 */
export function buildBrandedEmailHtml(params: {
  headline: string;
  previewText?: string;
  bodyContent: string;
  actionUrl?: string;
  actionText?: string;
  recipientEmail?: string;
  recipientName?: string;
  subheadline?: string;
  badge?: string;
  bonusCoins?: number;
  featuredSurveys?: Array<{
    title: string;
    category?: string;
    rewardCoins: number;
    estimatedMinutes: number;
  }>;
  unsubscribeUrl?: string;
}): string {
  const {
    headline,
    previewText = 'Voice Flow 360 Survey & Community Alert',
    bodyContent,
    actionUrl,
    actionText = 'Take Surveys & Claim Coins',
    recipientEmail = '',
    recipientName = '',
    subheadline = 'Real-Time Consumer Opinions & Instant Rewards',
    badge = 'Voice Flow 360 Alert',
    bonusCoins = 0,
    featuredSurveys = [],
    unsubscribeUrl,
  } = params;

  // Enforce official production domain for all outgoing email links
  const safeActionUrl = ensureProductionUrl(actionUrl, '/surveys');
  const safeUnsubscribeUrl =
    unsubscribeUrl ||
    `${PRODUCTION_DOMAIN}/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

  // Format paragraphs into clean semantic HTML
  const formattedBody = bodyContent
    .split('\n\n')
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; line-height: 1.68; color: #334155; font-size: 15px; font-weight: 400;">${p.replace(
          /\n/g,
          '<br/>'
        )}</p>`
    )
    .join('');

  // Build bonus incentive banner if bonus coins are awarded
  const bonusBannerHtml =
    bonusCoins > 0
      ? `
    <div style="margin: 22px 0; padding: 16px 20px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1.5px solid #fde68a; border-radius: 14px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.08);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="36" style="vertical-align: middle; font-size: 26px;">⚡</td>
          <td style="vertical-align: middle; padding-left: 12px;">
            <div style="font-size: 11px; font-weight: 900; color: #92400e; text-transform: uppercase; letter-spacing: 0.8px;">
              Exclusive Earning Boost Active
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #78350f; margin-top: 2px;">
              Complete surveys today to earn an extra <span style="background-color: #d97706; color: #ffffff; padding: 3px 8px; border-radius: 6px; font-weight: 900;">+${bonusCoins} Bonus Coins</span> (~$${(
          bonusCoins / 100
        ).toFixed(2)} USD)!
            </div>
          </td>
        </tr>
      </table>
    </div>
  `
      : '';

  // Build featured surveys section if provided
  const surveysHtml =
    featuredSurveys.length > 0
      ? `
    <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
        <tr>
          <td style="vertical-align: middle;">
            <span style="font-size: 11px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.8px;">
              ⭐ Matched Opportunities For You
            </span>
          </td>
          <td align="right" style="vertical-align: middle;">
            <span style="font-size: 11px; font-weight: 800; color: #4338ca; background: #e0e7ff; padding: 4px 10px; border-radius: 9999px;">
              ${featuredSurveys.length} Available Now
            </span>
          </td>
        </tr>
      </table>

      ${featuredSurveys
        .map(
          (s) => `
        <a href="${safeActionUrl}" style="text-decoration: none; color: inherit; display: block; margin-bottom: 12px;">
          <div style="padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 0.5px; background-color: #eef2ff; padding: 3px 8px; border-radius: 6px; margin-bottom: 5px;">
                    ${(s.category || 'General').replace(/_/g, ' ')}
                  </span>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; line-height: 1.35;">
                    ${s.title}
                  </div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 5px; font-weight: 500;">
                    ⏱️ Estimated time: <strong>~${s.estimatedMinutes} mins</strong> &bull; Verified Brand Study &rarr;
                  </div>
                </td>
                <td align="right" style="vertical-align: middle; white-space: nowrap; padding-left: 14px;">
                  <div style="display: inline-block; background-color: #ecfdf5; color: #047857; padding: 8px 14px; border-radius: 12px; font-size: 13px; font-weight: 900; border: 1.5px solid #a7f3d0; text-align: center;">
                    +${s.rewardCoins} Coins
                    <div style="font-size: 10px; font-weight: 700; color: #059669;">≈ $${(s.rewardCoins / 100).toFixed(2)}</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </a>
      `
        )
        .join('')}
    </div>
  `
      : '';

  const effectiveUnsubscribeUrl =
    unsubscribeUrl ||
    `${actionUrl || 'https://voiceflow360.com'}/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${headline}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 600px; margin: 32px auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.06); border: 1px solid #e2e8f0; }
    .email-topbar { padding: 24px 28px 18px 28px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; }
    .email-header { background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%); padding: 28px 28px 20px 28px; text-align: left; border-bottom: 1px solid #f1f5f9; }
    .email-badge { display: inline-block; background-color: #eef2ff; border: 1px solid #c7d2fe; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; color: #4338ca; }
    .email-title { margin: 0; font-size: 25px; font-weight: 900; line-height: 1.25; color: #0f172a; letter-spacing: -0.5px; }
    .email-subtitle { margin: 8px 0 0 0; font-size: 14px; color: #64748b; font-weight: 500; line-height: 1.5; }
    .email-body { padding: 32px 28px; background-color: #ffffff; }
    .action-btn-container { text-align: center; margin: 32px 0 20px 0; }
    .action-btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 6px 20px rgba(79,70,229,0.3); letter-spacing: 0.2px; text-align: center; }
    .email-footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 24px; text-align: center; font-size: 12px; color: #64748b; }
    .footer-links a { color: #4338ca; text-decoration: none; margin: 0 8px; font-weight: 700; }
    @media only screen and (max-width: 600px) {
      .email-container { margin: 0 auto; border-radius: 0; border: none; }
      .email-topbar { padding: 18px 20px; }
      .email-header { padding: 22px 20px; }
      .email-body { padding: 22px 18px; }
      .email-title { font-size: 21px; }
      .action-btn { width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <!-- Preheader preview text for inbox snippet -->
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>

  <div class="email-container">
    <!-- Clean Branded Brand Bar -->
    <div class="email-topbar">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left" style="vertical-align: middle;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle;">
                  <span style="display: inline-block; width: 34px; height: 34px; line-height: 34px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-align: center; font-size: 15px; font-weight: 900; border-radius: 10px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.35);">
                    VF
                  </span>
                </td>
                <td style="vertical-align: middle; padding-left: 10px;">
                  <div style="font-size: 15px; font-weight: 900; color: #0f172a; letter-spacing: -0.2px; text-transform: uppercase;">
                    Voice Flow 360
                  </div>
                  <div style="font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">
                    Consumer Opinion &amp; Rewards Panel
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td align="right" style="vertical-align: middle;">
            <span style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
              Live Campaign
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Editorial Header -->
    <div class="email-header">
      <div class="email-badge">${badge}</div>
      <h1 class="email-title">${headline}</h1>
      <p class="email-subtitle">${subheadline}</p>
    </div>

    <!-- Main Body -->
    <div class="email-body">
      <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">
        ${recipientName ? `Hello ${recipientName},` : 'Hello Valued Member,'}
      </div>

      ${formattedBody}

      ${bonusBannerHtml}

      ${surveysHtml}

      ${
        safeActionUrl
          ? `
      <div class="action-btn-container">
        <a href="${safeActionUrl}" class="action-btn" target="_blank" rel="noopener noreferrer">
          ${actionText} &rarr;
        </a>
      </div>`
          : ''
      }

      <!-- Trust & Instant Settlement Callout -->
      <div style="margin-top: 24px; padding: 14px 18px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 10px; font-size: 12px; color: #475569; line-height: 1.55;">
        <strong style="color: #0f172a;">Voice Flow 360 Guarantee:</strong> Rewards transfer to your Redeemable Wallet on the 1st of each month following quality audits. Payouts are redeemable directly via Direct Bank Transfer or Cryptocurrency at a 2,000 Coins ($20.00 USD) minimum threshold.
      </div>
    </div>

    <!-- Compliant Footer -->
    <div class="email-footer">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>
        <strong style="color: #0f172a; font-size: 13px;">Voice Flow 360</strong>
        <span style="color: #cbd5e1; margin: 0 6px;">|</span>
        <span style="color: #64748b;">Global Consumer Opinion Network</span>
      </div>

      <p style="margin: 0 0 12px 0; line-height: 1.5;">
        This communication was delivered to ${recipientEmail ? `<strong>${recipientEmail}</strong>` : 'your email address'} because you are an active panel member or newsletter subscriber at Voice Flow 360.
      </p>

      <div class="footer-links" style="margin-bottom: 14px;">
        <a href="https://voiceflow360.com/surveys">Active Surveys</a> &bull;
        <a href="https://voiceflow360.com/my-earnings">My Wallet</a> &bull;
        <a href="https://voiceflow360.com/faq">Support FAQ</a> &bull;
        <a href="https://voiceflow360.com/privacy">Privacy Policy</a> &bull;
        <a href="${effectiveUnsubscribeUrl}" style="color: #dc2626;">Unsubscribe</a>
      </div>

      <p style="margin: 0; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Voice Flow 360 Inc. Fair, transparent compensation for real consumer feedback.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends a test email through cPanel SMTP.
 * By default sends the full, realistic branded survey blast template so you can inspect
 * the actual email experience in your inbox. Optionally supports technical diagnostic mode.
 */
export async function sendTestEmail(
  targetEmail: string,
  customOptions?: TestEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: 'SMTP credentials not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment settings.',
    };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'Voice Flow 360';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const { host } = getEffectiveSmtpHost();

  if (isUnroutableOrReservedEmail(targetEmail)) {
    return {
      success: false,
      error: 'Recipient domain is reserved for documentation (RFC 2606). Please enter your real email address (e.g. Gmail or business mailbox) to receive live test emails.',
    };
  }

  // If technical diagnostic requested:
  if (customOptions?.isTechnicalDiagnostic) {
    const diagnosticHtml = buildBrandedEmailHtml({
      headline: 'cPanel SMTP Relay Diagnostics',
      previewText: 'Success! Your SMTP mail relay is sending emails properly.',
      badge: 'SMTP Diagnostic Passed',
      subheadline: 'Automated Server Verification Message',
      bodyContent: `Great news! This test confirms that your cPanel SMTP mail server (${host}) is properly connected to Voice Flow 360.
      
All future survey alerts, platform release notices, and newsletter campaigns will be routed directly from your domain email address (${fromEmail}).
      
Delivery Timestamp: ${new Date().toUTCString()}
Server Host: ${host}
Sender Account: ${fromEmail}`,
      actionText: 'Open Voice Flow 360 Admin',
      actionUrl: 'https://voiceflow360.com/admin',
      recipientEmail: targetEmail,
    });

    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: targetEmail,
        subject: `[Diagnostic] Voice Flow 360 SMTP Connection Verified`,
        text: `Voice Flow 360 SMTP Test. Your email server at ${host} is working properly!`,
        html: diagnosticHtml,
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn('[sendTestEmail diagnostic notice]:', err?.message || err);
      return { success: false, error: formatSmtpError(err) };
    }
  }

  // Live Campaign Delivery (respects customOptions or active surveys)
  const headline = customOptions?.headline || 'Fresh Consumer Research Studies Waiting in Your Hub';
  const subject = customOptions?.subject || '2 New Paid Surveys Available: Earn Up to 430 Coins Today!';
  const previewText = customOptions?.previewText || 'Exclusive brand feedback studies are live now with instant cashout credits.';
  const bodyContent = customOptions?.bodyContent ||
    'Top consumer brands want to hear your authentic voice! We have unlocked new conversational surveys tailored for your profile. Share your thoughts and receive instant coin credits redeemable for real cash payouts.';
  const actionText = customOptions?.actionText || 'Take Surveys & Claim Coins';
  const actionUrl = ensureProductionUrl(customOptions?.actionUrl, '/surveys');
  const bonusCoins = customOptions?.bonusCoins !== undefined ? customOptions.bonusCoins : 50;
  const badge = customOptions?.badge || 'New Survey Alert';
  const subheadline = customOptions?.subheadline || 'Matched Research Opportunities & Instant Credits';
  const featuredSurveys = customOptions?.featuredSurveys && customOptions.featuredSurveys.length > 0
    ? customOptions.featuredSurveys
    : [
        {
          title: 'AI & Next-Gen Smart Home Devices Survey',
          category: 'Technology',
          rewardCoins: 250,
          estimatedMinutes: 8,
        },
        {
          title: 'Global Streaming & Entertainment Preferences Study',
          category: 'Entertainment',
          rewardCoins: 180,
          estimatedMinutes: 6,
        },
      ];

  const html = buildBrandedEmailHtml({
    headline,
    previewText,
    badge,
    subheadline,
    bodyContent,
    actionText,
    actionUrl,
    bonusCoins,
    featuredSurveys,
    recipientEmail: targetEmail,
    recipientName: customOptions?.recipientName,
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: targetEmail,
      subject,
      text: `${headline}\n\n${bodyContent}\n\nStart surveys: ${actionUrl}`,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.warn('[sendTestEmail notice]:', err?.message || err);
    return {
      success: false,
      error: formatSmtpError(err),
    };
  }
}

/**
 * Sends a welcome email to a new subscriber
 */
export async function sendWelcomeSubscriberEmail(
  subscriberEmail: string,
  preferences?: { newSurveys?: boolean; platformUpdates?: boolean; weeklyDigest?: boolean }
): Promise<{ success: boolean; message?: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    // If SMTP is not yet configured, return silently without failing
    return { success: false, message: 'SMTP not configured' };
  }

  if (isUnroutableOrReservedEmail(subscriberEmail)) {
    return { success: true, message: 'Subscriber saved (mock/reserved email bypassed live SMTP)' };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'Voice Flow 360';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const html = buildBrandedEmailHtml({
    headline: 'Welcome to Voice Flow 360 Alerts!',
    previewText: "You're now subscribed to high-yield survey alerts and platform updates.",
    badge: 'Subscription Confirmed',
    subheadline: 'Real-Time Earning Alerts',
    bodyContent: `Thank you for subscribing to Voice Flow 360 survey alerts!
    
You are now in line to receive priority notices whenever new brand questionnaires launch (earn up to 500 coins per questionnaire).
    
Your active alert preferences:
• New Survey Alerts: ${preferences?.newSurveys !== false ? 'Enabled' : 'Disabled'}
• Platform Updates & Bonus Codes: ${preferences?.platformUpdates !== false ? 'Enabled' : 'Disabled'}
• Weekly Digest: ${preferences?.weeklyDigest ? 'Enabled' : 'Disabled'}
    
You can explore open questionnaires anytime directly on our website.`,
    actionText: 'Explore Available Surveys',
    actionUrl: 'https://voiceflow360.com/surveys',
    recipientEmail: subscriberEmail,
  });

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: subscriberEmail,
      subject: `Welcome to Voice Flow 360 — Survey Alerts Activated!`,
      text: `Welcome to Voice Flow 360! You are subscribed to survey alerts and platform updates. Visit https://voiceflow360.com/surveys to start earning.`,
      html,
    });
    return { success: true };
  } catch (err: any) {
    console.warn('[sendWelcomeSubscriberEmail notice]:', err?.message);
    return { success: false, message: err?.message };
  }
}

/**
 * Sends an email campaign to multiple recipients with rate-limiting to prevent cPanel blocks
 */
export async function sendBatchCampaign(payload: BatchSendPayload): Promise<BatchSendResult> {
  const {
    recipients,
    subject,
    htmlContent,
    textContent,
    campaignTitle,
    actionUrl,
    actionText,
    badge,
    subheadline,
    bonusCoins,
    featuredSurveys,
  } = payload;

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      total: recipients.length,
      sent: 0,
      failed: recipients.length,
      errors: [{ email: 'system', error: 'SMTP credentials missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.' }],
      message: 'SMTP credentials missing. Please configure cPanel email credentials.',
    };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'Voice Flow 360';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  let sent = 0;
  let failed = 0;
  let bypassedMock = 0;
  const errors: Array<{ email: string; error: string }> = [];

  const safeActionUrl = ensureProductionUrl(actionUrl, '/surveys');

  // Send sequentially with a 120ms pause between emails to respect cPanel rate-limiting
  for (const recipient of recipients) {
    if (!recipient.email || isUnroutableOrReservedEmail(recipient.email)) {
      bypassedMock += 1;
      console.log(`[SMTP sendBatchCampaign] Safely bypassed reserved RFC 2606 / guest recipient: ${recipient.email}`);
      continue;
    }

    try {
      const emailHtml = buildBrandedEmailHtml({
        headline: campaignTitle || subject,
        previewText: subject,
        bodyContent: htmlContent,
        actionUrl: safeActionUrl,
        actionText: actionText || 'Open in Voice Flow 360',
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        subheadline: subheadline || 'Voice Flow 360 Community Alert',
        badge: badge || 'New Survey Alert',
        bonusCoins,
        featuredSurveys,
      });

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient.name ? `"${recipient.name}" <${recipient.email}>` : recipient.email,
        subject,
        text: textContent || htmlContent.replace(/<[^>]+>/g, ' '),
        html: emailHtml,
      });

      sent += 1;
    } catch (err: any) {
      failed += 1;
      errors.push({
        email: recipient.email,
        error: formatSmtpError(err),
      });
      console.warn(`[SMTP sendBatchCampaign] Delivery notice for ${recipient.email}:`, err?.message);
    }

    // Small delay to protect cPanel SMTP rate limits
    if (recipients.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  const summaryMsg = bypassedMock > 0
    ? `Dispatched ${sent} emails via cPanel SMTP (${bypassedMock} documentation/guest recipients bypassed safely).`
    : `Dispatched ${sent} of ${recipients.length} emails through cPanel SMTP (${failed} failed).`;

  return {
    success: sent > 0 || (recipients.length > 0 && failed === 0),
    total: recipients.length,
    sent,
    failed,
    errors,
    message: summaryMsg,
  };
}

/**
 * Sends an email directly to a single customer
 */
export async function sendSingleCustomerEmail(
  payload: SingleCustomerEmailPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    toEmail,
    recipientName,
    subject,
    messageContent,
    actionUrl,
    actionText,
    headline,
    badge,
    bonusCoins,
    featuredSurveys,
  } = payload;

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: 'SMTP credentials not configured. Please verify SMTP_HOST, SMTP_USER, and SMTP_PASS in environment settings.',
    };
  }

  if (isUnroutableOrReservedEmail(toEmail)) {
    console.log(`[sendSingleCustomerEmail] Bypassed real SMTP for RFC 2606 / mock address: ${toEmail}`);
    return {
      success: true,
      messageId: `mock-doc-${Date.now()}`,
    };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'Voice Flow 360';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const safeActionUrl = ensureProductionUrl(actionUrl, '/surveys');

  const emailHtml = buildBrandedEmailHtml({
    headline: headline || subject,
    previewText: subject,
    bodyContent: messageContent,
    actionUrl: safeActionUrl,
    actionText: actionText || 'Open Voice Flow 360',
    recipientEmail: toEmail,
    recipientName,
    subheadline: 'Direct Customer Notification',
    badge: badge || 'Direct Message',
    bonusCoins,
    featuredSurveys,
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientName ? `"${recipientName}" <${toEmail}>` : toEmail,
      subject,
      text: messageContent.replace(/<[^>]+>/g, ' '),
      html: emailHtml,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.warn(`[sendSingleCustomerEmail notice] Delivery issue for ${toEmail}:`, err?.message || err);
    return {
      success: false,
      error: formatSmtpError(err),
    };
  }
}
