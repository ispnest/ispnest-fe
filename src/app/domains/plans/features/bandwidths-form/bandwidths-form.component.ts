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
import { BandwidthApiService } from '@/app/domains/plans/data';

function toKbps(rate: number, unit: string): number {
  if (!rate || rate <= 0) return 0;
  return unit === 'Mbps' ? rate * 1024 : rate;
}

function pct(value: number, percent: number): number {
  return Math.floor((value * percent) / 100);
}

function fmt(kbps: number): string {
  if (kbps % 1024 === 0) return kbps / 1024 + ' Mbps';
  return kbps + ' Kbps';
}

@Component({
  selector: 'app-bandwidths-form',
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
        <a matIconButton routerLink="/admin/bandwidths">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Bandwidth' : 'New Bandwidth' }}
          </h1>
          <p class="text-sm text-neutral-a11">MikroTik bandwidth profile</p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-8 p-6">

          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Profile Details</h2>
              <p class="mt-1 text-sm text-neutral-a11">Name and speed limits for this bandwidth profile.</p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">

              <mat-form-field class="sm:col-span-full">
                <mat-label>Profile Name</mat-label>
                <input matInput formControlName="name" required placeholder="e.g. 10Mbps Standard" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Download Rate</mat-label>
                <input matInput type="number" formControlName="rateDown" min="1" required />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Download Unit</mat-label>
                <mat-select formControlName="rateDownUnit">
                  <mat-option value="Mbps">Mbps</mat-option>
                  <mat-option value="Kbps">Kbps</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Upload Rate</mat-label>
                <input matInput type="number" formControlName="rateUp" min="1" required />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Upload Unit</mat-label>
                <mat-select formControlName="rateUpUnit">
                  <mat-option value="Mbps">Mbps</mat-option>
                  <mat-option value="Kbps">Kbps</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Burst %</mat-label>
                <input matInput type="number" formControlName="burstPercent" min="100" required />
                <mat-hint>Minimum 100% — e.g. 150 = 1.5× max rate</mat-hint>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Limit-at (CIR) %</mat-label>
                <input matInput type="number" formControlName="guaranteedPercent" min="0" max="100" required />
                <mat-hint>0–100% of base rate guaranteed</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <!-- Live Preview -->
          <div class="rounded-xl border border-neutral-a6 bg-neutral-a2 p-4">
            <p class="mb-1 text-xs font-bold uppercase tracking-widest text-neutral-a11">Computed MikroTik Profile</p>
            <p class="font-mono text-sm text-neutral-a12">{{ profilePreview() }}</p>
          </div>

          @if (errorMessage()) {
            <div class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11">
              <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
              {{ errorMessage() }}
            </div>
          }

          <div class="flex justify-end gap-3 border-t border-neutral-a6 pt-4">
            <a matButton class="tertiary" routerLink="/admin/bandwidths">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEditMode ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class BandwidthsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bandwidthApi = inject(BandwidthApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  isEditMode = false;
  bandwidthId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    rateDown: [10, [Validators.required, Validators.min(1)]],
    rateDownUnit: ['Mbps', Validators.required],
    rateUp: [10, [Validators.required, Validators.min(1)]],
    rateUpUnit: ['Mbps', Validators.required],
    burstPercent: [150, [Validators.required, Validators.min(100)]],
    guaranteedPercent: [40, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  readonly profilePreview = computed(() => {
    const v = this.form.value;
    const down = Number(v.rateDown);
    const up = Number(v.rateUp);
    const burst = Number(v.burstPercent);
    const cir = Number(v.guaranteedPercent);
    if (!down || !up || !burst || isNaN(cir) || down <= 0 || up <= 0) {
      return 'Fill in the rates above to see the computed profile.';
    }
    const downKbps = toKbps(down, v.rateDownUnit ?? 'Mbps');
    const upKbps = toKbps(up, v.rateUpUnit ?? 'Mbps');
    const cirDown = pct(downKbps, cir);
    const cirUp = pct(upKbps, cir);
    const burstDown = pct(downKbps, burst);
    const burstUp = pct(upKbps, burst);
    return (
      `max-limit=${fmt(downKbps)}/${fmt(upKbps)}, ` +
      `limit-at=${fmt(cirDown)}/${fmt(cirUp)} (${cir}%), ` +
      `burst-limit=${fmt(burstDown)}/${fmt(burstUp)} (${burst}%), ` +
      `threshold=75%, burst-time=20s`
    );
  });

  ngOnInit(): void {
    this.bandwidthId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.bandwidthId;
    if (this.isEditMode) {
      this.bandwidthApi.getById(this.bandwidthId).subscribe(bw => {
        // rateDown/rateUp are stored in Kbps after backend processing; display them as-is
        this.form.patchValue({
          name: bw.name,
          rateDown: bw.rateDown,
          rateDownUnit: bw.rateDownUnit,
          rateUp: bw.rateUp,
          rateUpUnit: bw.rateUpUnit,
          // Derive percentages from stored values
          burstPercent: bw.burstDown && bw.rateDown
            ? Math.round((bw.burstDown / bw.rateDown) * 100)
            : 150,
          guaranteedPercent: bw.guaranteedDown && bw.rateDown
            ? Math.round((bw.guaranteedDown / bw.rateDown) * 100)
            : 40,
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const v = this.form.value;
    const payload = {
      name: v.name!,
      rateDown: Number(v.rateDown),
      rateDownUnit: v.rateDownUnit!,
      rateUp: Number(v.rateUp),
      rateUpUnit: v.rateUpUnit!,
      burstPercent: Number(v.burstPercent),
      guaranteedPercent: Number(v.guaranteedPercent),
    };
    const call = this.isEditMode
      ? this.bandwidthApi.update(this.bandwidthId, payload)
      : this.bandwidthApi.create(payload);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Bandwidth ${this.isEditMode ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/bandwidths']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}

