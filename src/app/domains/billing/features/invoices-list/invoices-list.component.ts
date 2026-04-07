import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { InvoiceApiService } from '@/app/domains/billing/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { InvoiceDto } from '../../data/billing.model';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe,
    MatCard, MatIconButton, MatIcon,
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
        <h1 class="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p class="text-sm text-neutral-a11">{{ totalElements() }} total invoices</p>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="invoices()"
            >
              <ng-container matColumnDef="invoiceNumber">
                <th mat-header-cell *matHeaderCellDef>Invoice #</th>
                <td mat-cell *matCellDef="let i" class="font-mono font-medium">{{ i.invoiceNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let i">
                  <span class="tabular-nums">{{ i.currency }} {{ i.amount | number:'1.2-2' }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="outstanding">
                <th mat-header-cell *matHeaderCellDef>Outstanding</th>
                <td mat-cell *matCellDef="let i" class="font-semibold">
                  <span class="tabular-nums">{{ i.currency }} {{ i.outstandingAmount | number:'1.2-2' }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let i"><app-status-badge [status]="i.status" /></td>
              </ng-container>
              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>Due Date</th>
                <td mat-cell *matCellDef="let i">{{ i.dueDate | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let i">
                  @if (i.status !== 'void') {
                    <button matIconButton title="Void Invoice" (click)="voidInvoice(i)">
                      <mat-icon svgIcon="ban" />
                    </button>
                  }
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr class="group relative hover:bg-neutral-a2" mat-row *matRowDef="let _; columns: cols;"></tr>
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
export class InvoicesListComponent implements OnInit {
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly invoices = signal<InvoiceDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['invoiceNumber', 'amount', 'outstanding', 'status', 'dueDate', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.invoiceApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => { this.invoices.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  voidInvoice(invoice: InvoiceDto): void {
    this.invoiceApi.voidInvoice(invoice.id).subscribe({
      next: updated => {
        this.invoices.update(list => list.map(i => i.id === updated.id ? updated : i));
        this.snackBar.open('Invoice voided', 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to void invoice', 'Close', { duration: 3000 }),
    });
  }
}
