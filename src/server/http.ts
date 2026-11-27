import { isIP } from 'node:net';

export const MAX_BODY_BYTES = 256 * 1024;

const extractHostname = (hostHeader: string): string => {
  const trimmed = hostHeader.trim().toLowerCase();
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']');
    return end > 0 ? trimmed.slice(1, end) : trimmed;
  }
  const colon = trimmed.lastIndexOf(':');
  return colon > 0 ? trimmed.slice(0, colon) : trimmed;
};

export type AllowedHostsOption = true | readonly string[];

const normalizeHostForProtocol = (hostHeader: string, protocol: string): string => {
  const first = hostHeader.split(',')[0]?.trim().toLowerCase() ?? '';
  if (protocol === 'https:' && first.endsWith(':443')) {
    return first.slice(0, -4);
  }
  if (protocol === 'http:' && first.endsWith(':80')) {
    return first.slice(0, -3);
  }
  return first;
};

export const isAllowedHost = (
  hostHeader: string | undefined,
  allowedHosts: AllowedHostsOption = [],
): boolean => {
  if (!hostHeader) {
    return false;
  }

  if (allowedHosts === true) {
    return true;
  }

  const hostname = extractHostname(hostHeader);
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || isIP(hostname) !== 0) {
    return true;
  }

  return allowedHosts.some((entry) => {
    const normalized = entry.trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    if (normalized.startsWith('.')) {
      return hostname.endsWith(normalized) || hostname === normalized.slice(1);
    }
    return hostname === normalized;
  });
};

export const isAllowedOrigin = (
  req: {
    method?: string;
    headers: { host?: string; origin?: string; 'x-forwarded-host'?: string };
  },
  allowedHosts: AllowedHostsOption = [],
): boolean => {
  const method = (req.method ?? 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const host = req.headers.host?.trim().toLowerCase();
  const forwardedHost = req.headers['x-forwarded-host']?.trim().toLowerCase();
  const origin = req.headers.origin?.trim();
  if (!host || !origin) {
    return false;
  }

  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const originHost = parsed.host.toLowerCase();
    if (originHost === normalizeHostForProtocol(host, parsed.protocol)) {
      return true;
    }
    if (
      forwardedHost &&
      originHost === normalizeHostForProtocol(forwardedHost, parsed.protocol) &&
      isAllowedHost(forwardedHost.split(',')[0], allowedHosts)
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
