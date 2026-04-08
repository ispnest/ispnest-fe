import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterApiService, PoolApiService } from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data/network.model';

function numToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function computePool(rawIp: string, cidr: number): { localIp: string; range: string } | null {
  if (!rawIp || isNaN(cidr) || cidr < 1 || cidr > 30) return null;
  const ip = rawIp.replace(/\*/g, '0');
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
  const ipNum = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const localIp = (network + 1) >>> 0;
  const rangeEnd = (broadcast - 1) >>> 0;
  if (localIp > rangeEnd) return null;
  const localIpText = numToIp(localIp);
  return { localIp: localIpText, range: `${localIpText}/${cidr}` };
}

const CIDR_OPTIONS = [
  { value: 30, label: '/30 — 2 hosts' },
  { value: 29, label: '/29 — 6 hosts' },
  { value: 28, label: '/28 — 14 hosts' },
  { value: 27, label: '/27 — 30 hosts' },
  { value: 26, label: '/26 — 62 hosts' },
  { value: 25, label: '/25 — 126 hosts' },
  { value: 24, label: '/24 — 254 hosts' },
  { value: 23, label: '/23 — 510 hosts' },
  { value: 22, label: '/22 — 1022 hosts' },
  { value: 21, label: '/21 — 2046 hosts' },
  { value: 20, label: '/20 — 4094 hosts' },
  { value: 16, label: '/16 — 65534 hosts' },
];

@Component({
  selector: 'app-pools-form',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatFormField, MatLabel, MatHint, MatInput, MatSelect, MatOption,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/pools">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Pool' : 'New Pool' }}
          </h1>
          <p class="text-sm text-neutral-a11">IP address pool for a router</p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-8 p-6">

          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Pool Details</h2>
              <p class="mt-1 text-sm text-neutral-a11">Enter the network IP and CIDR — the pool range will be auto-computed.</p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">

              <mat-form-field class="sm:col-span-3">
                <mat-label>Pool Name</mat-label>
                <input matInput formControlName="name" required placeholder="e.g. PPPoE-Pool-1" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Router</mat-label>
                <mat-select formControlName="routerId" required>
                  <mat-option value="">— Select —</mat-option>
                  @for (r of routers(); track r.id) {
                    <mat-option [value]="r.id">{{ r.name }} ({{ r.ipAddress }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Network IP</mat-label>
                <input matInput formControlName="networkIp" placeholder="10.10.10.0 or 10.10.10.*" />
                <mat-hint>Used to auto-generate the range</mat-hint>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>CIDR</mat-label>
                <mat-select formControlName="cidr">
                  <mat-option value="">— Select —</mat-option>
                  @for (opt of cidrOptions; track opt.value) {
                    <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Auto-generated fields -->
              @if (computed_localIp()) {
                <div class="sm:col-span-3 flex flex-col gap-1">
                  <p class="text-xs font-medium text-neutral-a11">Local IP <span class="text-neutral-a9">(auto-generated)</span></p>
                  <p class="rounded-lg border border-neutral-a6 bg-neutral-a2 px-3 py-2 font-mono text-sm">{{ computed_localIp() }}</p>
                </div>
                <div class="sm:col-span-3 flex flex-col gap-1">
                  <p class="text-xs font-medium text-neutral-a11">Range <span class="text-neutral-a9">(auto-generated CIDR)</span></p>
                  <p class="rounded-lg border border-neutral-a6 bg-neutral-a2 px-3 py-2 font-mono text-sm">{{ computed_range() }}</p>
                </div>
              }

              <mat-form-field class="sm:col-span-full">
                <mat-label>Description (optional)</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11">
              <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
              {{ errorMessage() }}
            </div>
          }

          <div class="flex justify-end gap-3 border-t border-neutral-a6 pt-4">
            <a matButton class="tertiary" routerLink="/admin/pools">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEditMode ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class PoolsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly poolApi = inject(PoolApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly routers = signal<RouterDto[]>([]);
  readonly cidrOptions = CIDR_OPTIONS;
  isEditMode = false;
  poolId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    routerId: ['', Validators.required],
    networkIp: [''],
    cidr: [24 as number | string],
    description: [''],
  });

  readonly _poolComputed = computed(() => {
    const v = this.form.value;
    const cidr = typeof v.cidr === 'string' ? parseInt(v.cidr, 10) : (v.cidr ?? 0);
    return computePool(v.networkIp ?? '', cidr);
  });

  get computed_localIp(): () => string {
    return () => this._poolComputed()?.localIp ?? '';
  }

  get computed_range(): () => string {
    return () => this._poolComputed()?.range ?? '';
  }

  ngOnInit(): void {
    this.routerApi.getPage(0, 100).subscribe(p => this.routers.set(p.content));
    this.poolId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.poolId;
    if (this.isEditMode) {
      this.poolApi.getById(this.poolId).subscribe(pool => {
        this.form.patchValue({
          name: pool.name,
          routerId: pool.routerId,
          description: pool.description,
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const v = this.form.value;
    // Use computed range if available, otherwise fall back to manually entered ranges
    const ranges = this._poolComputed()?.range ?? '';
    if (!ranges) {
      this.saving.set(false);
      this.errorMessage.set('Please enter a valid network IP and CIDR to generate the IP range.');
      return;
    }
    const payload = {
      name: v.name!,
      routerId: v.routerId!,
      ranges,
      description: v.description ?? undefined,
    };
    const call = this.isEditMode
      ? this.poolApi.update(this.poolId, payload)
      : this.poolApi.create(payload);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Pool ${this.isEditMode ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/pools']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}

