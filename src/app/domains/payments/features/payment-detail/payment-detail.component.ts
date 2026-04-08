import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentApiService } from '@/app/domains/payments/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { PaymentDto } from '../../data/payment.model';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatCard,
    MatIconButton,
    MatIcon,
    LoadingComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/payments">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Payment Detail</h1>
          <p class="text-sm text-neutral-a11">Transaction record</p>
        </div>
      </div>

      <app-loading [loading]="loading()" />

      @if (payment(); as p) {
        <mat-card class="p-6">
          <dl class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">ID</dt>
              <dd class="mt-1 font-mono text-sm">{{ p.id }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Status</dt>
              <dd class="mt-1"><app-status-badge [status]="p.status" /></dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Amount</dt>
              <dd class="mt-1 text-lg font-semibold tabular-nums">
                {{ p.currency }} {{ p.amount | number: '1.2-2' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Provider
              </dt>
              <dd class="mt-1 capitalize text-sm">{{ p.provider }}</dd>
            </div>
            @if (p.externalReference) {
              <div>
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Reference
                </dt>
                <dd class="mt-1 font-mono text-sm">{{ p.externalReference }}</dd>
              </div>
            }
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Date</dt>
              <dd class="mt-1 text-sm">{{ p.createdAt | date: 'medium' }}</dd>
            </div>
            @if (p.failureReason) {
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium uppercase tracking-widest text-red-a11">
                  Failure Reason
                </dt>
                <dd class="mt-1 rounded-lg bg-red-a3 p-3 text-sm text-red-a11">
                  {{ p.failureReason }}
                </dd>
              </div>
            }
          </dl>
        </mat-card>
      }
    </div>
  `,
})
export class PaymentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentApi = inject(PaymentApiService);

  readonly loading = signal(true);
  readonly payment = signal<PaymentDto | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.paymentApi.getById(id).subscribe({
      next: (p) => {
        this.payment.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
