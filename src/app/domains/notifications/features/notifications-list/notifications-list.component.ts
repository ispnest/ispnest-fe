import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { NotificationApiService } from '@/app/domains/notifications/data';
import { NotificationDto } from '../../data/notification.model';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [
    DatePipe,
    MatCard,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold tracking-tight">Notifications</h1>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="notifications()">
          <ng-container matColumnDef="type">
            <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
            <mat-cell *matCellDef="let n">
              <span class="rounded bg-primary-a3 px-2 py-0.5 text-xs font-medium text-primary-a11">
                {{ n.type }}
              </span>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="channel">
            <mat-header-cell *matHeaderCellDef>Channel</mat-header-cell>
            <mat-cell *matCellDef="let n" class="capitalize">{{ n.channel }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="body">
            <mat-header-cell *matHeaderCellDef>Message</mat-header-cell>
            <mat-cell *matCellDef="let n" class="max-w-xs truncate text-sm text-neutral-a11">
              {{ n.body }}
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let n"><app-status-badge [status]="n.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
            <mat-cell *matCellDef="let n">{{ n.createdAt | date:'medium' }}</mat-cell>
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
export class NotificationsListComponent implements OnInit {
  private readonly notifApi = inject(NotificationApiService);

  readonly loading = signal(true);
  readonly notifications = signal<NotificationDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['type', 'channel', 'body', 'status', 'createdAt'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.notifApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => { this.notifications.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
}


