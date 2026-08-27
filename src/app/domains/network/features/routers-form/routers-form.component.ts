import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterApiService } from '@/app/domains/network/data';

/**
 * Edit-only — a router is only ever created through the self-service onboarding wizard (see
 * `router-onboarding-wizard.component.ts`), which also collects the provisioning profile the
 * bootstrap script needs. This form only edits identity fields (name, NAS type, RADIUS secret,
 * description, coordinates) after the fact.
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
    MatSelect,
    MatOption,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/routers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Edit Router</h1>
          <p class="text-sm text-neutral-a11">Update this router's identity details</p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-10 p-6">
          <!-- Section: Identity -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Identity</h2>
              <p class="mt-1 text-sm text-neutral-a11">Name, type, and RADIUS shared secret.</p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-3">
                <mat-label>Router Name</mat-label>
                <input matInput formControlName="name" required />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>NAS Type</mat-label>
                <mat-select formControlName="nasType">
                  <mat-option value="mikrotik">MikroTik</mat-option>
                  <mat-option value="cisco">Cisco</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-full">
                <mat-label>RADIUS Shared Secret</mat-label>
                <input matInput type="password" formControlName="secret" required />
                <mat-hint>Must match the secret configured on the router's RADIUS client</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <mat-divider />

          <!-- Section: Details -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Details</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Optional description and location information.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-full">
                <mat-label>Description</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-full">
                <mat-label>Coordinates</mat-label>
                <input matInput formControlName="coordinates" placeholder="-1.234, 36.789" />
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
            <a matButton class="tertiary" routerLink="/admin/routers">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Update Router' }}
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

  form = this.fb.group({
    name: ['', Validators.required],
    secret: ['', Validators.required],
    nasType: ['mikrotik', Validators.required],
    description: [''],
    coordinates: [''],
  });

  ngOnInit(): void {
    this.routerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.routerApi.getById(this.routerId).subscribe((r) => this.form.patchValue(r as never));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.value as never;

    this.routerApi.update(this.routerId, value).subscribe({
      next: () => {
        this.snackBar.open('Router updated', 'OK', { duration: 3000 });
        this.router.navigate(['/admin/routers']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}
