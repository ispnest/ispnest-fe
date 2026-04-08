import { DatePipe, SlicePipe } from '@angular/common';
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
import { BillingCycleApiService } from '@/app/domains/billing/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { BillingCycleDto } from '../../data/billing.model';

@Component({
  selector: 'app-billing-cycles-list',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    SlicePipe,
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
    MatPaginator,
    StatusBadgeComponent,
    LoadingComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Billing Cycles</h1>
        <p class="text-sm text-neutral-a11">{{ totalElements() }} total cycles</p>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="cycles()"
            >
              <ng-container matColumnDef="customerId">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let c" class="font-mono text-xs text-neutral-a11">
                  {{ c.customerId | slice: 0 : 8 }}…
                </td>
              </ng-container>

              <ng-container matColumnDef="period">
                <th mat-header-cell *matHeaderCellDef>Period</th>
                <td mat-cell *matCellDef="let c">
                  <span class="tabular-nums">
                    {{ c.cycleStart | date: 'd MMM' }} →
                    {{ (c.cycleEnd | date: 'd MMM yyyy') ?? '—' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="nextRenewal">
                <th mat-header-cell *matHeaderCellDef>Next Renewal</th>
                <td mat-cell *matCellDef="let c">
                  {{ c.nextRenewalDate ? (c.nextRenewalDate | date: 'mediumDate') : '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="autoRenew">
                <th mat-header-cell *matHeaderCellDef>Auto-Renew</th>
                <td mat-cell *matCellDef="let c">
                  <span [class]="c.autoRenew ? 'text-green-a11' : 'text-neutral-a11'">
                    {{ c.autoRenew ? '✓ Yes' : '✗ No' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let c"><app-status-badge [status]="c.status" /></td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let c">{{ c.createdAt | date: 'mediumDate' }}</td>
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
export class BillingCyclesListComponent implements OnInit {
  private readonly cycleApi = inject(BillingCycleApiService);

  readonly loading = signal(true);
  readonly cycles = signal<BillingCycleDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['customerId', 'period', 'nextRenewal', 'autoRenew', 'status', 'createdAt'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.cycleApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.cycles.set(page.content);
        this.totalElements.set(page.page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }
}
