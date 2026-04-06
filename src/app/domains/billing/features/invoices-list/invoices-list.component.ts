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
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p class="text-sm text-neutral-a11">{{ totalElements() }} total invoices</p>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="invoices()">
          <ng-container matColumnDef="invoiceNumber">
            <mat-header-cell *matHeaderCellDef>Invoice #</mat-header-cell>
            <mat-cell *matCellDef="let i" class="font-mono font-medium">{{ i.invoiceNumber }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="amount">
            <mat-header-cell *matHeaderCellDef>Amount</mat-header-cell>
            <mat-cell *matCellDef="let i">{{ i.currency }} {{ i.amount | number:'1.2-2' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="outstanding">
            <mat-header-cell *matHeaderCellDef>Outstanding</mat-header-cell>
            <mat-cell *matCellDef="let i" class="font-semibold">
              {{ i.currency }} {{ i.outstandingAmount | number:'1.2-2' }}
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let i"><app-status-badge [status]="i.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="dueDate">
            <mat-header-cell *matHeaderCellDef>Due Date</mat-header-cell>
            <mat-cell *matCellDef="let i">{{ i.dueDate | date:'mediumDate' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let i">
              @if (i.status !== 'void') {
                <button matIconButton title="Void Invoice" (click)="voidInvoice(i)">
                  <mat-icon svgIcon="ban" />
                </button>
              }
            </mat-cell>
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






