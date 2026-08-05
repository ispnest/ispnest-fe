import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { OwnerApiService } from '@/app/domains/real-estate/data/owner-api.service';
import { OwnerDto } from '@/app/domains/real-estate/data/owner.model';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { PortalAccessResultDialogComponent } from './portal-access-result-dialog.component';

@Component({
  selector: 'app-owners-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DatePipe,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTabGroup,
    MatTab,
    MatTabContent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    StatusBadgeComponent,
    LoadingComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-6xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/real-estate/owners">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="user-round" class="size-7 text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-2xl font-semibold tracking-tight">{{ owner()?.fullName }}</h1>
          <p class="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-neutral-a11">
            @if (owner()?.email) {
              <span class="break-all">{{ owner()?.email }}</span>
            }
            @if (owner()?.email && owner()?.phoneNumber) {
              <span>·</span>
            }
            <span>{{ owner()?.phoneNumber }}</span>
          </p>
        </div>
        @if (owner()) {
          <app-status-badge [status]="owner()!.status" />
        }
        @if (auth.hasPermission('OWNERS_WRITE')) {
          <a class="primary" matButton [routerLink]="['/admin/real-estate/owners', ownerId, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (owner() && !loading()) {
        @let o = owner()!;

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                >
                  <mat-icon svgIcon="id-card" class="size-4 text-primary-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Owner Info
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">ID Number</dt>
                  <dd class="font-medium">{{ o.idNumber || '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Tax PIN</dt>
                  <dd class="font-medium">{{ o.taxPin || '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Created</dt>
                  <dd class="font-medium">{{ o.createdAt | date: 'mediumDate' }}</dd>
                </div>
                @if (o.notes) {
                  <div class="pt-1 text-neutral-a11">{{ o.notes }}</div>
                }
              </dl>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-a3"
                >
                  <mat-icon svgIcon="key-round" class="size-4 text-violet-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Portal Access
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              @if (loadingPortalAccess()) {
                <app-loading [loading]="true" />
              } @else {
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 text-sm">
                    <mat-icon
                      [svgIcon]="hasPortalAccess() ? 'check-circle' : 'circle-x'"
                      class="size-4"
                      [class]="hasPortalAccess() ? 'text-green-a11' : 'text-neutral-a9'"
                    />
                    <span>{{ hasPortalAccess() ? 'Owner has portal access' : 'No portal access yet' }}</span>
                  </div>
                  @if (!hasPortalAccess() && auth.hasPermission('OWNERS_WRITE')) {
                    <button
                      matButton
                      class="primary"
                      type="button"
                      [disabled]="grantingAccess() || !o.email"
                      (click)="grantPortalAccess()"
                    >
                      {{ grantingAccess() ? 'Granting…' : 'Grant Portal Access' }}
                    </button>
                  }
                </div>
                @if (!o.email) {
                  <p class="mt-2 text-xs text-neutral-a9">
                    Add an email address to this owner before granting portal access.
                  </p>
                }
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Properties">
              <ng-template matTabContent>
                <div class="flex flex-col">
                  <app-loading [loading]="loadingProperties()" />
                  <div class="relative isolate overflow-x-visible overflow-y-hidden">
                    <table
                      class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                      mat-table
                      [dataSource]="properties()"
                    >
                      <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Name</th>
                        <td mat-cell *matCellDef="let p">
                          <a
                            [routerLink]="['/admin/real-estate/properties', p.id]"
                            class="font-medium text-primary-a11 hover:underline"
                            >{{ p.name }}</a
                          >
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="type">
                        <th mat-header-cell *matHeaderCellDef>Type</th>
                        <td mat-cell *matCellDef="let p" class="capitalize">
                          {{ p.propertyType }} · {{ p.rentalType }}
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let p">
                          <app-status-badge [status]="p.status" />
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="propertyCols"></tr>
                      <tr
                        class="group relative hover:bg-neutral-a2"
                        mat-row
                        *matRowDef="let _; columns: propertyCols"
                      ></tr>
                    </table>
                    @if (properties().length === 0 && !loadingProperties()) {
                      <p class="py-8 text-center text-sm text-neutral-a9">No properties yet</p>
                    }
                  </div>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
})
export class OwnersDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly ownerApi = inject(OwnerApiService);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly owner = signal<OwnerDto | null>(null);
  readonly loadingPortalAccess = signal(true);
  readonly hasPortalAccess = signal(false);
  readonly grantingAccess = signal(false);
  readonly loadingProperties = signal(true);
  readonly properties = signal<PropertyDto[]>([]);
  readonly propertyCols = ['name', 'type', 'status'];

  ownerId = '';

  ngOnInit(): void {
    this.ownerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.ownerApi.getById(this.ownerId).subscribe({
      next: (o) => {
        this.owner.set(o);
        this.loading.set(false);
        this.loadPortalAccess();
        this.loadProperties();
      },
      error: () => this.loading.set(false),
    });
  }

  loadPortalAccess(): void {
    this.loadingPortalAccess.set(true);
    this.ownerApi.getPortalAccess(this.ownerId).subscribe({
      next: (res) => {
        this.hasPortalAccess.set(res.hasPortalAccess);
        this.loadingPortalAccess.set(false);
      },
      error: () => this.loadingPortalAccess.set(false),
    });
  }

  loadProperties(): void {
    this.loadingProperties.set(true);
    this.propertyApi.getPage(0, 50, 'createdAt,desc', '', '', '', this.ownerId).subscribe({
      next: (page) => {
        this.properties.set(page.content);
        this.loadingProperties.set(false);
      },
      error: () => this.loadingProperties.set(false),
    });
  }

  grantPortalAccess(): void {
    this.grantingAccess.set(true);
    this.ownerApi.grantPortalAccess(this.ownerId).subscribe({
      next: (res) => {
        this.grantingAccess.set(false);
        this.hasPortalAccess.set(true);
        this.dialog.open(PortalAccessResultDialogComponent, { data: res, disableClose: true });
      },
      error: (err: { error?: { error?: string; message?: string } }) => {
        this.grantingAccess.set(false);
        this.snackBar.open(
          err?.error?.error ?? err?.error?.message ?? 'Failed to grant portal access',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }
}
