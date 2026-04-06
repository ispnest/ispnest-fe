import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingComponent } from '@/app/ui/loading';
import { CustomerApiService } from '@/app/domains/customers/data';
import { PaymentApiService } from '@/app/domains/payments/data';
import { PlanApiService } from '@/app/domains/plans/data';
import { PlanDto } from '@/app/domains/plans/data';

@Component({
  selector: 'app-portal-payment',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule, DecimalPipe,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatFormField, MatLabel, MatHint, MatInput,
    LoadingComponent,
  ],
  template: `
    <div class="min-h-screen bg-neutral-a2">
      <div class="bg-blue-600 px-4 py-4 text-white">
        <div class="mx-auto flex max-w-lg items-center gap-3">
          <a matIconButton routerLink="/portal/dashboard" class="text-white">
            <mat-icon svgIcon="arrow-left" />
          </a>
          <h1 class="text-lg font-bold">Make Payment</h1>
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-4 px-4 py-6">
        <app-loading [loading]="loading()" />

        @if (!loading() && plan()) {
          <mat-card class="p-4">
            <h2 class="mb-2 font-semibold">Payment Summary</h2>
            <dl class="space-y-1 text-sm">
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Plan</dt>
                <dd class="font-medium">{{ plan()!.name }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Validity</dt>
                <dd>{{ plan()!.validity }} {{ plan()!.validityUnit }}</dd>
              </div>
            </dl>
            <div class="mt-2 flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span class="text-primary-a11">KES {{ plan()!.price | number:'1.2-2' }}</span>
            </div>
          </mat-card>

          <mat-card class="p-4">
            <h2 class="mb-4 font-semibold">M-Pesa Payment</h2>
            <form [formGroup]="form" (ngSubmit)="pay()" class="flex flex-col gap-y-4">
              <mat-form-field class="w-full">
                <mat-label>M-Pesa Phone Number</mat-label>
                <mat-icon matPrefix svgIcon="phone" />
                <input matInput formControlName="phoneNumber" placeholder="07XXXXXXXX" />
                <mat-hint>You'll receive an STK push to this number</mat-hint>
              </mat-form-field>

              @if (errorMessage()) {
                <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {{ errorMessage() }}
                </div>
              }

              <button class="primary w-full" matButton type="submit"
                      [disabled]="form.invalid || paying()">
                {{ paying() ? 'Initiating payment…' : 'Pay KES ' + (plan()!.price | number:'1.0-0') }}
              </button>
            </form>
          </mat-card>
        }
      </div>
    </div>
  `,
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
    phoneNumber: ['', [Validators.required, Validators.pattern(/^07\d{8}$|^01\d{8}$/)]],
  });

  ngOnInit(): void {
    const customerId = sessionStorage.getItem('portalCustomerId');
    if (!customerId) { this.router.navigate(['/portal']); return; }
    const planId = this.route.snapshot.queryParamMap.get('planId');

    if (planId) {
      this.planApi.getById(planId).subscribe({
        next: p => { this.plan.set(p); this.loading.set(false); },
        error: () => this.loading.set(false),
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
        error: () => this.router.navigate(['/portal/upgrade']),
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
      providerParams: { phoneNumber: this.form.value.phoneNumber! },
    }).subscribe({
      next: p => { this.paying.set(false); this.router.navigate(['/portal/status', p.id]); },
      error: (err: { error?: { message?: string } }) => {
        this.paying.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Payment failed');
      },
    });
  }
}

