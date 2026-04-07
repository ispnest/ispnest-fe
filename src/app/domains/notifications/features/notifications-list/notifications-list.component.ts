import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { NotificationApiService } from '@/app/domains/notifications/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
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
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p class="text-sm text-neutral-a11">{{ totalElements() }} messages sent</p>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="notifications()"
            >
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let n">
                  <span class="rounded bg-primary-a3 px-2 py-0.5 text-xs font-medium text-primary-a11">
                    {{ n.type }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="channel">
                <th mat-header-cell *matHeaderCellDef>Channel</th>
                <td mat-cell *matCellDef="let n" class="capitalize">{{ n.channel }}</td>
              </ng-container>
              <ng-container matColumnDef="body">
                <th mat-header-cell *matHeaderCellDef>Message</th>
                <td mat-cell *matCellDef="let n" class="max-w-xs truncate text-sm text-neutral-a11">
                  {{ n.body }}
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let n"><app-status-badge [status]="n.status" /></td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let n">{{ n.createdAt | date:'medium' }}</td>
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
