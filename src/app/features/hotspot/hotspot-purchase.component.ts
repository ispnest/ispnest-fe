import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { HotspotApiService } from '../../core/api/hotspot-api.service';
import { PlanApiService } from '../../core/api/plan-api.service';
import { PlanDto } from '../../core/models/plan.model';

@Component({
  selector: 'app-hotspot-purchase',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-800 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-white">Buy Voucher</h1>
          @if (plan()) {
            <p class="text-blue-200 mt-1">{{ plan()!.name }} — KES {{ plan()!.price | number:'1.0-0' }}</p>
          }
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          <form [formGroup]="form" (ngSubmit)="purchase()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>M-Pesa Phone Number</mat-label>
              <mat-icon matPrefix>phone</mat-icon>
              <input matInput formControlName="phoneNumber" placeholder="07XXXXXXXX" autocomplete="tel">
              <mat-hint>You'll receive an M-Pesa STK push</mat-hint>
            </mat-form-field>

            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {{ errorMessage() }}
              </div>
            }

            <button mat-flat-button color="primary" type="submit" class="w-full py-3"
                    [disabled]="form.invalid || purchasing()">
              {{ purchasing() ? 'Processing…' : 'Pay & Connect' }}
            </button>
          </form>

          <button type="button" class="w-full text-sm text-gray-500 hover:text-gray-700" (click)="goBack()">
            ← Choose different plan
          </button>
        </div>
      </div>
    </div>
  `
})
export class HotspotPurchaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly hotspotApi = inject(HotspotApiService);
  private readonly planApi = inject(PlanApiService);

  readonly purchasing = signal(false);
  readonly errorMessage = signal('');
  readonly plan = signal<PlanDto | null>(null);

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^07\d{8}$|^01\d{8}$/)]]
  });

  ngOnInit(): void {
    const planId = this.route.snapshot.queryParamMap.get('planId');
    if (planId) {
      this.planApi.getById(planId).subscribe(p => this.plan.set(p));
    }
  }

  purchase(): void {
    if (this.form.invalid) return;
    const params = this.route.snapshot.queryParams;
    this.purchasing.set(true);
    this.errorMessage.set('');

    this.hotspotApi.purchase({
      phoneNumber: this.form.value.phoneNumber!,
      planId: params['planId'],
      mac: params['mac'],
      serverIp: params['server-ip'],
      chapId: params['chap-id'],
      chapChallenge: params['chap-challenge']
    }).subscribe({
      next: response => {
        this.purchasing.set(false);
        sessionStorage.setItem('hs_credentials', JSON.stringify(response));
        this.router.navigate(['/hotspot/status', response.paymentId], { queryParams: params });
      },
      error: (err: any) => {
        this.purchasing.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Purchase failed. Try again.');
      }
    });
  }

  goBack(): void {
    const params = this.route.snapshot.queryParams;
    this.router.navigate(['/hotspot'], { queryParams: params });
  }
}

