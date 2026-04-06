import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { PaymentApiService } from '@/app/domains/payments/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { PaymentDto } from '../../data/payment.model';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe,
    MatCard,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Payments</h1>
        <p class="text-sm text-neutral-a11">{{ totalElements() }} payment transactions</p>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="payments()">
          <ng-container matColumnDef="amount">
            <mat-header-cell *matHeaderCellDef>Amount</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-semibold">
              {{ p.currency }} {{ p.amount | number:'1.2-2' }}
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="provider">
            <mat-header-cell *matHeaderCellDef>Provider</mat-header-cell>
            <mat-cell *matCellDef="let p" class="capitalize">{{ p.provider }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let p"><app-status-badge [status]="p.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
            <mat-cell *matCellDef="let p">{{ p.createdAt | date:'medium' }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols" />
          <mat-row *matRowDef="let _; columns: cols;" />
        </mat-table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons />
      </mat-card>
    </div>
  `,
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentApi = inject(PaymentApiService);

  readonly loading = signal(true);
  readonly payments = signal<PaymentDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['amount', 'provider', 'status', 'createdAt'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.paymentApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => { this.payments.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
}

