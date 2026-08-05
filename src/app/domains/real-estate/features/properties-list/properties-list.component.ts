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
import { MatOption, MatSelect } from '@angular/material/select';
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
import { OwnerApiService } from '@/app/domains/real-estate/data/owner-api.service';
import { OwnerDto } from '@/app/domains/real-estate/data/owner.model';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-properties-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCard,
    MatPaginator,
    MatFormField,
    MatLabel,
    MatInput,
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
          <h1 class="text-3xl font-semibold tracking-tight">Properties</h1>
          <p class="mt-1 text-neutral-a11">{{ totalElements() }} total properties</p>
        </div>
        @if (auth.hasPermission('PROPERTIES_WRITE')) {
          <a matButton class="primary" routerLink="/admin/real-estate/properties/new">
            <mat-icon svgIcon="plus" />
            New Property
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
              placeholder="Name, address…"
            />
          </mat-form-field>
          <mat-form-field class="w-40" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="DRAFT">Draft</mat-option>
              <mat-option value="AVAILABLE">Available</mat-option>
              <mat-option value="OCCUPIED">Occupied</mat-option>
              <mat-option value="UNDER_MAINTENANCE">Under Maintenance</mat-option>
              <mat-option value="INACTIVE">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-40" subscriptSizing="dynamic">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="propertyTypeFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="HOUSE">House</mat-option>
              <mat-option value="APARTMENT">Apartment</mat-option>
              <mat-option value="VILLA">Villa</mat-option>
              <mat-option value="ROOM">Room</mat-option>
              <mat-option value="COMMERCIAL_UNIT">Commercial Unit</mat-option>
              <mat-option value="LAND">Land</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-40" subscriptSizing="dynamic">
            <mat-label>Rental</mat-label>
            <mat-select [(ngModel)]="rentalTypeFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="SHORT_TERM">Short Term</mat-option>
              <mat-option value="LONG_TERM">Long Term</mat-option>
              <mat-option value="BOTH">Both</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-48" subscriptSizing="dynamic">
            <mat-label>Owner</mat-label>
            <mat-select [(ngModel)]="ownerFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              @for (o of owners(); track o.id) {
                <mat-option [value]="o.id">{{ o.fullName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <div class="relative isolate overflow-x-visible overflow-y-hidden">
          <table
            mat-table
            [dataSource]="properties()"
            class="w-full [--table-body-row-height:auto] [--table-cell-padding-x:--spacing(4)] sm:[--table-cell-padding-x:--spacing(5)]"
          >
            <ng-container matColumnDef="property">
              <td mat-cell *matCellDef="let p">
                <div class="flex items-start gap-3 py-3 sm:gap-4">
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-a3 text-sm font-semibold text-primary-a11"
                  >
                    {{ p.name?.charAt(0)?.toUpperCase() }}
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ p.name }}</p>

                    <div
                      class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-a11"
                    >
                      @if (p.ownerName) {
                        <span class="font-medium text-neutral-a12">{{ p.ownerName }}</span>
                      }
                      @if (p.city) {
                        <span>{{ p.city }}</span>
                      }
                    </div>

                    <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <app-status-badge [status]="p.status" />
                      <span
                        class="inline-flex rounded-full bg-neutral-a3 px-1.5 py-0.5 font-medium text-neutral-a11 capitalize"
                      >
                        {{ p.propertyType }}
                      </span>
                      <span
                        class="inline-flex rounded-full bg-neutral-a3 px-1.5 py-0.5 font-medium text-neutral-a11 capitalize"
                      >
                        {{ p.rentalType }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <td mat-cell *matCellDef="let p">
                <div class="flex shrink-0 items-start">
                  <button
                    matIconButton
                    [matMenuTriggerFor]="actionMenu"
                    [matMenuTriggerData]="{ property: p }"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </div>
              </td>
            </ng-container>

            <tr
              mat-row
              *matRowDef="let p; columns: cols"
              class="group relative cursor-pointer hover:bg-neutral-a2"
              (click)="goToProperty(p)"
            ></tr>
          </table>
          @if (properties().length === 0 && !loading()) {
            <div class="flex flex-col items-center gap-2 p-12 text-center text-neutral-a9">
              <mat-icon svgIcon="home" class="size-10 text-neutral-a6" />
              <div class="font-medium">No properties found</div>
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
      <ng-template matMenuContent let-property="property">
        <a mat-menu-item [routerLink]="['/admin/real-estate/properties', property.id]">
          <mat-icon svgIcon="eye" />
          View
        </a>
        @if (auth.hasPermission('PROPERTIES_WRITE')) {
          <a mat-menu-item [routerLink]="['/admin/real-estate/properties', property.id, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
        @if (auth.hasPermission('PROPERTIES_DELETE') && property.status !== 'INACTIVE') {
          <button mat-menu-item (click)="deactivateProperty(property)">
            <mat-icon svgIcon="ban" />
            Deactivate
          </button>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class PropertiesListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly ownerApi = inject(OwnerApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly properties = signal<PropertyDto[]>([]);
  readonly owners = signal<OwnerDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['property', 'actions'];

  searchQuery = '';
  statusFilter = '';
  propertyTypeFilter = '';
  rentalTypeFilter = '';
  ownerFilter = '';
  pageIndex = 0;
  pageSize = 20;

  goToProperty(property: PropertyDto): void {
    this.router.navigate(['/admin/real-estate/properties', property.id]);
  }

  ngOnInit(): void {
    this.load();
    this.ownerApi.getPage(0, 200).subscribe((page) => this.owners.set(page.content));
  }

  load(): void {
    this.loading.set(true);
    this.propertyApi
      .getPage(
        this.pageIndex,
        this.pageSize,
        'createdAt,desc',
        this.statusFilter,
        this.propertyTypeFilter,
        this.rentalTypeFilter,
        this.ownerFilter,
        this.searchQuery,
      )
      .subscribe({
        next: (page) => {
          this.properties.set(page.content);
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

  deactivateProperty(property: PropertyDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Deactivate Property',
          message: `Are you sure you want to deactivate "${property.name}"?`,
          confirmText: 'Deactivate',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.propertyApi.delete(property.id).subscribe({
          next: () => {
            this.properties.update((list) =>
              list.map((p) => (p.id === property.id ? { ...p, status: 'INACTIVE' as const } : p)),
            );
            this.snackBar.open('Property deactivated', 'OK', { duration: 3000 });
          },
          error: () =>
            this.snackBar.open('Failed to deactivate property', 'Close', { duration: 3000 }),
        });
      });
  }
}
