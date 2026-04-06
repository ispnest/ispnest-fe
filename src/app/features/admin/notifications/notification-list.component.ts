import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NotificationApiService } from '../../../core/api/notification-api.service';
import { NotificationDto } from '../../../core/models/notification.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule,
    MatSortModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule,
    StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
          <p class="text-gray-500 text-sm">{{ totalElements() }} notifications</p>
        </div>
      </div>

      <mat-card>
        <div class="p-4 flex gap-3 border-b border-gray-100">
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Channel</mat-label>
            <mat-select [(ngModel)]="channelFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="in_app">In-App</mat-option>
              <mat-option value="sms">SMS</mat-option>
              <mat-option value="email">Email</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="notifications()" matSort (matSortChange)="onSort($event)" class="w-full">
          <ng-container matColumnDef="type">
            <mat-header-cell *matHeaderCellDef mat-sort-header="type">Type</mat-header-cell>
            <mat-cell *matCellDef="let n" class="capitalize">{{ n.type }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="channel">
            <mat-header-cell *matHeaderCellDef mat-sort-header="channel">Channel</mat-header-cell>
            <mat-cell *matCellDef="let n" class="capitalize">{{ n.channel }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="body">
            <mat-header-cell *matHeaderCellDef>Message</mat-header-cell>
            <mat-cell *matCellDef="let n" class="text-sm max-w-sm truncate">{{ n.body }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef mat-sort-header="status">Status</mat-header-cell>
            <mat-cell *matCellDef="let n"><app-status-badge [status]="n.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="date">
            <mat-header-cell *matHeaderCellDef mat-sort-header="createdAt">Date</mat-header-cell>
            <mat-cell *matCellDef="let n">{{ n.createdAt | date:'medium' }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
          <mat-row *matRowDef="let row; columns: cols;"></mat-row>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-8 text-center text-gray-400" [attr.colspan]="cols.length">No notifications</td>
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
export class NotificationListComponent implements OnInit {
  private readonly notificationApi = inject(NotificationApiService);

  readonly loading = signal(true);
  readonly notifications = signal<NotificationDto[]>([]);
  readonly totalElements = signal(0);

  readonly cols = ['type', 'channel', 'body', 'status', 'date'];
  channelFilter = '';
  pageIndex = 0;
  pageSize = 20;
  sortField = 'createdAt';
  sortDir = 'desc';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.notificationApi.getPage(this.pageIndex, this.pageSize, this.sortField, this.sortDir).subscribe({
      next: page => {
        this.notifications.set(page.content);
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
