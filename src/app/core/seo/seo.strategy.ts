import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Per-route SEO metadata stored in route `data.seo`. */
export type SeoData = {
  /** `&lt;meta name="description">` and `og:description`. */
  description?: string;
  /** `og:image` — defaults to `/img/ispnest-logo.svg`. */
  ogImage?: string;

  /**
   * `&lt;meta name="robots">`.
   * Defaults to `'noindex, nofollow'` when left unset (safe fallback for
   * auth-gated pages). Set to `'index, follow'` on public marketing pages.
   */
  robots?: string;
};

const DEFAULT_OG_IMAGE = '/img/ispnest-logo.svg';
const DEFAULT_ROBOTS = 'noindex, nofollow';

/**
 * Custom Angular 22 `TitleStrategy` that sets `&lt;title>` and all SEO meta
 * tags from route `title` and `data.seo` on every navigation.
 *
 * Register in `appConfig` providers:
 *   `{ provide: TitleStrategy, useClass: SeoStrategy }`
 */
@Injectable({ providedIn: 'root' })
export class SeoStrategy extends TitleStrategy {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) ?? 'ISPNest';
    const seo = this.getDeepestSeo(snapshot.root);

    // ── <title> ─────────────────────────────────────────────────────────
    this.titleService.setTitle(pageTitle);

    // ── description ─────────────────────────────────────────────────────
    if (seo?.description) {
      this.meta.updateTag({ name: 'description', content: seo.description });
      this.meta.updateTag({ property: 'og:description', content: seo.description });
    } else {
      this.meta.removeTag('name="description"');
      this.meta.removeTag('property="og:description"');
    }

    // ── Open Graph ──────────────────────────────────────────────────────
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({
      property: 'og:image',
      content: seo?.ogImage ?? DEFAULT_OG_IMAGE,
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // ── Robots ──────────────────────────────────────────────────────────
    this.meta.updateTag({ name: 'robots', content: seo?.robots ?? DEFAULT_ROBOTS });
  }

  /** Walk the activated route tree to the deepest child and return its `data.seo`. */
  private getDeepestSeo(route: ActivatedRouteSnapshot): SeoData | undefined {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current.data?.['seo'] as SeoData | undefined;
  }
}
