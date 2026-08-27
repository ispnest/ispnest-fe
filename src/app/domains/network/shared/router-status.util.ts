/**
 * Shared router-status display logic — used by both the routers list and the onboarding hub, so the
 * two pages never drift on what a given `RouterManagementState.state` value means visually.
 *
 * A router spends real time in NEW/ENROLLING/BOOTSTRAPPING/VERIFYING/RECONCILING before it's ever
 * actually reachable — showing a plain online/offline badge for those states would be misleading
 * (there's nothing to be "online" yet). `combinedRouterStatus` picks the onboarding-stage label pre-
 * `ONBOARDED`, and only falls back to the router's real reachability status (the legacy `status`
 * field, `RouterDto.status`) once onboarding has actually reached a state where that field means
 * something.
 */
export const MANAGEMENT_STATE_HUE: Record<string, string> = {
  ONBOARDED: 'green',
  SYNCED: 'green',
  NEW: 'neutral',
  ENROLLING: 'amber',
  BOOTSTRAPPING: 'amber',
  VERIFYING: 'amber',
  RECONCILING: 'amber',
  OUT_OF_SYNC: 'amber',
  REONBOARDING: 'amber',
  ONBOARDING_FAILED: 'red',
  DEGRADED: 'red',
  UNREACHABLE: 'red',
  DECOMMISSIONED: 'neutral',
};

/**
 * States at/past which the router has (or has had) its own REST API credential and a real
 * reachability signal is meaningful — before this, "online"/"offline" has no basis.
 */
export const REACHABILITY_READY_STATES = new Set([
  'ONBOARDED',
  'SYNCED',
  'OUT_OF_SYNC',
  'DEGRADED',
]);

export type RouterStatusBadge = { label: string; hue: string };

/**
 * `managementState` is null on responses that don't populate it (e.g. `RouterApiService.getById`)
 * — treated the same as `'NEW'`, since a router with no known management state hasn't onboarded.
 */
export function combinedRouterStatus(
  managementState: string | null,
  legacyStatus: string,
): RouterStatusBadge {
  const state = managementState ?? 'NEW';
  if (!REACHABILITY_READY_STATES.has(state)) {
    return { label: state, hue: MANAGEMENT_STATE_HUE[state] ?? 'neutral' };
  }
  const online = legacyStatus?.toLowerCase() === 'online';
  return { label: legacyStatus, hue: online ? 'green' : 'red' };
}

export function badgeClassFor(hue: string): string {
  return `bg-${hue}-a3 text-${hue}-a11`;
}

/**
 * States reached only after a router has completed onboarding at least once — before this, there's
 * no REST API credential yet, so there's nothing on the router to configure or discover against.
 */
export const ONBOARDED_STATES = new Set([
  'ONBOARDED',
  'RECONCILING',
  'SYNCED',
  'OUT_OF_SYNC',
  'DEGRADED',
  'UNREACHABLE',
]);

/**
 * Of the onboarded states, which ones mean the router is presumed reachable right now, so live
 * discovery (interfaces/VLANs/pool-overlap) should actually work. `UNREACHABLE` is the one
 * onboarded state that specifically means the platform's last attempt to reach the router over its
 * management channel failed outright — `DEGRADED`, by contrast, is only reached from a
 * reconciliation pass that DID connect (some domain writes failed, not the connection itself), so
 * it still counts as reachable here.
 */
export const REACHABLE_ONBOARDED_STATES = new Set([
  'ONBOARDED',
  'RECONCILING',
  'SYNCED',
  'OUT_OF_SYNC',
  'DEGRADED',
]);

export type ProvisioningAccess = { allowed: false } | { allowed: true; reachable: boolean };

/**
 * Gates the provisioning-profile UI (services/topology/pools): not allowed at all until the router
 * has completed onboarding at least once; allowed-but-flagged (`reachable: false`) when onboarded
 * but the platform's last signal says it's `UNREACHABLE` — live discovery will degrade to manual
 * entry there, so the caller should show a cross-check warning rather than trusting it silently.
 */
export function provisioningAccessFor(managementState: string | null): ProvisioningAccess {
  const state = managementState ?? 'NEW';
  if (!ONBOARDED_STATES.has(state)) {
    return { allowed: false };
  }
  return { allowed: true, reachable: REACHABLE_ONBOARDED_STATES.has(state) };
}
