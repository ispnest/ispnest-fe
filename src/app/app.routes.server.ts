import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Landing page — fully static, no API calls. Pre-render at build time for best SEO + performance.
  { path: '', renderMode: RenderMode.Prerender },

  // Public hotspot captive portal — fetches plans from /api/hotspot/plans server-side.
  // SSR improves first-paint speed on MikroTik redirect (users arrive on slow WiFi).
  { path: 'hotspot', renderMode: RenderMode.Server },
  { path: 'hotspot/**', renderMode: RenderMode.Server },

  // Customer portal — depends on sessionStorage (portalCustomerId). Must be client-only.
  { path: 'portal', renderMode: RenderMode.Client },
  { path: 'portal/**', renderMode: RenderMode.Client },

  // Admin panel — auth-gated via JWT in localStorage. Must be client-only.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },

  // Auth flows — PKCE code verifier in localStorage, OAuth2 redirects. Must be client-only.
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'callback', renderMode: RenderMode.Client },

  // Fallback — render everything else on the client to be safe.
  { path: '**', renderMode: RenderMode.Client },
];
