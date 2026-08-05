import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { RenterApiService } from '@/app/domains/real-estate/data/renter-api.service';
import { RenterDto } from '@/app/domains/real-estate/data/renter.model';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-renters-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCard,
    MatPaginator,
    MatFormField,
    MatLabel,
    MatInput,
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
          <h1 class="text-3xl font-semibold tracking-tight">Renters</h1>
          <p class="mt-1 text-neutral-a11">{{ totalElements() }} total renters</p>
        </div>
        @if (auth.hasPermission('RENTERS_WRITE')) {
          <a matButton class="primary" routerLink="/admin/real-estate/renters/new">
            <mat-icon svgIcon="user-round-plus" />
            New Renter
          </a>
        }
      </div>

      <mat-card>
        <!-- Filters -->
        <div class="flex flex-wrap items-end gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="min-w-48 flex-1" subscriptSizing="dynamic">
            <mat-label>Search</mat-label>
            <mat-icon svgIcon="search" matPrefix />
            <input
              matInput
              [(ngModel)]="searchQuery"
              (keyup.enter)="resetAndLoad()"
              placeholder="Name, phone, email…"
            />
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <div class="relative isolate overflow-x-visible overflow-y-hidden">
          <table
            mat-table
            [dataSource]="renters()"
            class="w-full [--table-body-row-height:auto] [--table-cell-padding-x:--spacing(4)] sm:[--table-cell-padding-x:--spacing(5)]"
          >
            <ng-container matColumnDef="renter">
              <td mat-cell *matCellDef="let r">
                <div class="flex items-start gap-3 py-3 sm:gap-4">
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-a3 text-sm font-semibold text-primary-a11"
                  >
                    {{ r.fullName?.charAt(0)?.toUpperCase() }}
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ r.fullName }}</p>

                    <div
                      class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-a11"
                    >
                      @if (r.email) {
                        <span class="break-all">{{ r.email }}</span>
                      }
                      @if (r.phoneNumber) {
                        <span>{{ r.phoneNumber }}</span>
                      }
                    </div>

                    <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <app-status-badge [status]="r.status" />
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <td mat-cell *matCellDef="let r">
                <div class="flex shrink-0 items-start">
                  <button
                    matIconButton
                    [matMenuTriggerFor]="actionMenu"
                    [matMenuTriggerData]="{ renter: r }"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </div>
              </td>
            </ng-container>

            <tr
              mat-row
              *matRowDef="let r; columns: cols"
              class="group relative cursor-pointer hover:bg-neutral-a2"
              (click)="goToRenter(r)"
            ></tr>
          </table>
          @if (renters().length === 0 && !loading()) {
            <div class="flex flex-col items-center gap-2 p-12 text-center text-neutral-a9">
              <mat-icon svgIcon="user-round" class="size-10 text-neutral-a6" />
              <div class="font-medium">No renters found</div>
              <div class="text-sm">Try adjusting your search</div>
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
      <ng-template matMenuContent let-renter="renter">
        <a mat-menu-item [routerLink]="['/admin/real-estate/renters', renter.id]">
          <mat-icon svgIcon="eye" />
          View
        </a>
        @if (auth.hasPermission('RENTERS_WRITE')) {
          <a mat-menu-item [routerLink]="['/admin/real-estate/renters', renter.id, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
        @if (auth.hasPermission('RENTERS_DELETE')) {
          <button mat-menu-item (click)="deleteRenter(renter)">
            <mat-icon svgIcon="trash" />
            Delete
          </button>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class RentersListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly renterApi = inject(RenterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly renters = signal<RenterDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['renter', 'actions'];

  searchQuery = '';
  pageIndex = 0;
  pageSize = 20;

  goToRenter(renter: RenterDto): void {
    this.router.navigate(['/admin/real-estate/renters', renter.id]);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.renterApi.getPage(this.pageIndex, this.pageSize, 'fullName,asc', this.searchQuery).subscribe({
      next: (page) => {
        this.renters.set(page.content);
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

  deleteRenter(renter: RenterDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Renter',
          message: `Are you sure you want to delete "${renter.fullName}"?`,
          confirmText: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.renterApi.delete(renter.id).subscribe({
          next: () => {
            this.renters.update((list) => list.filter((r) => r.id !== renter.id));
            this.totalElements.update((n) => n - 1);
            this.snackBar.open('Renter deleted', 'OK', { duration: 3000 });
          },
          error: (err: { error?: { detail?: string; message?: string } }) =>
            this.snackBar.open(
              err?.error?.detail ?? err?.error?.message ?? 'Failed to delete renter',
              'Close',
              { duration: 4000 },
            ),
        });
      });
  }
}
