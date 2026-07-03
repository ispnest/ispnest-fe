import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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
import { CreditApiService } from '@/app/domains/billing/data';
import { LoadingComponent } from '@/app/ui/loading';
import { CreditLedgerEntryDto } from '../../data/billing.model';

@Component({
  selector: 'app-credits-list',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    MatCard,
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
    LoadingComponent,
    MatPaginator,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Credit Ledger</h1>
        <p class="text-sm text-neutral-a11">Transaction history and running balances</p>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="entries()"
            >
              <ng-container matColumnDef="entryType">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let e" class="capitalize">{{ e.entryType }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td
                  mat-cell
                  *matCellDef="let e"
                  [class]="
                    e.amount >= 0 ? 'font-semibold text-green-a11' : 'font-semibold text-red-a11'
                  "
                >
                  <span class="tabular-nums"
                    >{{ e.currency }} {{ e.amount | number: '1.2-2' }}</span
                  >
                </td>
              </ng-container>
              <ng-container matColumnDef="runningBalance">
                <th mat-header-cell *matHeaderCellDef>Balance</th>
                <td mat-cell *matCellDef="let e">
                  <span class="tabular-nums"
                    >{{ e.currency }} {{ e.runningBalance | number: '1.2-2' }}</span
                  >
                </td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let e" class="text-neutral-a11 text-sm">
                  {{ e.description }}
                </td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let e">{{ e.createdAt | date: 'medium' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr
                class="group relative hover:bg-neutral-a2"
                mat-row
                *matRowDef="let _; columns: cols"
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
export class CreditsListComponent implements OnInit {
  private readonly creditApi = inject(CreditApiService);

  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly entries = signal<CreditLedgerEntryDto[]>([]);
  readonly cols = ['entryType', 'amount', 'runningBalance', 'description', 'createdAt'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.creditApi.fetchHistories(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.entries.set(page.content);
        this.totalElements.set(page.page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
