import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterApiService, PoolApiService } from '@/app/domains/network/data';
import { RouterDto, PoolDto } from '@/app/domains/network/data/network.model';
import { BandwidthApiService, PlanApiService } from '@/app/domains/plans/data';
import { BandwidthDto } from '@/app/domains/plans/data/plan.model';

@Component({
  selector: 'app-plans-form',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatDivider,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatCheckbox,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/plans">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Plan' : 'New Plan' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update plan details' : 'Create a new service plan' }}
          </p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-10 p-6">
          <!-- Section: Plan Details -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Plan Details</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Basic identification and pricing information.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-4">
                <mat-label>Plan Name</mat-label>
                <input matInput formControlName="name" required />
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="pppoe">PPPoE</mat-option>
                  <mat-option value="hotspot">Hotspot</mat-option>
                  <mat-option value="static">Static</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Plan Category</mat-label>
                <mat-select formControlName="planType">
                  <mat-option value="Personal">Personal</mat-option>
                  <mat-option value="Business">Business</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Price (KES)</mat-label>
                <input matInput type="number" formControlName="price" required />
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Badge (optional)</mat-label>
                <input matInput formControlName="badge" placeholder="e.g. POPULAR" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-full">
                <mat-label>Description</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>

              <div class="sm:col-span-3">
                <mat-checkbox formControlName="prepaid">Prepaid (pay before service)</mat-checkbox>
              </div>
              <div class="sm:col-span-3">
                <mat-checkbox formControlName="enabled">Enabled</mat-checkbox>
              </div>
            </div>
          </div>

          <mat-divider />

          <!-- Section: Bandwidth & Network -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Bandwidth & Network</h2>
              <p class="mt-1 text-sm text-neutral-a11">Speed profile and NAS routing assignment.</p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-full">
                <mat-label>Bandwidth Profile</mat-label>
                <mat-select formControlName="bandwidthId">
                  <mat-option [value]="null">— None —</mat-option>
                  @for (bw of bandwidths(); track bw.id) {
                    <mat-option [value]="bw.id">
                      {{ bw.name }} (↓{{ bw.rateDown }}{{ bw.rateDownUnit }} / ↑{{ bw.rateUp
                      }}{{ bw.rateUpUnit }})
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Router (NAS)</mat-label>
                <mat-select formControlName="routerId" (ngModelChange)="onRouterChange($event)">
                  <mat-option [value]="null">— None —</mat-option>
                  @for (r of routers(); track r.id) {
                    <mat-option [value]="r.id">{{ r.name }} ({{ r.ipAddress }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>IP Pool</mat-label>
                <mat-select formControlName="poolId">
                  <mat-option [value]="null">— None —</mat-option>
                  @for (p of pools(); track p.id) {
                    <mat-option [value]="p.id">{{ p.name }}</mat-option>
                  }
                </mat-select>
                <mat-hint>Select a router first to filter pools</mat-hint>
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Shared Users</mat-label>
                <input matInput type="number" formControlName="sharedUsers" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Concurrent Devices</mat-label>
                <input matInput type="number" formControlName="concurrentDevices" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Max Sessions</mat-label>
                <input matInput type="number" formControlName="maxSessions" />
              </mat-form-field>
            </div>
          </div>

          <mat-divider />

          <!-- Section: Validity & Data Limits -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Validity & Data</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Subscription duration and data/time quota settings.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-3">
                <mat-label>Validity</mat-label>
                <input matInput type="number" formControlName="validity" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Validity Unit</mat-label>
                <mat-select formControlName="validityUnit">
                  <mat-option value="hours">Hours</mat-option>
                  <mat-option value="days">Days</mat-option>
                  <mat-option value="months">Months</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-full">
                <mat-label>Limit Type</mat-label>
                <mat-select formControlName="limitType">
                  <mat-option value="Unlimited">Unlimited</mat-option>
                  <mat-option value="Data_limit">Data Limit</mat-option>
                  <mat-option value="Time_limit">Time Limit</mat-option>
                </mat-select>
              </mat-form-field>

              @if (form.get('limitType')?.value === 'Data_limit') {
                <mat-form-field class="sm:col-span-3">
                  <mat-label>Data Limit</mat-label>
                  <input matInput type="number" formControlName="dataLimit" />
                </mat-form-field>
                <mat-form-field class="sm:col-span-3">
                  <mat-label>Data Unit</mat-label>
                  <mat-select formControlName="dataUnit">
                    <mat-option value="MB">MB</mat-option>
                    <mat-option value="GB">GB</mat-option>
                  </mat-select>
                </mat-form-field>
              }

              @if (form.get('limitType')?.value === 'Time_limit') {
                <mat-form-field class="sm:col-span-3">
                  <mat-label>Time Limit</mat-label>
                  <input matInput type="number" formControlName="timeLimit" />
                </mat-form-field>
                <mat-form-field class="sm:col-span-3">
                  <mat-label>Time Unit</mat-label>
                  <mat-select formControlName="timeUnit">
                    <mat-option value="minutes">Minutes</mat-option>
                    <mat-option value="hours">Hours</mat-option>
                  </mat-select>
                </mat-form-field>
              }
            </div>
          </div>

          <mat-divider />

          <!-- Section: Session Parameters -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Session Parameters</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                MikroTik/RADIUS session timeouts and limits.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-3">
                <mat-label>Session Timeout (s)</mat-label>
                <input matInput type="number" formControlName="sessionTimeout" />
                <mat-hint>e.g. 86400 = 24 h. MikroTik forces re-auth after this.</mat-hint>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Idle Timeout (s)</mat-label>
                <input matInput type="number" formControlName="idleTimeout" />
                <mat-hint>e.g. 600 = 10 min of no traffic.</mat-hint>
              </mat-form-field>
            </div>
          </div>

          @if (errorMessage()) {
            <div
              class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
            >
              <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
              {{ errorMessage() }}
            </div>
          }

          <mat-divider />

          <div class="flex justify-end gap-3">
            <a matButton class="tertiary" routerLink="/admin/plans">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : isEditMode ? 'Update Plan' : 'Create Plan' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class PlansFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planApi = inject(PlanApiService);
  private readonly bandwidthApi = inject(BandwidthApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly poolApi = inject(PoolApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly bandwidths = signal<BandwidthDto[]>([]);
  readonly routers = signal<RouterDto[]>([]);
  readonly pools = signal<PoolDto[]>([]);
  isEditMode = false;
  planId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['pppoe', Validators.required],
    planType: ['Personal'],
    price: [0, [Validators.required, Validators.min(0)]],
    prepaid: [false],
    enabled: [true],
    badge: [''],
    description: [''],
    // Bandwidth & Network
    bandwidthId: [null as string | null],
    routerId: [null as string | null],
    poolId: [null as string | null],
    sharedUsers: [1],
    concurrentDevices: [1],
    maxSessions: [1],
    // Validity & Data
    validity: [null as number | null],
    validityUnit: ['days'],
    limitType: ['Unlimited'],
    dataLimit: [null as number | null],
    dataUnit: ['GB'],
    timeLimit: [null as number | null],
    timeUnit: ['hours'],
    // Session
    sessionTimeout: [86400],
    idleTimeout: [600],
  });

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.planId;

    // Load options in parallel
    this.bandwidthApi.getPage(0, 100).subscribe((p) => this.bandwidths.set(p.content));
    this.routerApi.getPage(0, 100).subscribe((p) => this.routers.set(p.content));
    this.poolApi.getPage(0, 200).subscribe((p) => this.pools.set(p.content));

    if (this.isEditMode) {
      this.planApi.getById(this.planId).subscribe((p) => {
        this.form.patchValue(p as never);
        // Load pools filtered by the plan's router
        if (p.routerId) {
          this.poolApi.getPools(p.routerId).subscribe((page) => this.pools.set(page.content));
        }
      });
    }
  }

  onRouterChange(routerId: string | null): void {
    this.form.patchValue({ poolId: null });
    if (routerId) {
      this.poolApi.getPools(routerId).subscribe((p) => this.pools.set(p.content));
    } else {
      this.poolApi.getPage(0, 200).subscribe((p) => this.pools.set(p.content));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const value = this.form.value as never;
    const call = this.isEditMode
      ? this.planApi.update(this.planId, value)
      : this.planApi.create(value);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Plan ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/plans']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}
