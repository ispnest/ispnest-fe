import { DOCUMENT, inject, Injectable, InjectionToken, computed } from '@angular/core';

/**
 * Apex domains that the platform serves. The hostname of the current request is matched
 * against these to decide whether the user is on the platform apex (e.g. {@code ispnest.com})
 * or on a tenant subdomain (e.g. {@code acme.ispnest.com}).
 *
 * &lt;p>Mirrors {@code identity.apex-domains} on the backend (see {@code IdentityProperties}).
 */
export const APEX_DOMAINS = new InjectionToken<string[]>('APEX_DOMAINS', {
  providedIn: 'root',
  factory: () => ['ispnest.com', 'localhost'],
});

const SLUG_PATTERN = /^[a-z][a-z0-9-]{0,62}$/;

/**
 * Resolves whether the current request is on the platform apex or on a tenant subdomain.
 *
 * &lt;p>Single source of truth for {@code apexOnlyGuard}, {@code tenantOnlyGuard} and components
 * that need to render different content per-host (e.g. the landing nav hides "Sign in" on the
 * apex per Business Requirement #5).
 *
 * &lt;p>Reads {@code DOCUMENT.location.hostname} which is available in both the browser and the
 * Angular SSR runtime (the server engine populates {@code DOCUMENT.location} from the incoming
 * request URL).
 */
@Injectable({ providedIn: 'root' })
export class TenantScopeService {
  private readonly apexes = inject(APEX_DOMAINS);
  private readonly doc = inject(DOCUMENT);

  /** Lower-cased hostname without port. */
  readonly hostname = computed(() => this.resolveHostname());

  /** {@code null} when the request is on the apex; otherwise the validated subdomain slug. */
  readonly tenantSlug = computed<string | null>(() => this.parseSlug(this.hostname()));

  /** True when on a configured apex (e.g. ispnest.com, localhost). */
  readonly isApex = computed(() => this.tenantSlug() === null && this.hostMatchesAnyApex());

  /** True when on a tenant subdomain with a valid slug. */
  readonly isTenant = computed(() => this.tenantSlug() !== null);

  private resolveHostname(): string {
    const raw = this.doc?.location?.hostname ?? '';
    const noPort = raw.split(':')[0];
    return noPort.toLowerCase();
  }

  private hostMatchesAnyApex(): boolean {
    const host = this.hostname();
    return this.apexes.some((a) => host === a.toLowerCase());
  }

  private parseSlug(host: string): string | null {
    if (!host) return null;
    for (const apex of this.apexes) {
      const a = apex.toLowerCase();
      const suffix = '.' + a;
      if (host === a) return null;
      if (host.endsWith(suffix)) {
        const candidate = host.slice(0, host.length - suffix.length);
        if (SLUG_PATTERN.test(candidate) && !candidate.includes('.')) {
          return candidate;
        }
        return null;
      }
    }
    return null;
  }
}
