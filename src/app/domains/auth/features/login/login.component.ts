import { Component, inject, signal, OnInit, computed } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatPrefix, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { of, switchMap } from 'rxjs';
import { AuthService } from '@/app/core/auth/auth.service';
import { Media } from '@/app/core/media';
import { TenancyService } from '@/app/core/tenancy/tenancy.service';
import { normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { PortalApiService } from '@/app/domains/portal/data';

function isAccountCode(value: string): boolean {
  return /^[A-Za-z\-0-9]{3,12}$/.test(value) && !/^(07|01|254|\+254)/.test(value);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Detects login type from identifier value. Returns null when undetermined. */
function detectLoginType(raw: string): 'staff' | 'customer' | null {
  if (!raw) return null;
  if (isEmail(raw)) return 'staff';
  try {
    if (isValidPhoneNumber(raw, 'KE')) return 'customer';
  } catch { /* fall through */ }
  if (isAccountCode(raw)) return 'customer';
  return null;
}

function unifiedIdentifierValidator(control: AbstractControl): ValidationErrors | null {
  const raw: string = (control.value ?? '').trim();
  if (!raw) return null;
  if (detectLoginType(raw) !== null) return null;
  return { invalidIdentifier: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatHint,
    MatInput,
    MatIcon,
    MatIconButton,
  ],
  host: {
    class: 'flex flex-auto flex-col bg-neutral-2',
  },
  template: `
    <div class="flex flex-auto flex-col items-center justify-center sm:p-6">
      <mat-card [appearance]="isMobile() ? 'filled' : 'raised'" class="w-full max-w-lg px-4 py-10 max-sm:bg-transparent sm:px-10">
        <div class="flex items-center gap-x-2.5">
          <img class="size-9 object-contain" src="/img/ispnest-icon.svg" alt="ISPNest" />
          <img class="h-6 object-contain" src="/img/ispnest-logo-text.svg" alt="ISPNest" />
        </div>

        <div class="mt-8 text-4xl font-semibold tracking-tight">Sign in</div>
        <div class="mt-1 text-neutral-a11">
          @if (isApex()) {
            Platform access for operators and super admins
          } @else {
            @if (detectedType() === 'staff') {
              Signing in as <span class="font-medium text-primary-a11">staff</span>
            } @else if (detectedType() === 'customer') {
              Signing in as <span class="font-medium text-primary-a11">customer</span>
            } @else {
              Enter your email, phone number, or account code
            }
          }
        </div>

        @if (errorMessage()) {
          <div class="mt-6 flex items-center gap-x-2 rounded-lg border border-error-a6 bg-error-a3 p-3 text-sm text-error-a11">
            <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="submit()" class="mt-6 flex flex-col gap-y-4">
          <mat-form-field class="w-full">
            <mat-label>Email, phone number, or account code</mat-label>
            <mat-icon matPrefix [svgIcon]="identifierIcon()" />
            <input
              matInput
              formControlName="identifier"
              [placeholder]="isApex() ? 'admin@example.com' : 'email, 07XXXXXXXX, or account code'"
              autocomplete="username"
            />
            @if (detectedType()) {
              <mat-hint>
                @if (detectedType() === 'staff') {
                  <span class="flex items-center gap-1 text-primary-a11">
                    <mat-icon svgIcon="shield-check" class="size-3" />
                    Staff login detected
                  </span>
                } @else {
                  <span class="flex items-center gap-1 text-primary-a11">
                    <mat-icon svgIcon="user-round" class="size-3" />
                    Customer login detected
                  </span>
                }
              </mat-hint>
            }
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix svgIcon="lock-keyhole" />
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="current-password"
            />
            <button type="button" matIconButton matSuffix (click)="showPassword.update((v) => !v)">
              <mat-icon [svgIcon]="showPassword() ? 'eye-off' : 'eye'" />
            </button>
          </mat-form-field>

          <button matButton class="primary large w-full" type="submit" [disabled]="loginForm.invalid || loading()">
            @if (loading()) {
              <ng-container>
                <mat-icon svgIcon="loader-circle" class="animate-spin" />
                <span>Signing in...</span>
              </ng-container>
            } @else {
              <ng-container>
                <mat-icon svgIcon="log-in" />
                <span>Sign In</span>
              </ng-container>
            }
          </button>
        </form>

        <div class="mt-6 border-t border-neutral-a6 pt-4 text-sm text-neutral-a11">
          @if (isApex()) {
            <div class="flex items-center justify-between gap-3">
              <span>Need a tenant workspace?</span>
              <a routerLink="/signup" class="font-medium text-primary underline-offset-2 hover:underline">Create tenant</a>
            </div>
          } @else {
            <div class="flex items-center justify-between gap-3">
              <span>New customer account?</span>
              <a routerLink="/register" class="font-medium text-primary underline-offset-2 hover:underline">Create account</a>
            </div>
          }
        </div>
      </mat-card>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly portalApi = inject(PortalApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tenancy = inject(TenancyService);
  private readonly fb = inject(FormBuilder);
  protected readonly isMobile = inject(Media).match('(width < 40rem)');
  protected readonly isApex = computed(() => this.tenancy.isApex());

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  loginForm = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3), unifiedIdentifierValidator]],
    password: ['', Validators.required],
  });

  readonly detectedType = computed<'staff' | 'customer' | null>(() => {
    const raw: string = (this.loginForm.controls.identifier.value ?? '').trim();
    return detectLoginType(raw);
  });

  readonly identifierIcon = computed(() => {
    switch (this.detectedType()) {
      case 'staff': return 'mail';
      case 'customer': return 'user-round';
      default: return 'user';
    }
  });

  ngOnInit(): void {
    const error = this.route.snapshot.queryParams['error'];
    if (error) {
      this.errorMessage.set(this.route.snapshot.queryParams['error_description'] || error);
    }

    const oauth2Success = this.route.snapshot.queryParams['oauth2_success'];
    if (oauth2Success === 'true') {
      const accessToken = this.route.snapshot.queryParams['access_token'];
      const refreshToken = this.route.snapshot.queryParams['refresh_token'];
      const expiresIn = parseInt(this.route.snapshot.queryParams['expires_in'] || '3600', 10);

      if (accessToken && refreshToken) {
        this.auth.handleOAuth2Callback(accessToken, refreshToken, expiresIn);
        this.router.navigate([this.auth.getPostLoginRedirect()]);
        return;
      }
    }

    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getPostLoginRedirect()]);
      return;
    }

    // Re-validate on identifier changes so detectedType stays in sync
    this.loginForm.controls.identifier.valueChanges.subscribe(() => {
      this.errorMessage.set('');
    });
  }

  submit(): void {
    if (this.loginForm.invalid) return;

    const raw = (this.loginForm.value.identifier ?? '').trim();
    const password = this.loginForm.value.password!;
    const type = detectLoginType(raw);

    if (type === 'staff' || (this.isApex() && type === null)) {
      this.submitStaff(raw, password);
    } else {
      this.submitCustomer(raw, password);
    }
  }

  private submitStaff(email: string, password: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        this.router.navigateByUrl(returnUrl ?? this.auth.getPostLoginRedirect());
      },
      error: (err) => {
        this.loading.set(false);
        const message =
          err.error?.message || err.error?.error_description || 'Login failed. Please try again.';
        this.errorMessage.set(message);
      },
    });
  }

  private submitCustomer(raw: string, password: string): void {
    this.loading.set(true);
    this.errorMessage.set('');


    const phone$ = isAccountCode(raw)
      ? this.portalApi.resolveAccountCode(raw).pipe(switchMap((res) => of(res.phoneNumber)))
      : of(normalizeKenyanPhone(raw));

    phone$.pipe(switchMap((phone) => this.auth.login(phone, password))).subscribe({
      next: (user) => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (user.forcePasswordChange) {
          this.router.navigate(['/portal/settings']);
        } else if (returnUrl && returnUrl.startsWith('/portal')) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['/portal/dashboard']);
        }
      },
      error: (err: { status?: number; error?: { message?: string; error_description?: string } }) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('Invalid credentials. Please check your details and try again.');
        } else if (err.status === 404) {
          this.errorMessage.set('Account code not found. Please check and try again.');
        } else {
          this.errorMessage.set(
            err.error?.message || err.error?.error_description || 'Login failed. Please try again.',
          );
        }
      },
    });
  }
}
