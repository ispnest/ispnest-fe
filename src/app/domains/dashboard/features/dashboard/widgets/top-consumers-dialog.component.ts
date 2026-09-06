import { Component, OnInit, inject, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
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
import { RouterLink } from '@angular/router';
import { CustomerApiService, TopConsumer } from '@/app/domains/customers/data';
import { BytesPipe } from '@/app/ui/pipes';

/**
 * Paginated body for the Top Consumers "view all" modal — the full ranking, not just today's
 * top 8 shown inline on the dashboard. Loads its own page lazily on init, independent of the
 * dashboard's SSE-driven top-8 widget.
 */
@Component({
  selector: 'app-top-consumers-dialog',
  standalone: true,
  imports: [
    RouterLink,
    MatIcon,
    BytesPipe,
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
  ],
  template: `
    <div class="flex flex-col">
      <!-- Desktop / tablet: table. Hidden below sm. -->
      <div class="relative isolate hidden overflow-x-auto overflow-y-hidden sm:block">
        <table
          class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
          mat-table
          [dataSource]="consumers()"
        >
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let c">
              <a
                class="font-medium hover:text-primary-a11"
                [routerLink]="['/admin/customers', c.customerId]"
                (click)="rowSelected.emit()"
              >
                {{ c.fullName || c.accountCode }}
              </a>
              <div class="font-mono text-xs text-neutral-a11">{{ c.accountCode }}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="download">
            <th mat-header-cell *matHeaderCellDef>Download</th>
            <td mat-cell *matCellDef="let c" class="tabular-nums">{{ c.outputOctets | bytes }}</td>
          </ng-container>
          <ng-container matColumnDef="upload">
            <th mat-header-cell *matHeaderCellDef>Upload</th>
            <td mat-cell *matCellDef="let c" class="tabular-nums">{{ c.inputOctets | bytes }}</td>
          </ng-container>
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let c" class="font-semibold tabular-nums">
              {{ c.inputOctets + c.outputOctets | bytes }}
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
      </div>

      <!-- Mobile: cards. Shown only below sm. -->
      <div class="flex flex-col divide-y divide-neutral-a4 sm:hidden">
        @for (c of consumers(); track c.customerId) {
          <a
            class="flex flex-col gap-1 p-3"
            [routerLink]="['/admin/customers', c.customerId]"
            (click)="rowSelected.emit()"
          >
            <div class="flex items-baseline justify-between gap-2">
              <span class="truncate font-medium">{{ c.fullName || c.accountCode }}</span>
              <span class="shrink-0 font-semibold tabular-nums"
                >{{ c.inputOctets + c.outputOctets | bytes }}</span
              >
            </div>
            <div class="flex items-center gap-3 text-xs text-neutral-a11">
              <span>↓ {{ c.outputOctets | bytes }}</span>
              <span>↑ {{ c.inputOctets | bytes }}</span>
            </div>
          </a>
        }
        @if (consumers().length === 0 && !loading()) {
          <p class="py-8 text-center text-sm text-neutral-a9">No usage recorded today</p>
        }
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center gap-2 py-8 text-sm text-neutral-a11">
          <mat-icon svgIcon="loader-circle" class="size-4 animate-spin" /> Loading…
        </div>
      }

      <mat-paginator
        class="px-1"
        [length]="totalElements()"
        [pageSize]="pageSize"
        [pageSizeOptions]="[20, 50, 100]"
        (page)="onPage($event)"
        showFirstLastButtons
      />
    </div>
  `,
})
export class TopConsumersDialogComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);

  /** Emitted when a row navigates away, so the host dialog can close itself. */
  readonly rowSelected = output<void>();

  readonly loading = signal(true);
  readonly consumers = signal<TopConsumer[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['customer', 'download', 'upload', 'total'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerApi.getTopConsumersPage(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.consumers.set(page.content);
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
