/**
 * Client IP capture utility
 * Resilient multi-tier IP detection:
 * 1. Internal Express server endpoint (/api/client-ip)
 * 2. High-speed public CDN / IP reflection endpoints (Cloudflare trace, ip.sb, httpbin, ipify)
 * 3. Browser WebRTC STUN candidate discovery via Google STUN (bypasses ad-blockers)
 */

let cachedDeviceIp: string | null = null;
let activeFetchPromise: Promise<string> | null = null;

function isValidIp(ip: unknown): ip is string {
  if (typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  if (!trimmed || trimmed === 'Unknown IP' || trimmed === '127.0.0.1' || trimmed === '::1') {
    return false;
  }
  // IPv4 pattern
  const isIpv4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(trimmed);
  // IPv6 pattern
  const isIpv6 = /^[0-9a-fA-F:]+$/.test(trimmed) && trimmed.includes(':');
  return isIpv4 || isIpv6;
}

// Fallback WebRTC STUN resolution in browser
async function getWebRtcIp(): Promise<string | null> {
  if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
    return null;
  }
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => resolve(null));

      const timer = setTimeout(() => {
        try { pc.close(); } catch { /* ignore */ }
        resolve(null);
      }, 2500);

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate || !event.candidate.candidate) return;
        const rawCandidate = event.candidate.candidate;
        // Regex to extract candidate IP
        const match = rawCandidate.match(/([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})/i);
        if (match && match[1]) {
          const candidateIp = match[1].trim();
          // Filter private subnets
          if (
            !candidateIp.startsWith('10.') &&
            !candidateIp.startsWith('192.168.') &&
            !candidateIp.startsWith('172.16.') &&
            !candidateIp.startsWith('127.')
          ) {
            clearTimeout(timer);
            try { pc.close(); } catch { /* ignore */ }
            resolve(candidateIp);
          }
        }
      };
    } catch {
      resolve(null);
    }
  });
}

// Fetch with timeout helper
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function getDeviceIp(): Promise<string> {
  if (cachedDeviceIp && isValidIp(cachedDeviceIp)) {
    return cachedDeviceIp;
  }

  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    // 1. Primary: Internal Express server endpoint
    try {
      const res = await fetchWithTimeout('/api/client-ip', 3000);
      if (res.ok) {
        const data = await res.json();
        if (isValidIp(data.ip)) {
          cachedDeviceIp = data.ip.trim();
          return cachedDeviceIp;
        }
      }
    } catch {
      // Continue to secondary mirrors
    }

    // 2. High-speed Public IP Resolvers (tried in parallel with Promise.any)
    const publicResolvers: Array<() => Promise<string>> = [
      // Cloudflare Edge trace
      async () => {
        const res = await fetchWithTimeout('https://cloudflare.com/cdn-cgi/trace', 3000);
        const text = await res.text();
        const match = text.match(/ip=([^\n]+)/);
        if (match && isValidIp(match[1])) {
          return match[1].trim();
        }
        throw new Error('No IP in trace');
      },
      // ip.sb (Ultra-fast worldwide CDN)
      async () => {
        const res = await fetchWithTimeout('https://api.ip.sb/jsonip', 3000);
        const data = await res.json();
        if (isValidIp(data.ip)) {
          return data.ip.trim();
        }
        throw new Error('Invalid IP from ip.sb');
      },
      // Httpbin IP
      async () => {
        const res = await fetchWithTimeout('https://httpbin.org/ip', 3000);
        const data = await res.json();
        const origin = (data.origin || '').split(',')[0].trim();
        if (isValidIp(origin)) {
          return origin;
        }
        throw new Error('Invalid IP from httpbin');
      },
      // ipify API
      async () => {
        const res = await fetchWithTimeout('https://api.ipify.org?format=json', 3500);
        const data = await res.json();
        if (isValidIp(data.ip)) {
          return data.ip.trim();
        }
        throw new Error('Invalid IP from ipify');
      },
    ];

    try {
      const publicIp = await Promise.any(publicResolvers.map((fn) => fn()));
      if (isValidIp(publicIp)) {
        cachedDeviceIp = publicIp;
        return cachedDeviceIp;
      }
    } catch {
      // All public HTTP mirrors timed out or were blocked
    }

    // 3. WebRTC STUN Resolver (Bypasses ad-blockers and browser HTTP blocks)
    try {
      const rtcIp = await getWebRtcIp();
      if (isValidIp(rtcIp)) {
        cachedDeviceIp = rtcIp;
        return cachedDeviceIp;
      }
    } catch {
      // WebRTC not supported or blocked
    }

    // 4. If everything fails, return Unknown IP without caching so future attempts can retry
    return 'Unknown IP';
  })();

  try {
    const result = await activeFetchPromise;
    return result;
  } finally {
    activeFetchPromise = null;
  }
}

