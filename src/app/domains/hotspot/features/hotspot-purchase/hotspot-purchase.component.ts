import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent } from '@/app/ui/loading';
import { HotspotApiService } from '@/app/domains/hotspot/data';

@Component({
  selector: 'app-hotspot-purchase',
  standalone: true,
  imports: [ReactiveFormsModule, MatCard, MatButton, MatIcon, MatFormField, MatLabel, MatInput, LoadingComponent],
  template: `
    <div class="min-h-screen bg-linear-to-br from-indigo-900 to-blue-800 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="mb-6 text-center">
          <mat-icon svgIcon="wifi" class="mb-2 size-12 text-white" />
          <h1 class="text-xl font-bold text-white">Complete Purchase</h1>
          <p class="text-sm text-blue-200">Enter your phone number to pay via M-Pesa</p>
        </div>

        <mat-card class="p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <mat-form-field class="w-full">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="07XXXXXXXX" autocomplete="tel" />
            </mat-form-field>

            @if (errorMessage()) {
              <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {{ errorMessage() }}
              </div>
            }

            <button class="primary w-full" matButton type="submit" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Processing…' : 'Pay with M-Pesa' }}
            </button>
          </form>
        </mat-card>
      </div>
    </div>
  `,
})
export class HotspotPurchaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly hotspotApi = inject(HotspotApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^07\d{8}$|^01\d{8}$|^\+254\d{9}$/)]],
  });

  planId = '';
  queryParams: Record<string, string> = {};

  ngOnInit(): void {
    this.planId = this.route.snapshot.queryParamMap.get('planId') ?? '';
    const snap = this.route.snapshot.queryParams;
    this.queryParams = { ...snap };
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.hotspotApi.purchase({
      phoneNumber: this.form.value.phoneNumber!,
      planId: this.planId,
      mac: this.queryParams['mac'],
      serverIp: this.queryParams['serverIp'],
      chapId: this.queryParams['chapId'],
      chapChallenge: this.queryParams['chapChallenge'],
    }).subscribe({
      next: resp => {
        this.loading.set(false);
        this.router.navigate(['/hotspot/status', resp.paymentId]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Payment failed. Please try again.');
      },
    });
  }
}

