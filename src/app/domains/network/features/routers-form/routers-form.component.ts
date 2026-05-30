import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { extractErrorMessage } from '@/app/core/http/api-errors';
import { RouterApiService } from '@/app/domains/network/data';

/**
 * Edit-only router form (path `/admin/routers/:id/edit`). New routers go through the
 * onboarding wizard at `/admin/routers/new` — this form mirrors its identity step exactly:
 *
 *  - **Name** and **description** are required.
 *  - **Coordinates** are optional (used by the coverage map only).
 *  - Connection credentials are NOT edited here. The WireGuard tunnel owns the management IP,
 *    and credential rotation goes through the "Re-onboard" action.
 *
 * Submitting POSTs `PUT /api/routers/{id}` with only the three identity fields; the backend
 * leaves everything else untouched.
 */
@Component({
  selector: 'app-routers-form',
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
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/routers" aria-label="Back to routers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Edit router</h1>
          <p class="text-sm text-neutral-a11">
            Update how this router shows up in dashboards. Connection details and credentials are
            managed by the
            <a
              class="underline"
              [routerLink]="['/admin/routers', routerId]"
              [queryParams]="{ reonboard: 1 }"
              >re-onboard flow</a
            >.
          </p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-8 p-6">
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Identity</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Name and description are required. Coordinates are optional but help operations find
                the device on the coverage map.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-full">
                <mat-label>Router name</mat-label>
                <input matInput formControlName="name" required autocomplete="off" />
                <mat-hint>Must be unique — shown on the routers list.</mat-hint>
              </mat-form-field>

              <mat-form-field class="sm:col-span-full">
                <mat-label>Description</mat-label>
                <input matInput formControlName="description" required />
              </mat-form-field>

              <mat-form-field class="sm:col-span-full">
                <mat-label>Coordinates (optional)</mat-label>
                <input matInput formControlName="coordinates" placeholder="-1.2634, 36.8032" />
                <mat-hint>Latitude, longitude. Leave blank to skip.</mat-hint>
              </mat-form-field>
            </div>
          </div>

          @if (errorMessage()) {
            <div
              class="flex items-start gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
            >
              <mat-icon class="size-4 shrink-0 mt-0.5" svgIcon="circle-alert" />
              <span class="flex-1">{{ errorMessage() }}</span>
            </div>
          }

          <mat-divider />

          <div class="flex justify-end gap-3">
            <a matButton class="tertiary" routerLink="/admin/routers">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class RoutersFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  routerId = '';

  /** Snapshot of the loaded router — preserved so PUT requests retain connection fields. */
  private existing: {
    nasType?: string;
    ipAddress?: string;
    username?: string;
  } = {};

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(2)]],
    coordinates: ['', [Validators.pattern(/^\s*$|^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/)]],
  });

  ngOnInit(): void {
    this.routerId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.routerId) {
      this.router.navigate(['/admin/routers']);
      return;
    }
    this.routerApi.getById(this.routerId).subscribe({
      next: (r) => {
        this.existing = {
          nasType: r.nasType,
          ipAddress: r.ipAddress,
          username: r.username,
        };
        this.form.patchValue({
          name: r.name,
          description: r.description ?? '',
          coordinates: r.coordinates ?? '',
        });
      },
      error: (err) => this.errorMessage.set(extractErrorMessage(err, 'Could not load router')),
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Please fix the highlighted fields and try again.');
      return;
    }
    this.saving.set(true);
    this.errorMessage.set('');

    const v = this.form.getRawValue();
    // PUT requires the full CreateRouterRequest shape; we preserve the saved connection fields
    // so editing identity never accidentally blanks the management IP / NAS type / username.
    const payload = {
      name: v.name!.trim(),
      description: v.description!.trim(),
      coordinates: (v.coordinates ?? '').trim() || null,
      nasType: this.existing.nasType ?? 'mikrotik',
      ipAddress: this.existing.ipAddress,
      username: this.existing.username,
    };

    this.routerApi.update(this.routerId, payload as never).subscribe({
      next: () => {
        this.snackBar.open('Router updated', 'OK', { duration: 3000 });
        this.router.navigate(['/admin/routers', this.routerId]);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Could not save the router'));
      },
    });
  }
}
