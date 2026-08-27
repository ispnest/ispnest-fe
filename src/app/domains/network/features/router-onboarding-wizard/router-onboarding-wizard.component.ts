import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStep, MatStepper, MatStepperPrevious } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';
import { RouterApiService, RouterOnboardingApiService } from '@/app/domains/network/data';
import { BootstrapCommandComponent } from '@/app/domains/network/features/router-onboarding/bootstrap-command.component';
import { RouterActivityTerminalComponent } from '@/app/domains/network/features/router-onboarding/router-activity-terminal.component';

const TERMINAL_SUCCESS_STATES = new Set(['SYNCED']);
const MANAGEMENT_READY_STATES = new Set([
  'ONBOARDED',
  'RECONCILING',
  'SYNCED',
  'OUT_OF_SYNC',
  'DEGRADED',
]);

@Component({
  selector: 'app-router-onboarding-wizard',
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
    MatInput,
    MatSelect,
    MatOption,
    MatProgressSpinner,
    MatStepper,
    MatStep,
    MatStepperPrevious,
    BootstrapCommandComponent,
    RouterActivityTerminalComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/routers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Add Router</h1>
          <p class="text-sm text-neutral-a11">
            Self-service onboarding — no need to know the router's IP or MikroTik credentials.
          </p>
        </div>
      </div>

      <mat-card class="p-4 sm:p-6">
        <mat-stepper orientation="vertical" #stepper linear>
          <!-- ── Step 1: Router details ─────────────────────────────────────── -->
          <mat-step [stepControl]="routerForm" label="Router details">
            <form [formGroup]="routerForm" class="flex flex-col gap-y-4 pt-4">
              <mat-form-field class="w-full">
                <mat-label>Router name</mat-label>
                <input matInput formControlName="name" required placeholder="Nairobi Branch" />
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label>NAS type</mat-label>
                <mat-select formControlName="nasType">
                  <mat-option value="mikrotik">MikroTik</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label>RADIUS shared secret</mat-label>
                <input matInput type="password" formControlName="secret" required />
                <mat-hint>Shared secret configured on the router's RADIUS client</mat-hint>
              </mat-form-field>

              @if (routerError()) {
                <p class="text-sm text-red-a11">{{ routerError() }}</p>
              }

              <div class="flex justify-end pt-2">
                <button
                  matButton
                  class="primary"
                  type="button"
                  [disabled]="routerForm.invalid || creatingRouter() || !!routerId()"
                  (click)="createRouter()"
                >
                  {{ creatingRouter() ? 'Creating…' : routerId() ? 'Created' : 'Next' }}
                  @if (!creatingRouter() && !routerId()) {
                    <mat-icon svgIcon="arrow-right" />
                  }
                </button>
              </div>
            </form>
          </mat-step>

          <!-- ── Step 2: Bootstrap command ───────────────────────────────────── -->
          <mat-step label="Connect your router">
            <div class="flex flex-col gap-y-4 pt-4">
              @if (!issuedToken()) {
                <p class="text-sm text-neutral-a11">
                  Generate a one-time command to paste into your MikroTik RouterOS 7 terminal.
                </p>
                <div class="flex justify-between pt-2">
                  <button matButton class="tertiary" type="button" matStepperPrevious>Back</button>
                  <button
                    matButton
                    class="primary"
                    type="button"
                    [disabled]="issuingToken()"
                    (click)="issueTokenAndAdvance()"
                  >
                    {{ issuingToken() ? 'Generating…' : 'Generate bootstrap command' }}
                  </button>
                </div>
              } @else {
                <p class="text-sm text-neutral-a11">
                  Paste this into your MikroTik RouterOS 7 terminal. Safe to re-run if it fails
                  partway through.
                </p>
                <app-bootstrap-command
                  [token]="issuedToken()!.token"
                  [expiresAt]="issuedToken()!.expiresAt"
                />
                <p class="text-xs text-neutral-a11">Waiting for the router to connect…</p>
                <div class="flex justify-end pt-2">
                  <button matButton class="primary" type="button" (click)="startWatchingProgress()">
                    Continue <mat-icon svgIcon="arrow-right" />
                  </button>
                </div>
              }
            </div>
          </mat-step>

          <!-- ── Step 3: Live progress ───────────────────────────────────────── -->
          <mat-step label="Onboarding progress">
            <div class="flex flex-col gap-y-4 pt-4">
              @if (synced()) {
                <div class="flex flex-col items-center gap-3 py-6 text-center">
                  <div class="flex size-14 items-center justify-center rounded-full bg-green-a3">
                    <mat-icon svgIcon="check-circle" class="size-8 text-green-a11" />
                  </div>
                  <h2 class="text-xl font-semibold tracking-tight">Router Online</h2>
                  <p class="text-sm text-neutral-a11">Status: {{ currentState() }}</p>
                  <a
                    matButton
                    class="primary"
                    [routerLink]="['/admin/routers', routerId(), 'onboarding']"
                  >
                    View router
                  </a>
                </div>
              } @else {
                <div class="flex items-center gap-3">
                  <mat-progress-spinner diameter="24" mode="indeterminate" />
                  <div>
                    <p class="text-sm font-medium">
                      {{
                        managementReady() ? 'Configuring selected services…' : 'Waiting for router…'
                      }}
                    </p>
                    <p class="text-xs text-neutral-a10">Status: {{ currentState() }}</p>
                  </div>
                </div>
              }

              @if (routerId(); as rid) {
                <app-router-activity-terminal
                  [routerId]="rid"
                  maxHeight="20rem"
                  (activityRecorded)="currentState.set($event.toState)"
                />
              } @else {
                <p class="text-sm text-neutral-a11">
                  No activity yet — run the bootstrap command on your router to begin.
                </p>
              }
            </div>
          </mat-step>
        </mat-stepper>
      </mat-card>
    </div>
  `,
})
export class RouterOnboardingWizardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly routerApi = inject(RouterApiService);
  private readonly onboardingApi = inject(RouterOnboardingApiService);
  private readonly snackBar = inject(MatSnackBar);

  // Step 1
  readonly routerId = signal<string | null>(null);
  readonly creatingRouter = signal(false);
  readonly routerError = signal('');
  routerForm = this.fb.group({
    name: ['', Validators.required],
    secret: ['', Validators.required],
    nasType: ['mikrotik', Validators.required],
  });

  // Step 2
  readonly issuingToken = signal(false);
  readonly issuedToken = signal<{ token: string; expiresAt: string } | null>(null);

  // Step 3
  readonly currentState = signal('NEW');
  readonly synced = computed(() => TERMINAL_SUCCESS_STATES.has(this.currentState()));
  readonly managementReady = computed(() => MANAGEMENT_READY_STATES.has(this.currentState()));

  createRouter(): void {
    if (this.routerForm.invalid) return;
    this.creatingRouter.set(true);
    this.routerError.set('');
    const value = this.routerForm.getRawValue();
    this.routerApi
      .create({ name: value.name!, secret: value.secret!, nasType: value.nasType! })
      .subscribe({
        next: (router) => {
          this.creatingRouter.set(false);
          this.routerId.set(router.id);
          this.routerForm.disable();
          this.stepperRef?.next();
        },
        error: (err: { error?: { message?: string } }) => {
          this.creatingRouter.set(false);
          this.routerError.set(err?.error?.message ?? 'Failed to create router');
        },
      });
  }

  issueTokenAndAdvance(): void {
    const routerId = this.routerId();
    if (!routerId) return;
    this.issuingToken.set(true);
    this.onboardingApi.issueOnboardingToken(routerId).subscribe({
      next: (issued) => {
        this.issuingToken.set(false);
        this.issuedToken.set(issued);
      },
      error: () => {
        this.issuingToken.set(false);
        this.snackBar.open('Failed to generate bootstrap command', 'Close', { duration: 3000 });
      },
    });
  }

  startWatchingProgress(): void {
    // The @if (routerId(); as rid) block in step 3's template starts the shared terminal's own
    // resync + SSE subscribe the moment it renders — nothing to kick off here beyond advancing.
    this.stepperRef?.next();
  }

  /**
   * Step transitions that depend on an async result (create router, save profile, issue token)
   * call `.next()` on this directly rather than relying on `matStepperNext`'s purely-local
   * (form-validity-only) advance check.
   */
  @ViewChild('stepper') private stepperRef?: MatStepper;
}
