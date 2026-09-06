import { RouterDto } from './network.model';

/** A router counts as online when its status is 'online' or 'active' (case-insensitive). */
export function isRouterOnline(router: RouterDto): boolean {
  const status = router.status?.toLowerCase() ?? '';
  return status === 'online' || status === 'active';
}

/**
 * Summarizes offline routers as "up to two names, plus a '+N more' tail", falling back to a
 * count-only message when no offline routers are present in `routers` (e.g. because `routers`
 * is only a partial page and the authoritative `count` comes from elsewhere).
 * @param routers The routers available on the client — may be a partial list.
 * @param count Authoritative offline count, if it can differ from `routers`' own count (e.g. a
 * composite KPI endpoint that sees the whole fleet). Defaults to counting `routers` itself.
 * @returns Empty string when nothing is offline.
 */
export function summarizeOfflineRouters(routers: RouterDto[], count?: number): string {
  const offline = routers.filter((r) => !isRouterOnline(r));
  const total = count ?? offline.length;
  if (offline.length === 0) return total > 0 ? `${total} unreachable` : '';
  const shown = offline.slice(0, 2).map((r) => r.name);
  const remaining = total - shown.length;
  return remaining > 0 ? `${shown.join(', ')} +${remaining} more` : shown.join(', ');
}
