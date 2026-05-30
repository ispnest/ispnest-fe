/**
 * Pool CIDR maths shared by the pools form and the onboarding wizard's pools mini-editor.
 * Pure functions only — no Angular / DOM imports.
 */

export function numToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

/**
 * Given a network IPv4 (e.g. "10.10.10.0", "10.10.10.*") and a CIDR prefix length,
 * compute the usable local gateway IP (network + 1) and the canonical CIDR range
 * ("&lt;localIp>/&lt;cidr>"). Returns null if the inputs don't form a valid subnet that
 * leaves at least one usable host.
 */
export function computePool(
  rawIp: string,
  cidr: number,
): { localIp: string; range: string } | null {
  if (!rawIp || isNaN(cidr) || cidr < 1 || cidr > 30) return null;
  const ip = rawIp.replace(/\*/g, '0');
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  const ipNum = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const localIp = (network + 1) >>> 0;
  const rangeEnd = (broadcast - 1) >>> 0;
  if (localIp > rangeEnd) return null;
  const localIpText = numToIp(localIp);
  return { localIp: localIpText, range: `${localIpText}/${cidr}` };
}

export const CIDR_OPTIONS = [
  { value: 30, label: '/30 — 2 hosts' },
  { value: 29, label: '/29 — 6 hosts' },
  { value: 28, label: '/28 — 14 hosts' },
  { value: 27, label: '/27 — 30 hosts' },
  { value: 26, label: '/26 — 62 hosts' },
  { value: 25, label: '/25 — 126 hosts' },
  { value: 24, label: '/24 — 254 hosts' },
  { value: 23, label: '/23 — 510 hosts' },
  { value: 22, label: '/22 — 1022 hosts' },
  { value: 21, label: '/21 — 2046 hosts' },
  { value: 20, label: '/20 — 4094 hosts' },
  { value: 16, label: '/16 — 65534 hosts' },
];
