import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ── Root route is host-aware (apex vs tenant). Render per request so the correct
  // first paint is produced for the incoming host, and we avoid apex->login flicker
  // on tenant hosts.
  { path: '', renderMode: RenderMode.Server },

  // ── Prerender — purely static HTML, zero runtime backend calls ──────────
  // Auth forms (static HTML, no server-side data needed).
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  // Customer portal login form (static form, no pre-fetch required).
  { path: 'portal', renderMode: RenderMode.Prerender },

  // ── Server — rendered on each request (hits backend APIs) ───────────────
  // Hotspot plans — fetches available WiFi plans from /api/hotspot/plans.
  { path: 'hotspot', renderMode: RenderMode.Server },
  // Hotspot purchase — reads plan details passed via navigation / query params.
  { path: 'hotspot/purchase', renderMode: RenderMode.Server },
  // Hotspot payment status — fetches live payment result by paymentId.
  { path: 'hotspot/status/:paymentId', renderMode: RenderMode.Server },

  // ── Client — requires browser-only APIs (localStorage / sessionStorage) ─
  // OAuth2 PKCE callback — verifier stored in localStorage, must run in browser.
  { path: 'callback', renderMode: RenderMode.Client },
  // Customer portal (post-login) — uses sessionStorage for portalCustomerId.
  { path: 'portal/**', renderMode: RenderMode.Client },
  // Admin panel — auth via JWT in localStorage.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },

  // Fallback — client-render anything not explicitly listed above.
  { path: '**', renderMode: RenderMode.Client },
];
