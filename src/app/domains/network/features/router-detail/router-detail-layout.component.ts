import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import {
  IssueOnboardingTokenResponse,
  RouterOnboardingApiService,
} from '@/app/domains/network/data';
import {
  MANAGEMENT_STATE_HUE,
  badgeClassFor,
} from '@/app/domains/network/shared/router-status.util';
import { BootstrapCommandComponent } from '../router-onboarding/bootstrap-command.component';
import { RouterDetailStore } from './router-detail.store';

/**
 * Shell for the router detail page: header (identity, status badge, header actions) + a route-per-
 * tab nav bar with a `router-outlet` for the active tab. Modeled on BuilderKit's
 * `settings/layout.ts` — each tab is its own route/component (see `routes.ts`), so a future tab is
 * one more entry in `tabs` below plus one more child route, never a rework of this shell.
 *
 * Kept deliberately to two tabs (Overview, Services) rather than one per data section — see the
 * plan doc for why: quick facts stay as compact cards on Overview, a dedicated tab is reserved for
 * content that's genuinely bulky/interactive (the Services form). Mirrors the same
 * "quick-facts-as-cards" idea customer-detail already uses, without repeating its tab sprawl.
 */
@Component({
  selector: 'app-router-detail-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIconButton,
    MatButton,
    MatIcon,
    MatCard,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    MatSelect,
    MatOption,
    MatFormField,
    BootstrapCommandComponent,
  ],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div
      class="mx-auto flex w-full max-w-5xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/routers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="router" class="text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h1 class="truncate text-2xl font-semibold tracking-tight">
              {{ store.router()?.name || 'Router' }}
            </h1>
            @if (store.managementState(); as state) {
              <span
                [class]="badgeClass(state.state)"
                class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
              >
                {{ state.state }}
              </span>
            }
          </div>
          <p class="text-sm text-neutral-a11">Onboarding status and management history</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <a matButton class="tertiary" [routerLink]="['/admin/routers', routerId, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
          <button
            matButton
            class="primary"
            type="button"
            (click)="issueToken()"
            [disabled]="issuing()"
          >
            {{ issuing() ? 'Issuing…' : 'Issue Onboarding Token' }}
          </button>
        </div>
      </div>

      <!-- Issued-token banner -->
      @if (issuedToken(); as issued) {
        <mat-card class="border border-primary-a6 bg-primary-a2 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <p class="text-sm font-semibold">
                Token issued — copy this command now, it will not be shown again
              </p>
              <p class="mt-1 text-xs text-neutral-a10">
                Paste this into the router's MikroTik RouterOS 7 terminal. Safe to re-run if it
                fails partway through.
              </p>
              <div class="mt-2">
                <app-bootstrap-command [token]="issued.token" [expiresAt]="issued.expiresAt" />
              </div>
            </div>
            <button matIconButton type="button" (click)="issuedToken.set(null)">
              <mat-icon svgIcon="x" class="size-4" />
            </button>
          </div>
        </mat-card>
      }

      <!-- Tabs (desktop) -->
      <nav
        mat-tab-nav-bar
        class="hidden sm:flex"
        [tabPanel]="tabPanel"
        [mat-stretch-tabs]="false"
        ngSkipHydration
      >
        @for (tab of tabs; track tab.path) {
          <a
            mat-tab-link
            routerLinkActive
            class="tertiary"
            [active]="rla.isActive"
            [routerLink]="tab.path"
            #rla="routerLinkActive"
          >
            <mat-icon class="size-4 text-current" [svgIcon]="tab.icon" />
            <span class="ml-2">{{ tab.label }}</span>
          </a>
        }
      </nav>

      <!-- Tabs (mobile) -->
      <mat-form-field class="w-full sm:hidden">
        <mat-select [value]="router.url" (selectionChange)="onMobileTabChange($event)">
          @for (tab of tabs; track tab.path) {
            <mat-option [value]="fullPath(tab.path)">{{ tab.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-tab-nav-panel #tabPanel>
        <router-outlet />
      </mat-tab-nav-panel>
    </div>
  `,
})
export class RouterDetailLayoutComponent implements OnInit {
  protected readonly store = inject(RouterDetailStore);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly onboardingApi = inject(RouterOnboardingApiService);
  private readonly snackBar = inject(MatSnackBar);

  routerId = '';
  readonly issuing = signal(false);
  readonly issuedToken = signal<IssueOnboardingTokenResponse | null>(null);

  protected readonly tabs = [
    { path: 'overview', label: 'Overview', icon: 'gauge' },
    { path: 'services', label: 'Services', icon: 'settings' },
  ];

  ngOnInit(): void {
    this.routerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.init(this.routerId);
  }

  badgeClass(state: string): string {
    return badgeClassFor(MANAGEMENT_STATE_HUE[state] ?? 'neutral');
  }

  fullPath(tabPath: string): string {
    return `/admin/routers/${this.routerId}/onboarding/${tabPath}`;
  }

  onMobileTabChange(event: MatSelectChange): void {
    this.router.navigateByUrl(event.value);
  }

  issueToken(): void {
    this.issuing.set(true);
    this.onboardingApi.issueOnboardingToken(this.routerId).subscribe({
      next: (issued) => {
        this.issuing.set(false);
        this.issuedToken.set(issued);
      },
      error: () => {
        this.issuing.set(false);
        this.snackBar.open('Failed to issue onboarding token', 'Close', { duration: 3000 });
      },
    });
  }
}
