import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { extractErrorMessage } from '@/app/core/http/api-errors';
import {
  RouterApiService,
  PoolApiService,
  computePool,
  CIDR_OPTIONS,
} from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data/network.model';

/** Validates a bare IPv4 address (e.g. 10.0.0.0 or 10.0.0.*). No CIDR suffix allowed. */
function ipAddressValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = (control.value ?? '').trim();
  if (!value) return null; // let required handle empty
  // reject if it contains a slash (don't let user type CIDR here)
  if (value.includes('/'))
    return { invalidIp: 'Do not include the CIDR here — select it separately below.' };
  const normalized = value.replace(/\*/g, '0');
  const parts = normalized.split('.');
  if (parts.length !== 4) return { invalidIp: true };
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (isNaN(n) || n < 0 || n > 255 || String(n) !== p) return { invalidIp: true };
  }
  return null;
}

@Component({
  selector: 'app-pools-form',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/pools">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Pool' : isAddingRouter ? 'Add Router to Pool' : 'New Pool' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{
              isAddingRouter
                ? 'Assign an additional router to an existing pool name with its own CIDR range.'
                : 'IP address pool for a router'
            }}
          </p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-8 p-6">
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Pool Details</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Enter the network IP and CIDR — the pool range will be auto-computed.
              </p>
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
                <input matInput formControlName="networkIp" placeholder="e.g. 10.10.10.0" />
                <mat-hint>Enter the network address only — CIDR is selected below</mat-hint>
                @if (
                  form.get('networkIp')?.hasError('required') && form.get('networkIp')?.touched
                ) {
                  <mat-error>Network IP is required</mat-error>
                } @else if (
                  form.get('networkIp')?.hasError('invalidIp') && form.get('networkIp')?.touched
                ) {
                  <mat-error>
                    {{
                      form.get('networkIp')?.getError('invalidIp') === true
                        ? 'Enter a valid IPv4 address (e.g. 10.10.10.0)'
                        : form.get('networkIp')?.getError('invalidIp')
                    }}
                  </mat-error>
                }
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>CIDR</mat-label>
                <mat-select formControlName="cidr">
                  <mat-option value="">— Select —</mat-option>
                  @for (opt of cidrOptions; track opt.value) {
                    <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                  }
                </mat-select>
                @if (form.get('cidr')?.hasError('required') && form.get('cidr')?.touched) {
                  <mat-error>Please select a CIDR prefix</mat-error>
                }
              </mat-form-field>

              @if (computed_localIp) {
                <div class="sm:col-span-3 flex flex-col gap-1">
                  <p class="text-xs font-medium text-neutral-a11">
                    Local IP <span class="text-neutral-a9">(auto-generated)</span>
                  </p>
                  <p
                    class="rounded-lg border border-neutral-a6 bg-neutral-a2 px-3 py-2 font-mono text-sm"
                  >
                    {{ computed_localIp }}
                  </p>
                </div>
                <div class="sm:col-span-3 flex flex-col gap-1">
                  <p class="text-xs font-medium text-neutral-a11">
                    Range <span class="text-neutral-a9">(auto-generated CIDR)</span>
                  </p>
                  <p
                    class="rounded-lg border border-neutral-a6 bg-neutral-a2 px-3 py-2 font-mono text-sm"
                  >
                    {{ computed_range }}
                  </p>
                </div>
              }

              <div class="sm:col-span-full flex justify-end gap-3 border-t border-neutral-a6 pt-4">
                <a matButton class="tertiary" routerLink="/admin/pools">Cancel</a>
                <button
                  class="primary"
                  matButton
                  type="submit"
                  [disabled]="form.invalid || saving()"
                >
                  {{ saving() ? 'Saving…' : isEditMode ? 'Update' : 'Create' }}
                </button>
              </div>
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
  isAddingRouter = false;
  poolId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    routerId: ['', Validators.required],
    networkIp: ['', [Validators.required, ipAddressValidator]],
    cidr: [24 as number | string, Validators.required],
  });

  get _poolComputed(): { localIp: string; range: string } | null {
    const v = this.form.getRawValue();
    const cidr = typeof v.cidr === 'string' ? parseInt(v.cidr, 10) : (v.cidr ?? 0);
    return computePool(v.networkIp ?? '', cidr);
  }

  get computed_localIp(): string {
    return this._poolComputed?.localIp ?? '';
  }

  get computed_range(): string {
    return this._poolComputed?.range ?? '';
  }

  ngOnInit(): void {
    this.routerApi.getPage(0, 100).subscribe((p) => this.routers.set(p.content));
    this.poolId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.poolId;

    // Pre-fill pool name when coming from "Add Router to Pool" action on the pools list
    const prefilledName = this.route.snapshot.queryParamMap.get('name');
    if (prefilledName) {
      this.form.patchValue({ name: prefilledName });
      this.form.get('name')?.disable();
      this.isAddingRouter = true;
    }

    // Pre-fill router when coming from the router detail page "Add pool" action
    const prefilledRouterId = this.route.snapshot.queryParamMap.get('routerId');
    if (prefilledRouterId) {
      this.form.patchValue({ routerId: prefilledRouterId });
    }

    if (this.isEditMode) {
      this.poolApi.getById(this.poolId).subscribe((pool) => {
        // Parse rangeIp (e.g. "10.0.0.1/24") back into networkIp + cidr
        let networkIp = '';
        let cidr: number | string = 24;
        if (pool.rangeIp) {
          const [ipPart, cidrPart] = pool.rangeIp.split('/');
          // Reconstruct the network address from localIp or rangeIp base
          networkIp = ipPart ?? '';
          cidr = cidrPart ? parseInt(cidrPart, 10) : 24;
        }
        this.form.patchValue({ name: pool.name, routerId: pool.routerId, networkIp, cidr });
        // Disable router in edit mode — changing router requires delete + create
        this.form.get('routerId')?.disable();
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const v = this.form.getRawValue(); // getRawValue includes disabled controls
    const computed = this._poolComputed;
    if (!computed) {
      this.saving.set(false);
      this.errorMessage.set('Could not compute IP range — please check the network IP and CIDR.');
      return;
    }
    const payload = {
      name: v.name!,
      routerId: v.routerId!,
      localIp: computed.localIp,
      rangeIp: computed.range,
    };
    const call = this.isEditMode
      ? this.poolApi.update(this.poolId, payload)
      : this.poolApi.create(payload);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Pool ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/pools']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Could not save the pool'));
      },
    });
  }
}
