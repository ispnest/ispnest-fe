import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';
import { HotspotGuestArchiveDto } from '@/app/domains/customers/data/customer.model';
import { LoadingComponent } from '@/app/ui/loading';

@Component({
  selector: 'app-hotspot-archive',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe, FormsModule, RouterLink,
    MatCard, MatButton, MatIcon,
    MatFormField, MatLabel, MatInput,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    LoadingComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8">

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Connection History</h1>
          <p class="text-sm text-neutral-a11">All devices that have ever connected to the hotspot network</p>
        </div>
        <a matButton routerLink="/admin/hotspot">
          <mat-icon svgIcon="wifi" />
          Live Guests
        </a>
      </div>

      <!-- KPI inline card -->
      <mat-card class="inline-flex items-center gap-4 self-start p-5">
        <div class="flex size-12 items-center justify-center rounded-xl bg-accent-a3">
          <mat-icon svgIcon="history" class="text-accent-a11" />
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Total Archived</p>
          <p class="text-3xl font-extrabold">{{ totalElements() }}</p>
        </div>
      </mat-card>

      <!-- Search -->
      <mat-card class="flex flex-wrap items-end gap-3 p-4">
        <mat-form-field class="min-w-48 flex-1" subscriptSizing="dynamic">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchQuery" placeholder="Username, phone, name…" (keyup.enter)="applySearch()" />
        </mat-form-field>
        <button matButton class="primary" (click)="applySearch()">
          <mat-icon svgIcon="search" />
          Search
        </button>
      </mat-card>

      <!-- Table -->
      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="archives()"
            >
              <ng-container matColumnDef="guest">
                <th mat-header-cell *matHeaderCellDef>Guest</th>
                <td mat-cell *matCellDef="let a" class="font-medium">{{ a.fullName || a.phoneNumber || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>Username</th>
                <td mat-cell *matCellDef="let a" class="font-mono text-sm text-neutral-a11">{{ a.username }}</td>
              </ng-container>

              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let a" class="text-neutral-a11">{{ a.phoneNumber || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="sessions">
                <th mat-header-cell *matHeaderCellDef>Sessions</th>
                <td mat-cell *matCellDef="let a" class="tabular-nums font-semibold">{{ a.totalRecharges }}</td>
              </ng-container>

              <ng-container matColumnDef="firstSeen">
                <th mat-header-cell *matHeaderCellDef>First Seen</th>
                <td mat-cell *matCellDef="let a" class="text-xs text-neutral-a11">{{ a.firstSeenAt | date:'mediumDate' }}</td>
              </ng-container>

              <ng-container matColumnDef="lastActive">
                <th mat-header-cell *matHeaderCellDef>Last Active</th>
                <td mat-cell *matCellDef="let a" class="text-xs text-neutral-a11">{{ a.lastSeenAt | date:'mediumDate' }}</td>
              </ng-container>

              <ng-container matColumnDef="lastDevice">
                <th mat-header-cell *matHeaderCellDef>Last Device</th>
                <td mat-cell *matCellDef="let a" class="font-mono text-xs text-neutral-a9">{{ a.lastMacAddress || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="archived">
                <th mat-header-cell *matHeaderCellDef>Archived</th>
                <td mat-cell *matCellDef="let a">
                  <div>
                    <p class="text-xs text-neutral-a11">{{ a.archivedAt | date:'mediumDate' }}</p>
                    <p class="text-[10px] text-neutral-a9">{{ a.archivedReason }}</p>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr class="group relative hover:bg-neutral-a2" mat-row *matRowDef="let _; columns: cols;"></tr>
            </table>
          </div>

          @if (archives().length === 0 && !loading()) {
            <div class="flex flex-col items-center py-16 text-center">
              <div class="flex size-16 items-center justify-center rounded-full bg-neutral-a3">
                <mat-icon svgIcon="history" class="size-8 text-neutral-a9" />
              </div>
              <p class="mt-4 text-sm font-medium text-neutral-a11">No archived guests yet</p>
              <p class="mt-1 text-xs text-neutral-a9">Archives appear here once the cleanup job runs</p>
            </div>
          }

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
export class HotspotArchiveComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);

  readonly loading = signal(true);
  readonly archives = signal<HotspotGuestArchiveDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['guest', 'username', 'phone', 'sessions', 'firstSeen', 'lastActive', 'lastDevice', 'archived'];

  searchQuery = '';
  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.customerApi.getHotspotArchive(this.pageIndex, this.pageSize, this.searchQuery).subscribe({
      next: page => {
        this.archives.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applySearch(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }
}

