import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { PaymentApiService } from '@/app/domains/payments/data/payment-api.service';
import { PaymentDto } from '@/app/domains/payments/data/payment.model';
import { StatusBadgeComponent } from '@/app/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-portal-status',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    TitleCasePipe,
    MatCard,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    StatusBadgeComponent,
  ],
  template: `
    <div class="min-h-screen bg-neutral-a2 pb-16 lg:pb-0">
      <div class="bg-primary px-4 py-4 text-primary-contrast">
        <div class="mx-auto max-w-lg">
          <h1 class="text-lg font-bold">Payment Status</h1>
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-4 px-4 py-8">
        <mat-card class="p-8 text-center">
          @if (!payment()) {
            <mat-spinner class="mx-auto" />
            <p class="mt-4 text-neutral-a11">Checking payment status…</p>
          }

          @if (payment()?.status === 'completed') {
            <div
              class="flex size-16 items-center justify-center rounded-full bg-green-a3 mx-auto mb-4"
            >
              <mat-icon svgIcon="circle-check" class="size-8 text-green-a11" />
            </div>
            <h2 class="text-xl font-bold text-green-a11">Payment Successful!</h2>
            <p class="mt-2 text-neutral-a11">
              Your payment of KES {{ payment()!.amount | number: '1.2-2' }} has been processed.
            </p>
            <a class="primary mt-6" matButton routerLink="/portal/dashboard">
              <mat-icon svgIcon="layout-dashboard" />
              Go to Dashboard
            </a>
          }

          @if (payment() && payment()?.status !== 'completed') {
            <div
              class="flex size-16 items-center justify-center rounded-full bg-amber-a3 mx-auto mb-4"
            >
              <mat-icon svgIcon="clock" class="size-8 text-amber-a11" />
            </div>
            <h2 class="text-xl font-bold">{{ payment()?.status | titlecase }}</h2>
            <p class="mt-2 text-neutral-a11">
              Processing payment of KES {{ payment()!.amount | number: '1.2-2' }}
            </p>
            <div class="mt-4"><app-status-badge [status]="payment()!.status" /></div>
            <p class="mt-4 text-sm text-neutral-a9">
              This page will update automatically. Please wait…
            </p>
          }
        </mat-card>
      </div>
    </div>
  `,
})
export class PortalStatusComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentApi = inject(PaymentApiService);

  readonly payment = signal<PaymentDto | null>(null);
  private sub?: Subscription;

  ngOnInit(): void {
    const paymentId = this.route.snapshot.paramMap.get('paymentId') ?? '';
    this.paymentApi.getById(paymentId).subscribe((p) => this.payment.set(p));

    this.sub = interval(4000)
      .pipe(
        switchMap(() => this.paymentApi.getById(paymentId)),
        takeWhile((p) => p.status !== 'completed' && p.status !== 'failed', true),
      )
      .subscribe((p) => this.payment.set(p));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
