import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { BandwidthApiService } from '@/app/domains/plans/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { BandwidthDto } from '../../data/plan.model';

@Component({
  selector: 'app-bandwidths-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCard, MatIconButton, MatButton, MatIcon,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    LoadingComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Bandwidths</h1>
          <p class="text-sm text-neutral-a11">{{ totalElements() }} bandwidth profiles</p>
        </div>
        <a matButton class="primary" routerLink="/admin/bandwidths/new">
          <mat-icon svgIcon="plus" /> New Bandwidth
        </a>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="bandwidths()"
            >
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let b" class="font-medium">{{ b.name }}</td>
              </ng-container>

              <ng-container matColumnDef="download">
                <th mat-header-cell *matHeaderCellDef>Download</th>
                <td mat-cell *matCellDef="let b">
                  <span class="tabular-nums">{{ b.rateDown }} {{ b.rateDownUnit }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="upload">
                <th mat-header-cell *matHeaderCellDef>Upload</th>
                <td mat-cell *matCellDef="let b">
                  <span class="tabular-nums">{{ b.rateUp }} {{ b.rateUpUnit }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let b">
                  <div class="flex gap-1">
                    <a matIconButton [routerLink]="['/admin/bandwidths', b.id, 'edit']">
                      <mat-icon svgIcon="pencil" />
                    </a>
                    <button matIconButton (click)="deleteBandwidth(b)">
                      <mat-icon svgIcon="trash" />
                    </button>
                  </div>
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
export class BandwidthsListComponent implements OnInit {
  private readonly bandwidthApi = inject(BandwidthApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly bandwidths = signal<BandwidthDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'download', 'upload', 'actions'];

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
