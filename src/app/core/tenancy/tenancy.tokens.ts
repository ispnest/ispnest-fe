import { InjectionToken } from '@angular/core';

/**
 * The marketing/apex domain (no tenant subdomain). Everything matching
 * `&lt;slug>.&lt;apex>` is interpreted as tenant `&lt;slug>`.
 *
 * Overridden in {@code app.config.server.ts} from `process.env.NG_APP_TENANCY_APEX`
 * so the SSR runtime sees the deploy-time value. Browser bundles use the default
 * unless you also inject a runtime override (e.g. via a `&lt;meta>` tag emitted by SSR).
 */
export const APEX_DOMAIN = new InjectionToken<string>('ispnest.apex-domain', {
  providedIn: 'root',
  factory: () => 'ispnest.com',
});

/**
 * Tenant slug used in local dev where the hostname is `localhost` / an IP and there is
 * no real subdomain to parse. Defaults to the bootstrapped `default` tenant.
 */
export const DEV_TENANT_SLUG = new InjectionToken<string>('ispnest.dev-tenant-slug', {
  providedIn: 'root',
  factory: () => 'default',
});
