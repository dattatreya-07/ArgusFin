const SSRF_BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '::',
  '169.254.169.254',
  'metadata.google.internal',
]);

const PRIVATE_IP_PATTERNS = [
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // Loopback
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0/12
  /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.0.0/16
  /^169\.254\.\d{1,3}\.\d{1,3}$/, // Link-local
  /^0\./, // 0.0.0.0/8
];

const PRIVATE_TLD_PATTERNS = [
  /\.local$/i,
  /\.internal$/i,
  /\.lan$/i,
  /\.localhost$/i,
  /\.test$/i,
];

export function isSsrfTarget(hostname: string, scheme: string = 'https'): boolean {
  if (!hostname || typeof hostname !== 'string') return true;

  const cleanScheme = scheme.toLowerCase().replace(':', '');
  if (cleanScheme !== 'http' && cleanScheme !== 'https') {
    return true; // Block file://, ftp://, gopher://, etc.
  }

  const cleanHost = hostname.toLowerCase().trim().replace(/\[|\]/g, '');

  if (SSRF_BLOCKED_HOSTNAMES.has(cleanHost)) {
    return true;
  }

  if (PRIVATE_IP_PATTERNS.some((pat) => pat.test(cleanHost))) {
    return true;
  }

  if (PRIVATE_TLD_PATTERNS.some((pat) => pat.test(cleanHost))) {
    return true;
  }

  // Decimal/Hex IP representations check
  if (/^\d+$/.test(cleanHost) || /^0x[0-9a-f]+$/i.test(cleanHost)) {
    return true;
  }

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:10.0.0.1)
  if (cleanHost.includes('::ffff:')) {
    const extractedIp = cleanHost.split('::ffff:')[1];
    if (extractedIp && PRIVATE_IP_PATTERNS.some((pat) => pat.test(extractedIp))) {
      return true;
    }
  }

  return false;
}
