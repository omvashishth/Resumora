/**
 * Resumora Device & IP Fingerprinting Engine
 * Generates a tamper-resistant hardware and network fingerprint to prevent trial abuse,
 * multi-account bypasses, and incognito export resets.
 */

export interface DeviceNetworkIdentity {
  ip: string;
  ipHash: string;
  deviceFingerprint: string;
  compositeFingerprint: string;
}

let cachedIdentity: DeviceNetworkIdentity | null = null;

/**
 * Computes a fast SHA-256 string hash using standard Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes a deterministic hardware canvas & environment fingerprint.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Resumora-AntiAbuse-Lock-2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Resumora-AntiAbuse-Lock-2026', 4, 17);

    return canvas.toDataURL();
  } catch {
    return 'canvas-blocked';
  }
}

/**
 * Collects stable hardware and browser attributes.
 */
function getHardwareAttributes(): string {
  const nav = typeof navigator !== 'undefined' ? navigator : ({} as any);
  const screenObj = typeof screen !== 'undefined' ? screen : ({} as any);

  const components = [
    nav.userAgent || '',
    nav.language || '',
    nav.hardwareConcurrency || '0',
    (nav as any).deviceMemory || '0',
    screenObj.width || '0',
    screenObj.height || '0',
    screenObj.colorDepth || '0',
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    getCanvasFingerprint(),
  ];

  return components.join('###');
}

/**
 * Resolves the client's public IP address with multiple fallbacks.
 */
async function fetchPublicIP(): Promise<string> {
  const ipEndpoints = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
    'https://cloudflare.com/cdn-cgi/trace',
  ];

  for (const endpoint of ipEndpoints) {
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (!res.ok) continue;

      if (endpoint.includes('cloudflare')) {
        const text = await res.text();
        const ipLine = text.split('\n').find((l) => l.startsWith('ip='));
        if (ipLine) {
          const ip = ipLine.split('=')[1].trim();
          if (ip) return ip;
        }
      } else {
        const data = await res.json();
        if (data.ip) return data.ip;
      }
    } catch {
      // Try next endpoint
    }
  }

  // Fallback if network lookup is blocked
  return 'local-network-client';
}

/**
 * Returns the verified Device and IP Identity.
 */
export async function getDeviceNetworkIdentity(): Promise<DeviceNetworkIdentity> {
  if (cachedIdentity) {
    return cachedIdentity;
  }

  const rawIp = await fetchPublicIP();
  const rawHardware = getHardwareAttributes();

  const ipHash = await sha256(`resumora_ip_salt_${rawIp}`);
  const deviceFingerprint = await sha256(`resumora_hw_salt_${rawHardware}`);
  const compositeFingerprint = await sha256(`${ipHash}_${deviceFingerprint}`);

  cachedIdentity = {
    ip: rawIp,
    ipHash,
    deviceFingerprint,
    compositeFingerprint,
  };

  return cachedIdentity;
}
