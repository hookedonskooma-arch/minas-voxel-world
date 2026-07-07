/**
 * Network Isolation Guard
 * 
 * Ensures VoxelCanvas NEVER connects to Minecraft/Mojang/Microsoft servers
 * or any external game service. The voxel engine is fully self-contained —
 * terrain generation, physics, and rendering all happen client-side.
 * 
 * This module:
 * 1. Monkey-patches fetch() and WebSocket to block disallowed domains
 * 2. Provides a runtime audit log of all network attempts
 * 3. Exposes a verification function for the parent dashboard
 */

export interface NetworkAttempt {
  id: number;
  timestamp: number;
  type: 'fetch' | 'websocket' | 'xhr';
  url: string;
  blocked: boolean;
  reason: string;
}

export interface IsolationReport {
  isIsolated: boolean;
  totalAttempts: number;
  blockedAttempts: number;
  allowedDomains: string[];
  blockedDomains: string[];
  attempts: NetworkAttempt[];
}

// Domains that must NEVER be contacted
const BLOCKED_DOMAINS = [
  'minecraft.net',
  'mojang.com',
  'microsoft.com',
  'xboxlive.com',
  'sessionserver.mojang.com',
  'api.mojang.com',
  'textures.minecraft.net',
  'libraries.minecraft.net',
  'launcher.mojang.com',
  'piston-meta.mojang.com',
  'account.mojang.com',
  'authserver.mojang.com',
  'realms.minecraft.net',
  'mco-api.minecraft.net',
  'api.minecraftservices.net',
];

// Only these domains are allowed (local dev + Supabase + Stiki SSO)
let allowedDomains: string[] = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
];

const attemptLog: NetworkAttempt[] = [];
let attemptIdCounter = 0;
let guardInstalled = false;

function extractDomain(url: string): string {
  try {
    const u = new URL(url, window.location.origin);
    return u.hostname;
  } catch {
    return url;
  }
}

function isAllowed(url: string): { allowed: boolean; reason: string } {
  const domain = extractDomain(url);

  // Check if domain is in the blocked list
  for (const blocked of BLOCKED_DOMAINS) {
    if (domain === blocked || domain.endsWith('.' + blocked)) {
      return { allowed: false, reason: `BLOCKED: ${domain} is in Minecraft/Mojang blocklist` };
    }
  }

  // Check if domain is in the allowed list
  for (const allowed of allowedDomains) {
    if (domain === allowed || domain.endsWith('.' + allowed)) {
      return { allowed: true, reason: `ALLOWED: ${domain} is in allowlist` };
    }
  }

  // Unknown domain — block by default in isolated mode
  return { allowed: false, reason: `BLOCKED: ${domain} is not in allowlist (isolation mode)` };
}

function logAttempt(type: NetworkAttempt['type'], url: string, blocked: boolean, reason: string): void {
  attemptLog.unshift({
    id: ++attemptIdCounter,
    timestamp: Date.now(),
    type,
    url,
    blocked,
    reason,
  });
  // Keep last 100 attempts
  if (attemptLog.length > 100) attemptLog.length = 100;
}

/**
 * Install the network isolation guard.
 * Patches fetch(), WebSocket, and XMLHttpRequest to intercept
 * all outbound connections and block disallowed domains.
 */
export function installNetworkGuard(customAllowedDomains?: string[]): void {
  if (guardInstalled) return;
  if (customAllowedDomains) {
    allowedDomains = [...allowedDomains, ...customAllowedDomains];
  }

  // --- Patch fetch ---
  const origFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const { allowed, reason } = isAllowed(url);
    logAttempt('fetch', url, !allowed, reason);
    if (!allowed) {
      return Promise.reject(new Error(`[VoxelCanvas Network Guard] ${reason}`));
    }
    return origFetch.call(this, input, init);
  };

  // --- Patch WebSocket ---
  const OrigWebSocket = window.WebSocket;
  const PatchedWebSocket = function (url: string | URL, protocols?: string | string[]) {
    const urlStr = typeof url === 'string' ? url : url.toString();
    const { allowed, reason } = isAllowed(urlStr);
    logAttempt('websocket', urlStr, !allowed, reason);
    if (!allowed) {
      throw new Error(`[VoxelCanvas Network Guard] ${reason}`);
    }
    return new OrigWebSocket(urlStr, protocols);
  } as any;
  PatchedWebSocket.prototype = OrigWebSocket.prototype;
  PatchedWebSocket.CONNECTING = OrigWebSocket.CONNECTING;
  PatchedWebSocket.OPEN = OrigWebSocket.OPEN;
  PatchedWebSocket.CLOSING = OrigWebSocket.CLOSING;
  PatchedWebSocket.CLOSED = OrigWebSocket.CLOSED;
  window.WebSocket = PatchedWebSocket;

  // --- Patch XMLHttpRequest ---
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method: string, url: string, ...rest: any[]) {
    const { allowed, reason } = isAllowed(url);
    logAttempt('xhr', url, !allowed, reason);
    if (!allowed) {
      // Defer the throw to the send() call
      (this as any).__networkGuardBlocked = reason;
    }
    return (origOpen as any).call(this, method, url, ...rest);
  };

  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args: any[]) {
    if ((this as any).__networkGuardBlocked) {
      // Simulate a network error
      Object.defineProperty(this, 'status', { value: 0 });
      Object.defineProperty(this, 'readyState', { value: 4 });
      setTimeout(() => {
        if (typeof (this as any).onerror === 'function') {
          (this as any).onerror(new Event('error') as any);
        }
        this.dispatchEvent(new Event('error'));
      }, 0);
      return;
    }
    return (origSend as any).call(this, ...args);
  };

  guardInstalled = true;
  console.info('[VoxelCanvas Network Guard] Installed — isolation mode active');
}

/**
 * Get a report of all network attempts for the parent dashboard.
 */
export function getIsolationReport(): IsolationReport {
  return {
    isIsolated: guardInstalled,
    totalAttempts: attemptLog.length,
    blockedAttempts: attemptLog.filter((a) => a.blocked).length,
    allowedDomains: [...allowedDomains],
    blockedDomains: [...BLOCKED_DOMAINS],
    attempts: [...attemptLog],
  };
}

/**
 * Verify that no Minecraft/Mojang domains have been contacted.
 * Returns true if the guard is active and no blocked domains were reached.
 */
export function verifyIsolation(): { verified: boolean; message: string } {
  if (!guardInstalled) {
    return { verified: false, message: 'Network guard is not installed' };
  }
  const blocked = attemptLog.filter((a) => a.blocked && a.reason.includes('Minecraft'));
  if (blocked.length > 0) {
    return {
      verified: false,
      message: `${blocked.length} Minecraft server connection attempt(s) were blocked`,
    };
  }
  return {
    verified: true,
    message: 'No Minecraft/Mojang servers contacted — fully isolated',
  };
}

/**
 * Get the list of blocked domains for display.
 */
export function getBlockedDomains(): string[] {
  return [...BLOCKED_DOMAINS];
}

/**
 * Add an allowed domain (e.g., Supabase project URL).
 */
export function addAllowedDomain(domain: string): void {
  if (!allowedDomains.includes(domain)) {
    allowedDomains.push(domain);
  }
}