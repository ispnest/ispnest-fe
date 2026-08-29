import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { Router } from '@angular/router';
import { PaymentApiService } from '@/app/domains/payments/data';
import { PaymentCallbackLogDto } from '@/app/domains/payments/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-payment-corrections-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatCard,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatPaginator,
    StatusBadgeComponent,
    LoadingComponent,
  ],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Payment Corrections</h1>
        <p class="text-sm text-neutral-a11">
          {{ totalElements() }} payment{{ totalElements() === 1 ? '' : 's' }} needing correction
        </p>
      </div>

      <mat-card>
        <div class="flex flex-wrap items-end gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="w-40" subscriptSizing="dynamic">
            <mat-label>Provider</mat-label>
            <mat-select [(ngModel)]="providerFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="absa">ABSA</mat-option>
              <mat-option value="mpesa">M-Pesa</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-auto overflow-y-hidden">
            <table
              class="-mt-px w-full whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="logs()"
            >
              <ng-container matColumnDef="receivedAt">
                <th mat-header-cell *matHeaderCellDef>Received</th>
                <td mat-cell *matCellDef="let l">{{ l.receivedAt | date: 'medium' }}</td>
              </ng-container>
              <ng-container matColumnDef="provider">
                <th mat-header-cell *matHeaderCellDef>Provider</th>
                <td mat-cell *matCellDef="let l" class="capitalize">{{ l.provider }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let l" class="flex items-center gap-2">
                  <app-status-badge [status]="l.status" />
                  @if (l.status === 'ERROR' && !l.terminal) {
                    <span
                      class="rounded-full bg-amber-a3 px-2 py-0.5 text-xs font-semibold text-amber-a11"
                    >
                      Retrying…
                    </span>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="accountCode">
                <th mat-header-cell *matHeaderCellDef>Account Code</th>
                <td mat-cell *matCellDef="let l" class="font-mono text-sm">
                  {{ accountCode(l) ?? '—' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="payerPhone">
                <th mat-header-cell *matHeaderCellDef>Payer Phone</th>
                <td mat-cell *matCellDef="let l">{{ payerPhone(l) ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="attemptCount">
                <th mat-header-cell *matHeaderCellDef>Attempts</th>
                <td mat-cell *matCellDef="let l">{{ l.attemptCount }}</td>
              </ng-container>
              <ng-container matColumnDef="errorMessage">
                <th mat-header-cell *matHeaderCellDef>Error</th>
                <td mat-cell *matCellDef="let l" class="max-w-xs truncate text-sm text-red-a11">
                  {{ l.errorMessage ?? '—' }}
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr
                class="group relative cursor-pointer hover:bg-neutral-a2"
                mat-row
                *matRowDef="let row; columns: cols"
                (click)="viewDetail(row)"
              ></tr>
            </table>
          </div>

          <mat-paginator
            class="px-3"
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
            showFirstLastButtons
          />
        </div>
      </mat-card>
    </div>
  `,
})
export class PaymentCorrectionsListComponent implements OnInit {
  private readonly paymentApi = inject(PaymentApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly logs = signal<PaymentCallbackLogDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = [
    'receivedAt',
    'provider',
    'status',
    'accountCode',
    'payerPhone',
    'attemptCount',
    'errorMessage',
  ];

  providerFilter = '';

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.paymentApi
      .getCallbackLogs(this.pageIndex, this.pageSize, this.providerFilter || undefined, 'ERROR')
      .subscribe({
        next: (page) => {
          this.logs.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  resetAndLoad(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  accountCode(log: PaymentCallbackLogDto): string | null {
    const value = log.callbackMetadata?.['account_number'];
    return value != null ? String(value) : null;
  }

  payerPhone(log: PaymentCallbackLogDto): string | null {
    const value = log.callbackMetadata?.['payer_phone'];
    return value != null ? String(value) : null;
  }

  viewDetail(log: PaymentCallbackLogDto): void {
    this.router.navigate(['/admin/payments/payment-corrections', log.id]);
  }
}
