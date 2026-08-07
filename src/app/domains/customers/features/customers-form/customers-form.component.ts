import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { kenyanPhoneValidator, normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { CustomerApiService } from '@/app/domains/customers/data';
import { BandwidthDto } from '@/app/domains/plans/data/plan.model';
import { PortalApiService, PublicPlanResponse, PublicRouterDto } from '@/app/domains/portal/data';
import { SettingsApiService } from '@/app/domains/settings/data/settings-api.service';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatTabGroup,
    MatTab,
    MatProgressSpinner,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/customers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Customer' : 'New Customer' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update subscriber details' : 'Register a new subscriber' }}
          </p>
        </div>
      </div>

      <mat-card>
        <mat-tab-group class="p-2">
          <!-- ── Tab 1: Basic Info (required) ──────────────────────────── -->
          <mat-tab label="Basic Info">
            <div class="flex flex-col gap-y-4 p-4">
              <p class="text-sm text-neutral-a11">Required to create the customer.</p>
              <mat-form-field>
                <mat-label>Full Name</mat-label>
                <input matInput [formControl]="f.fullName" required />
                <mat-error>Full name is required</mat-error>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Phone Number</mat-label>
                <input
                  matInput
                  [formControl]="f.phoneNumber"
                  required
                  placeholder="07XX XXX XXX / +254…"
                />
                <mat-hint>Kenyan number: 07XX, 01XX, 254XX, +254XX</mat-hint>
                <mat-error>Enter a valid Kenyan number</mat-error>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Email (optional)</mat-label>
                <input matInput type="email" [formControl]="f.email" />
              </mat-form-field>
            </div>
          </mat-tab>

          <!-- ── Tab 2: Service Settings ────────────────────────────────── -->
          <mat-tab label="Service">
            <div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
              <mat-form-field>
                <mat-label>Service Type</mat-label>
                <mat-select [formControl]="f.serviceType">
                  <mat-option value="pppoe">PPPoE</mat-option>
                  <mat-option value="hotspot">Hotspot</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Account Type</mat-label>
                <mat-select [formControl]="f.accountType">
                  <mat-option value="Business">Business</mat-option>
                  <mat-option value="Personal">Personal</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Status</mat-label>
                <mat-select [formControl]="f.status">
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="inactive">Inactive</mat-option>
                  <mat-option value="suspended">Suspended</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-tab>

          <!-- ── Tab 3: Network (router + plan) ────────────────────────── -->
          @if (!isEditMode) {
            <mat-tab label="Network">
              <div class="flex flex-col gap-y-4 p-4">
                <p class="text-sm text-neutral-a11">Select area and plan (optional at creation).</p>

                <!-- Router picker -->
                @if (loadingRouters()) {
                  <div class="flex items-center gap-2 text-sm text-neutral-a11 py-4">
                    <mat-progress-spinner diameter="20" mode="indeterminate" />
                    Loading areas…
                  </div>
                } @else {
                  <div>
                    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-a9">
                      Area
                    </p>
                    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      @for (router of routers(); track router.id) {
                        <button
                          type="button"
                          class="rounded-xl border p-3 text-left text-sm transition-all active:scale-[0.98]"
                          [class]="
                            selectedRouter()?.id === router.id
                              ? 'border-primary-a8 bg-primary-a3'
                              : 'border-neutral-a6 bg-neutral-a2 hover:border-neutral-a8'
                          "
                          (click)="selectRouter(router)"
                        >
                          <div class="font-medium">{{ router.name }}</div>
                          @if (router.description) {
                            <div class="text-xs text-neutral-a9 mt-0.5">
                              {{ router.description }}
                            </div>
                          }
                        </button>
                      } @empty {
                        <p class="col-span-full text-sm text-neutral-a9">
                          No areas available. Add coordinates to a router to make it selectable
                          here.
                        </p>
                      }
                    </div>
                  </div>
                }

                <!-- Plan picker -->
                @if (selectedRouter()) {
                  @if (loadingPlans()) {
                    <div class="flex items-center gap-2 text-sm text-neutral-a11">
                      <mat-progress-spinner diameter="20" mode="indeterminate" />
                      Loading plans…
                    </div>
                  } @else if (plans().length > 0) {
                    <div>
                      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-a9">
                        Plan
                      </p>
                      <div class="space-y-2">
                        @for (item of plans(); track item.plan.id) {
                          <button
                            type="button"
                            class="w-full rounded-xl border px-4 py-3 text-left text-sm transition-all active:scale-[0.99]"
                            [class]="
                              selectedPlanItem()?.plan?.id === item.plan.id
                                ? 'border-primary-a8 bg-primary-a3'
                                : 'border-neutral-a6 bg-neutral-a2 hover:border-neutral-a8'
                            "
                            (click)="selectedPlanItem.set(item)"
                          >
                            <div class="flex items-center justify-between">
                              <span class="font-semibold">{{ item.plan.name }}</span>
                              <span class="font-bold text-primary-a11"
                                >KES {{ item.plan.price | number: '1.0-0' }}</span
                              >
                            </div>
                            @if (item.bandwidth) {
                              <div class="text-xs text-blue-11 mt-0.5">
                                {{ formatSpeed(item.bandwidth) }}
                              </div>
                            }
                            <div class="text-xs text-neutral-a9 mt-0.5">
                              {{ item.plan.validity }} {{ item.plan.validityUnit }}
                            </div>
                          </button>
                        }
                      </div>
                    </div>
                  }
                }
              </div>
            </mat-tab>
          }

          <!-- ── Tab 4: PPPoE ───────────────────────────────────────────── -->
          <mat-tab label="PPPoE">
            <div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              <mat-form-field>
                <mat-label>PPPoE Username (auto-generated)</mat-label>
                <input matInput [formControl]="f.pppoeUsername" readonly />
              </mat-form-field>
              <mat-form-field>
                <mat-label>PPPoE Password (auto-generated)</mat-label>
                <input matInput [formControl]="f.pppoePassword" readonly />
              </mat-form-field>
              <mat-form-field class="sm:col-span-2">
                <mat-label>Coordinates</mat-label>
                <input matInput [formControl]="f.coordinates" placeholder="-1.234, 36.789" />
              </mat-form-field>
            </div>
          </mat-tab>

          <!-- ── Tab 5: Charges (create-mode only) ─────────────────────── -->
          @if (!isEditMode) {
            <mat-tab label="Charges">
              <div class="flex flex-col gap-y-4 p-4">
                <p class="text-sm text-neutral-a11">
                  A connection fee is auto-created. Override the amount here (leave blank to use the
                  default of KES {{ defaultConnectionFee() | number: '1.0-0' }}).
                </p>
                <mat-form-field class="w-full max-w-xs">
                  <mat-label>Connection Fee (KES)</mat-label>
                  <input
                    matInput
                    type="number"
                    min="0"
                    [formControl]="f.connectionFeeOverride"
                    [placeholder]="defaultConnectionFee().toString()"
                  />
                  <mat-hint
                    >Leave blank to use default ({{
                      defaultConnectionFee() | number: '1.0-0'
                    }})</mat-hint
                  >
                </mat-form-field>
              </div>
            </mat-tab>
          }
        </mat-tab-group>

        @if (errorMessage()) {
          <div
            class="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
          >
            <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
            {{ errorMessage() }}
          </div>
        }

        <div class="flex justify-end gap-3 px-4 pb-4">
          <a matButton class="tertiary" routerLink="/admin/customers">Cancel</a>
          <button
            class="primary"
            matButton
            type="button"
            (click)="submit()"
            [disabled]="f.fullName.invalid || f.phoneNumber.invalid || saving()"
          >
            {{ saving() ? 'Saving…' : isEditMode ? 'Update Customer' : 'Create Customer' }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
})
export class CustomersFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerApi = inject(CustomerApiService);
  private readonly portalApi = inject(PortalApiService);
  private readonly settingsApi = inject(SettingsApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly loadingRouters = signal(false);
  readonly loadingPlans = signal(false);
  readonly routers = signal<PublicRouterDto[]>([]);
  readonly plans = signal<PublicPlanResponse[]>([]);
  readonly selectedRouter = signal<PublicRouterDto | null>(null);
  readonly selectedPlanItem = signal<PublicPlanResponse | null>(null);
  readonly defaultConnectionFee = signal(0);
  isEditMode = false;
  customerId = '';

  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, kenyanPhoneValidator]],
    email: ['', Validators.email],
    serviceType: ['pppoe'],
    accountType: ['Personal'],
    status: ['active'],
    pppoeUsername: [''],
    pppoePassword: [''],
    coordinates: [''],
    connectionFeeOverride: [null as number | null],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.customerId;

    if (this.isEditMode) {
      this.customerApi.getById(this.customerId).subscribe((c) => this.form.patchValue(c as never));
    } else {
      // Load routers for plan picker and default connection fee
      this.loadingRouters.set(true);
      forkJoin({
        routers: this.portalApi.getRouters(),
        settings: this.settingsApi.getProviderConfig('billing'),
      }).subscribe({
        next: ({ routers, settings }) => {
          this.routers.set(routers);
          this.loadingRouters.set(false);
          const feeEntry = settings.find((s) => s.configKey === 'connection_fee');
          this.defaultConnectionFee.set(feeEntry ? parseFloat(feeEntry.configValue) || 0 : 0);
        },
        error: () => this.loadingRouters.set(false),
      });
    }
  }

  selectRouter(router: PublicRouterDto): void {
    this.selectedRouter.set(router);
    this.selectedPlanItem.set(null);
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
    if (this.f.fullName.invalid || this.f.phoneNumber.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const v = this.form.value;
    const connectionFeeOverride =
      v.connectionFeeOverride != null && v.connectionFeeOverride > 0
        ? v.connectionFeeOverride
        : this.defaultConnectionFee() > 0
          ? this.defaultConnectionFee()
          : null;

    const call = this.isEditMode
      ? this.customerApi.update(this.customerId, {
          fullName: v.fullName ?? undefined,
          phoneNumber: v.phoneNumber ? normalizeKenyanPhone(v.phoneNumber) : undefined,
          email: v.email ?? undefined,
          serviceType: v.serviceType ?? undefined,
          accountType: v.accountType ?? undefined,
          status: v.status ?? undefined,
          pppoeUsername: v.pppoeUsername ?? undefined,
          pppoePassword: v.pppoePassword ?? undefined,
          coordinates: v.coordinates ?? undefined,
        })
      : this.customerApi.create({
          fullName: v.fullName!,
          phoneNumber: normalizeKenyanPhone(v.phoneNumber!),
          email: v.email || undefined,
          accountType: v.accountType || 'Personal',
          coordinates: v.coordinates || undefined,
          connectionFeeOverride,
        });

    call.subscribe({
      next: (customer) => {
        // If a plan+router was selected, assign the plan-router using planRouterId from the plan item
        const planItem = this.selectedPlanItem();
        if (!this.isEditMode && planItem?.planRouterId) {
          this.customerApi.assignPlanRouter(customer.id, planItem.planRouterId).subscribe();
        }
        this.saving.set(false);
        this.snackBar.open(`Customer ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/customers']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }

  formatSpeed(bw: BandwidthDto): string {
    const fmt = (r: number, u: string) => {
      const kbps = u.toLowerCase().startsWith('g')
        ? r * 1024 * 1024
        : u.toLowerCase().startsWith('m')
          ? r * 1024
          : r;
      return kbps >= 1024 ? `${parseFloat((kbps / 1024).toFixed(1))} Mbps` : `${kbps} Kbps`;
    };
    return `↓ ${fmt(bw.rateDown, bw.rateDownUnit)} / ↑ ${fmt(bw.rateUp, bw.rateUpUnit)}`;
  }
}
