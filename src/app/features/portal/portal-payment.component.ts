import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlanApiService } from '../../core/api/plan-api.service';
import { PaymentApiService } from '../../core/api/payment-api.service';
import { CustomerApiService } from '../../core/api/customer-api.service';
import { PlanDto } from '../../core/models/plan.model';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-portal-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, LoadingComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="bg-blue-600 text-white px-4 py-4">
        <div class="max-w-lg mx-auto flex items-center gap-3">
          <a routerLink="/portal/dashboard" mat-icon-button class="text-white">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="font-bold text-lg">Make Payment</h1>
        </div>
      </div>

      <div class="max-w-lg mx-auto px-4 py-6 space-y-4">
        <app-loading [loading]="loading()" />
        @if (!loading() && plan()) {
          <!-- Plan summary -->
          <mat-card class="p-4">
            <h2 class="font-semibold mb-2">Payment Summary</h2>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-500">Plan:</span>
              <span class="font-medium">{{ plan()!.name }}</span>
            </div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-500">Validity:</span>
              <span>{{ plan()!.validity }} {{ plan()!.validityUnit }}</span>
            </div>
            <div class="flex justify-between font-bold text-base mt-2 pt-2 border-t">
              <span>Total</span>
              <span class="text-blue-600">KES {{ plan()!.price | number:'1.2-2' }}</span>
            </div>
          </mat-card>

          <!-- Payment form -->
          <mat-card class="p-4">
            <h2 class="font-semibold mb-4">M-Pesa Payment</h2>
            <form [formGroup]="form" (ngSubmit)="pay()" class="space-y-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>M-Pesa Phone Number</mat-label>
                <mat-icon matPrefix>phone</mat-icon>
                <input matInput formControlName="phoneNumber" placeholder="07XXXXXXXX">
                <mat-hint>You'll receive an STK push to this number</mat-hint>
              </mat-form-field>

              @if (errorMessage()) {
                <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {{ errorMessage() }}
                </div>
              }

              <button mat-flat-button color="primary" type="submit" class="w-full"
                      [disabled]="form.invalid || paying()">
                {{ paying() ? 'Initiating payment…' : 'Pay KES ' + (plan()!.price | number:'1.0-0') }}
              </button>
            </form>
          </mat-card>
        }
      </div>
    </div>
  `
})
export class PortalPaymentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planApi = inject(PlanApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly customerApi = inject(CustomerApiService);

  readonly loading = signal(true);
  readonly paying = signal(false);
  readonly errorMessage = signal('');
  readonly plan = signal<PlanDto | null>(null);

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^07\d{8}$|^01\d{8}$/)]]
  });

  ngOnInit(): void {
    const customerId = sessionStorage.getItem('portalCustomerId');
    if (!customerId) { this.router.navigate(['/portal']); return; }

    const planId = this.route.snapshot.queryParamMap.get('planId');
    if (planId) {
      this.planApi.getById(planId).subscribe({
        next: p => { this.plan.set(p); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else {
      this.customerApi.getActiveRecharges(customerId).subscribe({
        next: recharges => {
          if (recharges.length > 0 && recharges[0].planId) {
            this.planApi.getById(recharges[0].planId).subscribe(p => { this.plan.set(p); this.loading.set(false); });
          } else {
            this.router.navigate(['/portal/upgrade']);
          }
        },
        error: () => this.router.navigate(['/portal/upgrade'])
      });
    }
  }

  pay(): void {
    if (this.form.invalid || !this.plan()) return;
    const customerId = sessionStorage.getItem('portalCustomerId')!;
    this.paying.set(true);
    this.errorMessage.set('');

    this.paymentApi.initiate({
      customerId,
      planId: this.plan()!.id,
      routerId: this.plan()!.routerId,
      serviceType: 'pppoe',
      provider: 'mpesa',
      currency: 'KES',
      providerParams: { phoneNumber: this.form.value.phoneNumber! }
    }).subscribe({
      next: p => { this.paying.set(false); this.router.navigate(['/portal/status', p.id]); },
      error: (err: any) => { this.paying.set(false); this.errorMessage.set(err?.error?.message ?? 'Payment failed'); }
    });
  }
}

