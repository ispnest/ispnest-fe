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
import { PaymentApiService } from '../../../core/api/payment-api.service';
import { PaymentDto } from '../../../core/models/payment.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-payment-list',
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
          <h1 class="text-2xl font-bold text-gray-900">Payments</h1>
          <p class="text-gray-500 text-sm">{{ totalElements() }} payments</p>
        </div>
      </div>

      <mat-card>
        <div class="p-4 flex gap-3 flex-wrap border-b border-gray-100">
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="completed">Completed</mat-option>
              <mat-option value="failed">Failed</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Provider</mat-label>
            <mat-select [(ngModel)]="providerFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="mpesa">M-Pesa</mat-option>
              <mat-option value="cash">Cash</mat-option>
              <mat-option value="bank">Bank</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="payments()" matSort (matSortChange)="onSort($event)" class="w-full">
          <ng-container matColumnDef="id">
            <mat-header-cell *matHeaderCellDef>Payment ID</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-mono text-xs">{{ p.id.slice(0,8) }}…</mat-cell>
          </ng-container>
          <ng-container matColumnDef="amount">
            <mat-header-cell *matHeaderCellDef mat-sort-header="amount">Amount</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-semibold">{{ p.currency }} {{ p.amount | number:'1.2-2' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="provider">
            <mat-header-cell *matHeaderCellDef mat-sort-header="provider">Provider</mat-header-cell>
            <mat-cell *matCellDef="let p" class="capitalize">{{ p.provider }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef mat-sort-header="status">Status</mat-header-cell>
            <mat-cell *matCellDef="let p"><app-status-badge [status]="p.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="customer">
            <mat-header-cell *matHeaderCellDef>Customer</mat-header-cell>
            <mat-cell *matCellDef="let p">
              <a [routerLink]="['/admin/customers', p.customerId]" class="text-blue-600 hover:underline text-xs">
                {{ p.customerId?.slice(0, 8) }}…
              </a>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="reference">
            <mat-header-cell *matHeaderCellDef>Reference</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-mono text-xs">{{ p.externalReference || '—' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="date">
            <mat-header-cell *matHeaderCellDef mat-sort-header="createdAt">Date</mat-header-cell>
            <mat-cell *matCellDef="let p">{{ p.createdAt | date:'medium' }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
          <mat-row *matRowDef="let row; columns: cols;" class="hover:bg-gray-50"></mat-row>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-8 text-center text-gray-400" [attr.colspan]="cols.length">No payments found</td>
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
export class PaymentListComponent implements OnInit {
  private readonly paymentApi = inject(PaymentApiService);

  readonly loading = signal(true);
  readonly payments = signal<PaymentDto[]>([]);
  readonly totalElements = signal(0);

  readonly cols = ['id', 'amount', 'provider', 'status', 'customer', 'reference', 'date'];
  statusFilter = '';
  providerFilter = '';
  pageIndex = 0;
  pageSize = 20;
  sortField = 'createdAt';
  sortDir = 'desc';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.paymentApi.getPage(this.pageIndex, this.pageSize, this.sortField, this.sortDir).subscribe({
      next: page => {
        this.payments.set(page.content);
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
