import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { LoadingComponent } from '@/app/ui/loading';
import { CreditApiService } from '@/app/domains/billing/data';
import { CreditLedgerEntryDto } from '../../data/billing.model';

@Component({
  selector: 'app-credits-list',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe,
    MatCard,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold tracking-tight">Credit Ledger</h1>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="entries()">
          <ng-container matColumnDef="entryType">
            <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
            <mat-cell *matCellDef="let e" class="capitalize">{{ e.entryType }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="amount">
            <mat-header-cell *matHeaderCellDef>Amount</mat-header-cell>
            <mat-cell *matCellDef="let e"
                      [class]="e.amount >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'">
              {{ e.currency }} {{ e.amount | number:'1.2-2' }}
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="runningBalance">
            <mat-header-cell *matHeaderCellDef>Balance</mat-header-cell>
            <mat-cell *matCellDef="let e">{{ e.currency }} {{ e.runningBalance | number:'1.2-2' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="description">
            <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
            <mat-cell *matCellDef="let e" class="text-neutral-a11 text-sm">{{ e.description }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
            <mat-cell *matCellDef="let e">{{ e.createdAt | date:'medium' }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols" />
          <mat-row *matRowDef="let row; columns: cols;" />
        </mat-table>
      </mat-card>
    </div>
  `,
})
export class CreditsListComponent implements OnInit {
  private readonly creditApi = inject(CreditApiService);

  readonly loading = signal(true);
  readonly entries = signal<CreditLedgerEntryDto[]>([]);
  readonly cols = ['entryType', 'amount', 'runningBalance', 'description', 'createdAt'];

  ngOnInit(): void {
    this.creditApi.getHistory('').subscribe({
      next: data => { this.entries.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}

