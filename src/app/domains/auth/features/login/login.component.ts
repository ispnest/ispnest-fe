import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCard, MatButton, MatIconButton, MatFormField, MatLabel, MatSuffix, MatInput, MatIcon],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-blue-900 p-4">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="mb-8 text-center">
          <div class="mb-4 flex items-center justify-center">
            <img src="/img/ispnest-icon.svg" alt="ISPNest" class="size-16 object-contain" />
          </div>
          <img src="/img/ispnest-logo.svg" alt="ISPNest" class="mx-auto h-8 object-contain" />
          <p class="mt-2 text-sm text-slate-400">Sign in to your account</p>
        </div>

        <mat-card class="px-8 py-10">
          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
            <mat-form-field class="w-full">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix svgIcon="user-round" />
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix svgIcon="lock-keyhole" />
              <input matInput [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password" autocomplete="current-password" />
              <button type="button" matIconButton matSuffix (click)="showPassword.update(v => !v)">
                <mat-icon [svgIcon]="showPassword() ? 'eye-off' : 'eye'" />
              </button>
            </mat-form-field>

            @if (errorMessage()) {
              <div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3
                          text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                {{ errorMessage() }}
              </div>
            }

            <button class="primary mt-2 w-full" matButton type="submit"
                    [disabled]="form.invalid || loading()">
              {{ loading() ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>
        </mat-card>

        <p class="mt-6 text-center text-sm text-slate-400">
          Not a customer?
          <a routerLink="/" class="text-blue-400 hover:text-blue-300">Visit Homepage</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/admin']); },
      error: () => { this.loading.set(false); this.errorMessage.set('Invalid username or password'); },
    });
  }
}





