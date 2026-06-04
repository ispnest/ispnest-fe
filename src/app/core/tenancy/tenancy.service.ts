import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, REQUEST, signal } from '@angular/core';
import { WINDOW } from '@/app/core/window';
import { APEX_DOMAIN, DEV_TENANT_SLUG, FORCE_APEX } from './tenancy.tokens';

/**
 * Tenancy runtime detection — SSR-safe.
 *
 * Host resolution order:
 *
 *  - Browser → `window.location.hostname`.
 *  - Server  → incoming {@link REQUEST}: prefers `X-Forwarded-Host`, then `Host`, then the
 *    parsed `request.url`. The same header preference the backend uses, so the same tenant
 *    resolves at both layers.
 *
 * Mapping rules (same on both platforms):
 *
 *  - `ispnest.com`            → apex (null)
 *  - `www.ispnest.com`        → apex (null)
 *  - `acme.ispnest.com`       → tenant slug 'acme'
 *  - `localhost` / IP literal → {@link DEV_TENANT_SLUG} (defaults to 'default')
 */
@Injectable({ providedIn: 'root' })
export class TenancyService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apexDomain = inject(APEX_DOMAIN).toLowerCase();
  private readonly devTenantSlug = inject(DEV_TENANT_SLUG);
  private readonly forceApex = inject(FORCE_APEX);
  // Both injections are platform-conditional — use { optional: true } so they don't throw
  // on the non-matching platform.
  private readonly window = inject(WINDOW, { optional: true });
  private readonly request = inject(REQUEST, { optional: true });

  /** Currently resolved tenant slug; `null` means apex/platform context. */
  readonly tenantSlug = signal<string | null>(this.detect());

  readonly isApex = computed(() => this.tenantSlug() === null);
  readonly isTenant = computed(() => this.tenantSlug() !== null);

  /** Super-admin switched state (toggled by the tenant-switch flow). */
  readonly superAdminSwitched = signal<boolean>(false);

  private detect(): string | null {
    if (this.forceApex) return null;

    const host = this.resolveHost();
    if (!host) return null;

    const normalized = host.toLowerCase();

    // Dev fallback applies only to bare localhost / loopback IPs (no DNS labels).
    // For real subdomain testing in dev, use *.localtest.me or *.lvh.me (both resolve
    // every label to 127.0.0.1 in DNS) so the tenant slug round-trips through Host.
    if (
      normalized === 'localhost' ||
      normalized === '127.0.0.1' ||
      normalized === '::1' ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(normalized)
    ) {
      return this.devTenantSlug;
    }

    if (normalized === this.apexDomain || normalized === `www.${this.apexDomain}`) return null;

    // Dev convenience: treat *.localtest.me, *.lvh.me, *.test as tenant subdomains so
    // engineers can hit https://acme.localtest.me without an /etc/hosts entry.
    const devApexes = ['localtest.me', 'lvh.me', 'test'];
    for (const apex of devApexes) {
      if (normalized === apex) return null;
      const suffix = `.${apex}`;
      if (normalized.endsWith(suffix)) {
        const prefix = normalized.slice(0, -suffix.length);
        if (!prefix || prefix.includes('.')) return null;
        return prefix;
      }
    }

    const suffix = `.${this.apexDomain}`;
    if (!normalized.endsWith(suffix)) return null;

    const prefix = normalized.slice(0, -suffix.length);
    if (!prefix || prefix.includes('.')) return null;

    return prefix;
  }

  /** Resolve the request host on either platform. Returns hostname without port. */
  private resolveHost(): string | null {
    let raw: string | null = null;

    if (isPlatformServer(this.platformId) && this.request) {
      // Standards-based Request object provided by @angular/ssr.
      const headers = this.request.headers;
      raw =
        headers.get('x-forwarded-host') ||
        headers.get('host') ||
        (this.request.url ? new URL(this.request.url).host : null);
    } else if (isPlatformBrowser(this.platformId) && this.window?.location) {
      raw = this.window.location.hostname;
    }

    if (!raw) return null;
    // x-forwarded-host can be a comma-separated list — take the first hop.
    const first = raw.split(',')[0].trim();
    // Strip port if present.
    const colon = first.indexOf(':');
    return colon >= 0 ? first.slice(0, colon) : first;
  }

  /** Build a URL pointing at the apex host (host-aware redirects). */
  apexUrl(path = '/'): string {
    return `${this.scheme()}//${this.apexDomain}${path}`;
  }

  /** Build a URL pointing at a specific tenant subdomain. */
  tenantUrl(slug: string, path = '/'): string {
    return `${this.scheme()}//${slug}.${this.apexDomain}${path}`;
  }

  private scheme(): string {
    if (isPlatformBrowser(this.platformId) && this.window?.location) {
      return this.window.location.protocol;
    }
    if (isPlatformServer(this.platformId) && this.request) {
      // Honor X-Forwarded-Proto when behind a proxy (nginx, ALB).
      const proto = this.request.headers.get('x-forwarded-proto');
      if (proto) return `${proto.split(',')[0].trim()}:`;
      try {
        return new URL(this.request.url).protocol;
      } catch {
        /* fallthrough */
      }
    }
    return 'https:';
  }
}
