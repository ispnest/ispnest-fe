import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { PaymentApiService } from '../../core/api/payment-api.service';
import { PaymentDto } from '../../core/models/payment.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-portal-status',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, StatusBadgeComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="bg-blue-600 text-white px-4 py-4">
        <div class="max-w-lg mx-auto">
          <h1 class="font-bold text-lg">Payment Status</h1>
        </div>
      </div>

      <div class="max-w-lg mx-auto px-4 py-8 space-y-4">
        <mat-card class="p-8 text-center">
          @if (payment()?.status === 'completed') {
            <mat-icon class="text-green-500" style="font-size: 4rem; width: 4rem; height: 4rem;">check_circle</mat-icon>
            <h2 class="text-xl font-bold text-gray-900 mt-4">Payment Successful!</h2>
            <p class="text-gray-500 mt-2">Your payment of KES {{ payment()!.amount | number:'1.2-2' }} has been processed.</p>
            <a routerLink="/portal/dashboard" mat-flat-button color="primary" class="mt-6 w-full">View My Account</a>
          } @else if (payment()?.status === 'failed') {
            <mat-icon class="text-red-500" style="font-size: 4rem; width: 4rem; height: 4rem;">cancel</mat-icon>
            <h2 class="text-xl font-bold text-gray-900 mt-4">Payment Failed</h2>
            <p class="text-gray-500 mt-2">{{ payment()!.failureReason || 'Your payment could not be processed.' }}</p>
            <a routerLink="/portal/payment" mat-flat-button color="primary" class="mt-6 w-full">Try Again</a>
          } @else {
            <mat-spinner diameter="60" class="mx-auto"></mat-spinner>
            <h2 class="text-xl font-bold text-gray-900 mt-6">Waiting for Payment</h2>
            <p class="text-gray-500 mt-2">Check your phone for the M-Pesa prompt and enter your PIN to complete payment.</p>
            <div class="mt-4 inline-flex items-center gap-2 text-sm text-gray-400">
              <app-status-badge [status]="payment()?.status ?? 'pending'" />
            </div>
            <a routerLink="/portal/dashboard" mat-button class="mt-6 w-full">Cancel</a>
          }
        </mat-card>
      </div>
    </div>
  `
})
export class PortalStatusComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentApi = inject(PaymentApiService);

  readonly payment = signal<PaymentDto | null>(null);
  private pollSub?: Subscription;

  ngOnInit(): void {
    const paymentId = this.route.snapshot.paramMap.get('paymentId')!;
    this.paymentApi.getById(paymentId).subscribe(p => this.payment.set(p));

    this.pollSub = interval(3000).pipe(
      switchMap(() => this.paymentApi.getById(paymentId)),
      takeWhile(p => p.status !== 'completed' && p.status !== 'failed', true)
    ).subscribe(p => this.payment.set(p));
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}

