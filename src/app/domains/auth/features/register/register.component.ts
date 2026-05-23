import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatHint, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStep, MatStepper, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { Media } from '@/app/core/media';
import { kenyanPhoneValidator, normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { BandwidthDto } from '@/app/domains/plans/data/plan.model';
import { PlanDto } from '@/app/domains/plans/data/plan.model';
import { PortalApiService, PublicRouterDto, PublicPlanResponse } from '@/app/domains/portal/data';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    MatCard,
    MatButton,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatInput,
    MatIcon,
    MatStepper,
    MatStep,
    MatStepperNext,
    MatStepperPrevious,
    MatProgressSpinner,
  ],
  host: {
    class: 'flex flex-auto flex-col bg-neutral-2',
  },
  template: `
    <div class="flex flex-auto flex-col items-center justify-center sm:p-6">
      <div class="w-full max-w-xl">
        <!-- Logo / heading -->
        <div
          class="mb-8 flex flex-col items-start gap-3 px-4 sm:items-center sm:text-center sm:px-0"
        >
          <div class="flex items-center gap-x-2.5">
            <img class="size-9 object-contain" src="/img/ispnest-icon.svg" alt="ISPNest" />
            <img class="h-6 object-contain" src="/img/ispnest-logo-text.svg" alt="ISPNest" />
          </div>
          <div class="text-4xl font-semibold tracking-tight">Create Account</div>
          <div class="text-neutral-a11">Register for ISP services</div>
        </div>

        @if (success()) {
          <!-- ── Success screen ───────────────────────────────────────────── -->
          <mat-card
            [appearance]="isMobile() ? 'filled' : 'raised'"
            class="px-4 py-8 max-sm:bg-transparent sm:px-8"
          >
            <div class="flex flex-col items-center gap-4 text-center">
              <div class="flex size-14 items-center justify-center rounded-full bg-success-a3">
                <mat-icon svgIcon="check-circle" class="size-8 text-success-a11" />
              </div>
              <h2 class="text-xl font-semibold tracking-tight">Account Created!</h2>
              <p class="text-neutral-a11 text-sm leading-relaxed">
                Your account has been registered. A technician will contact you to connect the line.
              </p>
              <div class="w-full rounded-lg border border-neutral-a6 bg-neutral-a2 p-4 text-left">
                <p class="text-xs text-neutral-a9 uppercase tracking-wide mb-1">Account Code</p>
                <p class="font-mono text-lg font-bold text-primary">{{ success()!.accountCode }}</p>
                <p class="mt-2 text-xs text-neutral-a9 uppercase tracking-wide mb-1">Name</p>
                <p class="text-sm font-medium">{{ success()!.fullName }}</p>
              </div>
              <!-- Login instructions -->
              @if (success()!.loginUsername) {
                <div class="w-full rounded-lg border border-sky-a6 bg-sky-a3 p-4 text-left">
                  <div class="flex items-start gap-2">
                    <span class="text-sky-a11">ℹ️</span>
                    <div class="text-sm text-sky-a11">
                      <p class="font-semibold">How to log in</p>
                      <p class="mt-1">
                        Username:
                        <span class="font-mono font-bold">{{ success()!.loginUsername }}</span>
                      </p>
                      @if (success()!.loginNote) {
                        <p class="mt-1">{{ success()!.loginNote }}</p>
                      }
                    </div>
                  </div>
                </div>
              }
              <p class="text-xs text-neutral-a9">
                Please save your account code — you'll need it to sign in and make payments.
              </p>
              <a routerLink="/portal" matButton class="primary w-full"> Go to Portal </a>
            </div>
          </mat-card>
        } @else {
          <!-- ── Stepper ──────────────────────────────────────────────────── -->
          <mat-card
            [appearance]="isMobile() ? 'filled' : 'raised'"
            class="px-4 py-8 max-sm:bg-transparent sm:px-8"
          >
            <mat-stepper [orientation]="isMobile() ? 'vertical' : 'horizontal'" #stepper linear>
              <!-- ── Step 1: Personal Info ──────────────────────────────── -->
              <mat-step [stepControl]="personalForm" label="Personal Info">
                <form [formGroup]="personalForm" class="flex flex-col gap-y-4 pt-6">
                  <mat-form-field class="w-full">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="fullName" required autocomplete="name" />
                  </mat-form-field>
                  <mat-form-field class="w-full">
                    <mat-label>Phone Number</mat-label>
                    <input
                      matInput
                      formControlName="phoneNumber"
                      required
                      autocomplete="tel"
                      placeholder="07XX XXX XXX / +254…"
                    />
                    <mat-hint
                      >Accepted: 07XXXXXXXX, 01XXXXXXXX, 254XXXXXXXXX, or +254XXXXXXXXX</mat-hint
                    >
                    <mat-error>
                      @if (
                        personalForm.get('phoneNumber')?.invalid &&
                        personalForm.get('phoneNumber')?.touched
                      ) {
                        Enter a valid Kenyan number (07XX, 01XX, 254XX, or +254XX)
                      }
                    </mat-error>
                  </mat-form-field>
                  <mat-form-field class="w-full">
                    <mat-label>Email (optional)</mat-label>
                    <input matInput type="email" formControlName="email" autocomplete="email" />
                  </mat-form-field>

                  <div class="flex justify-end pt-2">
                    <button
                      matButton
                      class="primary"
                      matStepperNext
                      [disabled]="personalForm.invalid"
                    >
                      Next
                      <mat-icon svgIcon="arrow-right" />
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- ── Step 2: Area Selection ─────────────────────────────── -->
              <mat-step label="Select Area">
                <div class="flex flex-col gap-y-4 pt-6">
                  <p class="text-sm text-neutral-a11">
                    Choose the area closest to your location. This identifies the network
                    infrastructure that will serve you.
                  </p>

                  @if (loadingRouters()) {
                    <div class="flex items-center justify-center py-10">
                      <mat-progress-spinner diameter="32" mode="indeterminate" />
                    </div>
                  } @else if (routers().length === 0) {
                    <div
                      class="rounded-xl border border-neutral-a6 bg-neutral-a2 py-10 text-center"
                    >
                      <mat-icon svgIcon="wifi-off" class="mx-auto mb-2 size-8 text-neutral-a8" />
                      <p class="text-sm text-neutral-a11">
                        No areas available. Please contact support.
                      </p>
                    </div>
                  } @else {
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      @for (router of routers(); track router.id) {
                        <button
                          type="button"
                          class="group rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98]"
                          [class]="
                            selectedRouter()?.id === router.id
                              ? 'border-primary-a8 bg-primary-a3'
                              : 'border-neutral-a6 bg-neutral-a2 hover:border-neutral-a8 hover:bg-neutral-a3'
                          "
                          (click)="selectRouter(router)"
                        >
                          <div class="flex items-start gap-3">
                            <div
                              class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
                              [class]="
                                selectedRouter()?.id === router.id
                                  ? 'bg-primary-a4'
                                  : 'bg-neutral-a4'
                              "
                            >
                              <mat-icon
                                svgIcon="map-pin"
                                class="size-4"
                                [class]="
                                  selectedRouter()?.id === router.id
                                    ? 'text-primary-a11'
                                    : 'text-neutral-a11'
                                "
                              />
                            </div>
                            <div class="min-w-0 flex-1">
                              <p class="font-semibold text-sm leading-tight">{{ router.name }}</p>
                              @if (router.description) {
                                <p class="mt-0.5 text-xs text-neutral-a11 leading-relaxed">
                                  {{ router.description }}
                                </p>
                              }
                            </div>
                            @if (selectedRouter()?.id === router.id) {
                              <mat-icon
                                svgIcon="check-circle"
                                class="size-4 shrink-0 text-primary-a11 mt-0.5"
                              />
                            }
                          </div>
                        </button>
                      }
                    </div>
                  }

                  <div class="flex items-center justify-between gap-3 pt-2">
                    <button matButton class="tertiary" matStepperPrevious>
                      <mat-icon svgIcon="arrow-left" />
                      Back
                    </button>
                    <button
                      matButton
                      class="primary"
                      matStepperNext
                      [disabled]="!selectedRouter()"
                      (click)="onAreaNext()"
                    >
                      Next
                      <mat-icon svgIcon="arrow-right" />
                    </button>
                  </div>
                </div>
              </mat-step>

              <!-- ── Step 3: Plan Selection ──────────────────────────────── -->
              <mat-step label="Choose Plan">
                <div class="flex flex-col gap-y-4 pt-6">
                  @if (loadingPlans()) {
                    <div class="space-y-3">
                      @for (_ of [1, 2]; track $index) {
                        <div
                          class="animate-pulse rounded-2xl border border-neutral-a6 bg-neutral-a2 px-5 py-4"
                        >
                          <div class="flex items-start justify-between gap-4">
                            <div class="flex-1 space-y-2">
                              <div class="h-4 w-36 rounded-full bg-neutral-a4"></div>
                              <div class="h-3 w-24 rounded-full bg-neutral-a4"></div>
                            </div>
                            <div class="h-6 w-12 rounded-full bg-neutral-a4"></div>
                          </div>
                        </div>
                      }
                    </div>
                  } @else if (plans().length === 0) {
                    <div
                      class="rounded-xl border border-neutral-a6 bg-neutral-a2 py-10 text-center"
                    >
                      <mat-icon
                        svgIcon="package-open"
                        class="mx-auto mb-2 size-8 text-neutral-a8"
                      />
                      <p class="text-sm font-medium">No plans available for this area.</p>
                      <p class="mt-1 text-xs text-neutral-a11">
                        Please try another area or contact support.
                      </p>
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (item of plans(); track item.plan.id) {
                        <button
                          type="button"
                          class="group w-full cursor-pointer rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99]"
                          [class]="
                            selectedPlan()?.id === item.plan.id
                              ? 'border-primary-a8 bg-primary-a3'
                              : 'border-neutral-a6 bg-neutral-a2 hover:border-neutral-a8 hover:bg-neutral-a3'
                          "
                          (click)="selectedPlan.set(item.plan)"
                        >
                          <div class="flex items-start justify-between gap-4">
                            <!-- Left: name + badges + meta -->
                            <div class="min-w-0 flex-1">
                              <div class="flex flex-wrap items-center gap-2">
                                <h3 class="font-bold text-sm">{{ item.plan.name }}</h3>
                                <span
                                  class="inline-flex items-center rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide"
                                  [class]="planTypeClass(item.plan)"
                                  >{{ planTypeLabel(item.plan) }}</span
                                >
                                @if (selectedPlan()?.id === item.plan.id) {
                                  <span
                                    class="inline-flex items-center gap-1 rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide bg-primary-a4 text-primary-a11"
                                  >
                                    <mat-icon svgIcon="check" class="size-2.5" />Selected
                                  </span>
                                }
                                @if (item.plan.badge) {
                                  <span class="text-[10px] font-bold text-amber-11"
                                    >⭐ {{ item.plan.badge }}</span
                                  >
                                }
                              </div>

                              @if (item.bandwidth) {
                                <p class="mt-1 text-xs text-blue-11">
                                  {{ formatSpeed(item.bandwidth) }}
                                </p>
                              }
                              <p class="mt-1 text-xs text-neutral-a10">
                                {{ formatData(item.plan) }}
                                @if (item.plan.validity && item.plan.validityUnit) {
                                  · {{ formatValidity(item.plan) }}
                                }
                              </p>
                              @if (item.plan.description) {
                                <p class="mt-1 text-xs leading-relaxed text-neutral-a10">
                                  {{ item.plan.description }}
                                </p>
                              }
                              @if (getFeatures(item.plan).length > 0) {
                                <ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                  @for (feat of getFeatures(item.plan); track feat) {
                                    <li class="flex items-center gap-1 text-xs text-neutral-a11">
                                      <mat-icon
                                        svgIcon="check"
                                        class="size-3 shrink-0 text-success-a11"
                                      />
                                      {{ feat }}
                                    </li>
                                  }
                                </ul>
                              }
                            </div>
                            <!-- Right: price -->
                            <div class="shrink-0 text-right">
                              <div class="text-2xl font-black leading-none">
                                {{ item.plan.price | number: '1.0-0' }}
                              </div>
                              <div
                                class="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-a10"
                              >
                                KES
                              </div>
                            </div>
                          </div>
                        </button>
                      }
                    </div>
                  }

                  @if (errorMessage()) {
                    <div
                      class="flex items-center gap-x-2 rounded-lg border border-error-a6 bg-error-a3 p-3 text-sm text-error-a11"
                    >
                      <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                      {{ errorMessage() }}
                    </div>
                  }

                  <div class="flex items-center justify-between gap-3 pt-2">
                    <button matButton class="tertiary" matStepperPrevious>
                      <mat-icon svgIcon="arrow-left" />
                      Back
                    </button>
                    <button
                      matButton
                      class="primary"
                      [disabled]="!selectedPlan() || saving()"
                      (click)="submit()"
                    >
                      @if (saving()) {
                        <mat-progress-spinner diameter="16" mode="indeterminate" />
                        Creating…
                      } @else {
                        Create Account
                      }
                    </button>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </mat-card>
        }

        <p class="mt-4 text-center text-sm text-neutral-a11">
          Already have an account?
          <a
            routerLink="/portal"
            class="font-medium text-primary underline-offset-2 hover:underline"
          >
            Sign in to portal
          </a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly portalApi = inject(PortalApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly isMobile = inject(Media).match('(width < 40rem)');

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly loadingRouters = signal(true);
  readonly loadingPlans = signal(false);

  readonly routers = signal<PublicRouterDto[]>([]);
  readonly plans = signal<PublicPlanResponse[]>([]);
  readonly selectedRouter = signal<PublicRouterDto | null>(null);
  readonly selectedPlan = signal<PlanDto | null>(null);
  readonly success = signal<{
    accountCode: string;
    fullName: string;
    loginUsername: string | null;
    loginNote: string | null;
  } | null>(null);

  personalForm = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, kenyanPhoneValidator]],
    email: ['', Validators.email],
  });

  ngOnInit(): void {
    this.portalApi.getRouters().subscribe({
      next: (routers) => {
        this.routers.set(routers);
        this.loadingRouters.set(false);
      },
      error: () => this.loadingRouters.set(false),
    });
  }

  selectRouter(router: PublicRouterDto): void {
    this.selectedRouter.set(router);
    this.selectedPlan.set(null);
  }

  onAreaNext(): void {
    const router = this.selectedRouter();
    if (!router) return;
    this.loadingPlans.set(true);
    this.plans.set([]);
    this.portalApi.getRouterPlans(router.id).subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loadingPlans.set(false);
      },
      error: () => this.loadingPlans.set(false),
    });
  }

  submit(): void {
    if (this.personalForm.invalid || !this.selectedRouter() || !this.selectedPlan()) return;

    this.saving.set(true);
    this.errorMessage.set('');

    const router = this.selectedRouter()!;
    const plan = this.selectedPlan()!;
    const { fullName, phoneNumber, email } = this.personalForm.value;

    this.portalApi
      .register({
        fullName: fullName!,
        phoneNumber: normalizeKenyanPhone(phoneNumber!),
        email: email || undefined,
        coordinates: router.coordinates || undefined,
        routerId: router.id,
        planId: plan.id,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.success.set({
            accountCode: res.accountCode,
            fullName: res.fullName,
            loginUsername: res.loginUsername ?? null,
            loginNote: res.loginNote ?? null,
          });
        },
        error: (err: { error?: { message?: string } }) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.message ?? 'Registration failed. Please try again.');
        },
      });
  }

  // ── Plan card helpers ─────────────────────────────────────────────────────

  private toKbps(rate: number, unit: string): number {
    const u = (unit ?? '').toLowerCase();
    if (u.startsWith('g')) return Math.round(rate * 1024 * 1024);
    if (u.startsWith('m')) return Math.round(rate * 1024);
    return Math.round(rate);
  }

  private smartUnit(rate: number, unit: string): string {
    const kbps = this.toKbps(rate, unit);
    if (kbps >= 1024) return `${parseFloat((kbps / 1024).toFixed(2))} Mbps`;
    return `${kbps} Kbps`;
  }

  formatSpeed(bw: BandwidthDto): string {
    return `↓ ${this.smartUnit(bw.rateDown, bw.rateDownUnit)} / ↑ ${this.smartUnit(bw.rateUp, bw.rateUpUnit)}`;
  }

  planTypeLabel(plan: PlanDto): string {
    if (plan.limitType === 'data') return 'Data';
    if (plan.limitType === 'time') return 'Time';
    return 'Unlimited';
  }

  planTypeClass(plan: PlanDto): string {
    if (plan.limitType === 'data') return 'bg-sky-a4 text-sky-11';
    if (plan.limitType === 'time') return 'bg-purple-a4 text-purple-11';
    return 'bg-success-a4 text-success-a11';
  }

  formatValidity(plan: PlanDto): string {
    if (!plan.validity || !plan.validityUnit) return '';
    const unit = plan.validity === 1 ? plan.validityUnit.replace(/s$/i, '') : plan.validityUnit;
    return `${plan.validity} ${unit}`;
  }

  formatData(plan: PlanDto): string {
    if (!plan.limitType || plan.limitType === 'unlimited') return 'Unlimited';
    if (plan.limitType === 'data' && plan.dataLimit && plan.dataUnit)
      return `${plan.dataLimit} ${plan.dataUnit}`;
    if (plan.limitType === 'time' && plan.timeLimit && plan.timeUnit)
      return `${plan.timeLimit} ${plan.timeUnit}`;
    return 'Unlimited';
  }

  getFeatures(plan: PlanDto): string[] {
    if (!plan.features) return [];
    return plan.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  }
}
