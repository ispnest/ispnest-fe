import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { Router } from '@angular/router';
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
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Payments</h1>
        <p class="text-sm text-neutral-a11">{{ totalElements() }} payment transactions</p>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="payments()"
            >
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let p" class="font-semibold">
                  <span class="tabular-nums">{{ p.currency }} {{ p.amount | number:'1.2-2' }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="provider">
                <th mat-header-cell *matHeaderCellDef>Provider</th>
                <td mat-cell *matCellDef="let p" class="capitalize">{{ p.provider }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p"><app-status-badge [status]="p.status" /></td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let p">{{ p.createdAt | date:'medium' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr class="group relative cursor-pointer hover:bg-neutral-a2" mat-row *matRowDef="let row; columns: cols;" (click)="viewDetail(row)"></tr>
            </table>
          </div>

          <mat-paginator
            class="px-3"
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
            showFirstLastButtons />
        </div>
      </mat-card>
    </div>
  `,
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentApi = inject(PaymentApiService);
  private readonly router = inject(Router);

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

  viewDetail(p: PaymentDto): void {
    this.router.navigate(['/admin/payments', p.id]);
  }
}
