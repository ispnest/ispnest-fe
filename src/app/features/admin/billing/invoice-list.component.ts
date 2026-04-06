import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InvoiceApiService } from '../../../core/api/billing-api.service';
import { InvoiceDto } from '../../../core/models/billing.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule,
    MatSortModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Invoices</h1>
          <p class="text-gray-500 text-sm mt-1">{{ totalElements() }} invoices</p>
        </div>
      </div>

      <mat-card>
        <div class="p-4 flex gap-3 flex-wrap border-b border-gray-100">
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="outstanding">Outstanding</mat-option>
              <mat-option value="paid">Paid</mat-option>
              <mat-option value="void">Void</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="invoices()" matSort (matSortChange)="onSort($event)" class="w-full">
          <ng-container matColumnDef="invoiceNumber">
            <mat-header-cell *matHeaderCellDef mat-sort-header="invoiceNumber">Invoice #</mat-header-cell>
            <mat-cell *matCellDef="let i" class="font-mono font-medium">{{ i.invoiceNumber }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="customerId">
            <mat-header-cell *matHeaderCellDef>Customer</mat-header-cell>
            <mat-cell *matCellDef="let i">
              <a [routerLink]="['/admin/customers', i.customerId]" class="text-blue-600 hover:underline text-sm">
                {{ i.customerId?.slice(0, 8) }}…
              </a>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="amount">
            <mat-header-cell *matHeaderCellDef mat-sort-header="amount">Amount</mat-header-cell>
            <mat-cell *matCellDef="let i" class="font-semibold">{{ i.currency }} {{ i.amount | number:'1.2-2' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef mat-sort-header="status">Status</mat-header-cell>
            <mat-cell *matCellDef="let i"><app-status-badge [status]="i.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="dueDate">
            <mat-header-cell *matHeaderCellDef mat-sort-header="dueDate">Due Date</mat-header-cell>
            <mat-cell *matCellDef="let i">{{ i.dueDate | date:'mediumDate' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef mat-sort-header="createdAt">Created</mat-header-cell>
            <mat-cell *matCellDef="let i">{{ i.createdAt | date:'mediumDate' }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
          <mat-row *matRowDef="let row; columns: cols;" class="hover:bg-gray-50"></mat-row>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-8 text-center text-gray-400" [attr.colspan]="cols.length">No invoices found</td>
          </tr>
        </mat-table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `
})
export class InvoiceListComponent implements OnInit {
  private readonly invoiceApi = inject(InvoiceApiService);

  readonly loading = signal(true);
  readonly invoices = signal<InvoiceDto[]>([]);
  readonly totalElements = signal(0);

  readonly cols = ['invoiceNumber', 'customerId', 'amount', 'status', 'dueDate', 'createdAt'];
  statusFilter = '';
  pageIndex = 0;
  pageSize = 20;
  sortField = 'createdAt';
  sortDir = 'desc';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.invoiceApi.getPage(this.pageIndex, this.pageSize, this.sortField, this.sortDir).subscribe({
      next: page => {
        this.invoices.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resetAndLoad(): void { this.pageIndex = 0; this.load(); }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onSort(sort: Sort): void {
    this.sortField = sort.active || 'createdAt';
    this.sortDir = sort.direction || 'desc';
    this.pageIndex = 0;
    this.load();
  }
}
