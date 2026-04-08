import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';
import { CustomerDto, HotspotStatsDto } from '@/app/domains/customers/data/customer.model';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-hotspot-admin-list',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe, FormsModule, RouterLink,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatFormField, MatLabel, MatInput, MatSelect, MatOption,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8">

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Hotspot Guests</h1>
          <p class="text-sm text-neutral-a11">Self-service hotspot accounts via the captive portal</p>
        </div>
        <a matButton routerLink="/admin/hotspot/archive">
          <mat-icon svgIcon="history"/>
          Connection History
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <mat-card class="p-5">
          <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Total Guests</p>
          <p class="mt-2 text-3xl font-extrabold">{{ stats()?.totalGuests ?? '—' }}</p>
          <p class="mt-1 text-xs text-neutral-a11">All-time registered accounts</p>
        </mat-card>
        <mat-card class="p-5">
          <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Sessions Today</p>
          <p class="mt-2 text-3xl font-extrabold text-accent-a11">{{ stats()?.sessionsToday ?? '—' }}</p>
          <p class="mt-1 text-xs text-neutral-a11">Unique devices that paid today</p>
        </mat-card>
        <mat-card class="p-5">
          <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Archived Guests</p>
          <p class="mt-2 text-3xl font-extrabold text-neutral-a11">{{ stats()?.totalArchived ?? '—' }}</p>
          <p class="mt-1 text-xs text-neutral-a11">Cleaned up by inactivity job</p>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card>
        <div class="flex flex-wrap items-end gap-3 p-4">
          <mat-form-field class="min-w-48 flex-1" subscriptSizing="dynamic">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Name, username, phone…"
                   (keyup.enter)="applyFilter()"/>
          </mat-form-field>
          <mat-form-field class="w-44" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter">
              <mat-option value="">All Status</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
              <mat-option value="terminated">Terminated</mat-option>
            </mat-select>
          </mat-form-field>
          <button matButton class="primary" (click)="applyFilter()">
            <mat-icon svgIcon="filter"/>
            Filter
          </button>
        </div>
      </mat-card>

      <!-- Table -->
      <mat-card>
        <app-loading [loading]="loading()"/>

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="guests()"
            >
              <ng-container matColumnDef="guest">
                <th mat-header-cell *matHeaderCellDef>Guest</th>
                <td mat-cell *matCellDef="let g">
                  <div class="flex items-center gap-2">
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-a3">
                      <mat-icon svgIcon="wifi" class="size-4 text-accent-a11"/>
                    </div>
                    <span class="font-medium">{{ g.fullName || g.phoneNumber || '—' }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>Username</th>
                <td mat-cell *matCellDef="let g" class="font-mono text-neutral-a11">{{ g.username }}</td>
              </ng-container>

              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let g" class="text-neutral-a11">{{ g.phoneNumber || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let g">
                  <app-status-badge [status]="g.status"/>
                </td>
              </ng-container>

              <ng-container matColumnDef="registered">
                <th mat-header-cell *matHeaderCellDef>Registered</th>
                <td mat-cell *matCellDef="let g"
                    class="text-xs text-neutral-a11">{{ g.createdAt | date:'mediumDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let g">
                  <div class="flex gap-1">
                    <a matIconButton [routerLink]="['/admin/hotspot/guests', g.id]" title="View">
                      <mat-icon svgIcon="eye"/>
                    </a>
                    <button matIconButton title="Archive" (click)="archiveGuest(g)">
                      <mat-icon svgIcon="archive" class="text-red-a11"/>
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
            showFirstLastButtons/>
        </div>
      </mat-card>
    </div>
  `,
})
export class HotspotAdminListComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly guests = signal<CustomerDto[]>([]);
  readonly totalElements = signal(0);
  readonly stats = signal<HotspotStatsDto | null>(null);
  readonly cols = ['guest', 'username', 'phone', 'status', 'registered', 'actions'];

  searchQuery = '';
  statusFilter = '';
  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
    this.customerApi.getHotspotStats().subscribe(s => this.stats.set(s));
  }

  load(): void {
    this.loading.set(true);
    this.customerApi
      .getPage(this.pageIndex, this.pageSize, 'createdAt', 'desc', this.searchQuery, this.statusFilter, 'hotspot')
      .subscribe({
        next: page => {
          this.guests.set(page.content);
          this.totalElements.set(page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  applyFilter(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  archiveGuest(g: CustomerDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Archive Guest',
          message: `Archive and remove "${g.fullName || g.username}"? A record will be kept in connection history.`,
          confirmText: 'Archive',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe(ok => {
        if (!ok) return;
        this.customerApi.archiveGuest(g.id).subscribe({
          next: () => {
            this.guests.update(list => list.filter(x => x.id !== g.id));
            this.totalElements.update(n => n - 1);
            this.snackBar.open('Guest archived', 'OK', { duration: 3000 });
            this.customerApi.getHotspotStats().subscribe(s => this.stats.set(s));
          },
          error: () => this.snackBar.open('Failed to archive guest', 'Close', { duration: 3000 }),
        });
      });
  }
}
