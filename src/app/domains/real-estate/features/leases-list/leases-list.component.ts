import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { LeaseApiService } from '@/app/domains/real-estate/data/lease-api.service';
import { LeaseDto } from '@/app/domains/real-estate/data/lease.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-leases-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCard,
    MatPaginator,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatTable,
    MatColumnDef,
    MatCellDef,
    MatCell,
    MatRow,
    MatRowDef,
    LoadingComponent,
    StatusBadgeComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Leases</h1>
          <p class="mt-1 text-neutral-a11">{{ totalElements() }} total leases</p>
        </div>
        @if (auth.hasPermission('LEASES_WRITE')) {
          <a matButton class="primary" routerLink="/admin/real-estate/leases/new">
            <mat-icon svgIcon="file-signature" />
            New Lease
          </a>
        }
      </div>

      <mat-card>
        <!-- Filters -->
        <div class="flex flex-wrap items-end gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="w-48" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="resetAndLoad()">
              <mat-option value="">All statuses</mat-option>
              <mat-option value="DRAFT">Draft</mat-option>
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="ENDED">Ended</mat-option>
              <mat-option value="TERMINATED">Terminated</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <div class="relative isolate overflow-x-visible overflow-y-hidden">
          <table
            mat-table
            [dataSource]="leases()"
            class="w-full [--table-body-row-height:auto] [--table-cell-padding-x:--spacing(4)] sm:[--table-cell-padding-x:--spacing(5)]"
          >
            <ng-container matColumnDef="lease">
              <td mat-cell *matCellDef="let l">
                <div class="flex items-start gap-3 py-3 sm:gap-4">
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-a3 text-primary-a11"
                  >
                    <mat-icon svgIcon="file-signature" class="size-4" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ l.propertyName }}</p>
                    <div
                      class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-a11"
                    >
                      <span>{{ l.renterName }}</span>
                      <span>·</span>
                      <span>{{ l.startDate }} – {{ l.endDate || 'Open-ended' }}</span>
                    </div>
                    <div class="mt-0.5 text-xs text-neutral-a11">
                      {{ l.rentAmount }} / {{ l.billingCycle }}
                    </div>

                    <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <app-status-badge [status]="l.status" />
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <td mat-cell *matCellDef="let l">
                <div class="flex shrink-0 items-start">
                  <button
                    matIconButton
                    [matMenuTriggerFor]="actionMenu"
                    [matMenuTriggerData]="{ lease: l }"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </div>
              </td>
            </ng-container>

            <tr
              mat-row
              *matRowDef="let l; columns: cols"
              class="group relative cursor-pointer hover:bg-neutral-a2"
              (click)="goToLease(l)"
            ></tr>
          </table>
          @if (leases().length === 0 && !loading()) {
            <div class="flex flex-col items-center gap-2 p-12 text-center text-neutral-a9">
              <mat-icon svgIcon="file-signature" class="size-10 text-neutral-a6" />
              <div class="font-medium">No leases found</div>
              <div class="text-sm">Try adjusting your filters</div>
            </div>
          }
        </div>
        <mat-paginator
          class="px-3"
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons
        />
      </mat-card>
    </div>

    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-lease="lease">
        <a mat-menu-item [routerLink]="['/admin/real-estate/leases', lease.id]">
          <mat-icon svgIcon="eye" />
          View
        </a>
        @if (lease.status === 'DRAFT' && auth.hasPermission('LEASES_WRITE')) {
          <a mat-menu-item [routerLink]="['/admin/real-estate/leases', lease.id, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class LeasesListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly leaseApi = inject(LeaseApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly leases = signal<LeaseDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['lease', 'actions'];

  statusFilter = '';
  pageIndex = 0;
  pageSize = 20;

  goToLease(lease: LeaseDto): void {
    this.router.navigate(['/admin/real-estate/leases', lease.id]);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.leaseApi.getPage(this.pageIndex, this.pageSize, 'startDate,desc', this.statusFilter).subscribe({
      next: (page) => {
        this.leases.set(page.content);
        this.totalElements.set(page.page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  resetAndLoad(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }
}
