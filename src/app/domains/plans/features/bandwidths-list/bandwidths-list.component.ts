import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { BandwidthApiService } from '@/app/domains/plans/data';
import { BandwidthDto } from '../../data/plan.model';

@Component({
  selector: 'app-bandwidths-list',
  standalone: true,
  imports: [
    DatePipe,
    MatCard, MatIconButton, MatIcon,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-tight">Bandwidths</h1>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="bandwidths()">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let b" class="font-medium">{{ b.name }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="download">
            <mat-header-cell *matHeaderCellDef>Download</mat-header-cell>
            <mat-cell *matCellDef="let b">{{ b.downloadRate }} {{ b.downloadUnit }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="upload">
            <mat-header-cell *matHeaderCellDef>Upload</mat-header-cell>
            <mat-cell *matCellDef="let b">{{ b.uploadRate }} {{ b.uploadUnit }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef>Created</mat-header-cell>
            <mat-cell *matCellDef="let b">{{ b.createdAt | date:'mediumDate' }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let b">
              <button matIconButton (click)="deleteBandwidth(b)">
                <mat-icon svgIcon="trash" />
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="cols" />
          <mat-row *matRowDef="let row; columns: cols;" />
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
export class BandwidthsListComponent implements OnInit {
  private readonly bandwidthApi = inject(BandwidthApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly bandwidths = signal<BandwidthDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'download', 'upload', 'createdAt', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.bandwidthApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => {
        this.bandwidths.set(page.content);
        this.totalElements.set(page.totalElements);
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

  deleteBandwidth(b: BandwidthDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Delete Bandwidth', message: `Delete "${b.name}"?`, confirmText: 'Delete', danger: true },
      })
      .afterClosed()
      .subscribe(ok => {
        if (!ok) return;
        this.bandwidthApi.delete(b.id).subscribe({
          next: () => {
            this.bandwidths.update(list => list.filter(x => x.id !== b.id));
            this.snackBar.open('Bandwidth deleted', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
        });
      });
  }
}

