import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <img src="/img/ispnest-icon.svg" alt="ISPNest" class="w-16 h-16 object-contain"
                 onerror="this.outerHTML='<div class=&quot;w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center&quot;><span class=&quot;text-white text-2xl font-bold&quot;>I</span></div>'">
          </div>
          <img src="/img/ispnest-logo.svg" alt="ISPNest" class="h-8 mx-auto object-contain"
               onerror="this.outerHTML='<h1 class=&quot;text-2xl font-bold text-white&quot;>ISPNest Admin</h1>'">
          <p class="text-slate-400 text-sm mt-2">Sign in to your account</p>
        </div>

        <mat-card class="p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" autocomplete="username">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
              <button type="button" mat-icon-button matSuffix (click)="showPassword.update(v => !v)">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                <mat-icon class="text-red-500 text-base">error_outline</mat-icon>
                {{ errorMessage() }}
              </div>
            }

            <button mat-flat-button color="primary" type="submit" class="w-full py-3"
                    [disabled]="form.invalid || loading()">
              {{ loading() ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>
        </mat-card>

        <p class="text-center text-slate-400 text-sm mt-6">
          Not a customer?
          <a routerLink="/" class="text-blue-400 hover:text-blue-300">Visit Homepage</a>
        </p>
      </div>
    </div>
  `
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
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid username or password');
      }
    });
  }
}


