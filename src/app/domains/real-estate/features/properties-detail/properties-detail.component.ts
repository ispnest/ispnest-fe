import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
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
import { LeaseApiService } from '@/app/domains/real-estate/data/lease-api.service';
import { LeaseDto } from '@/app/domains/real-estate/data/lease.model';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
import { AmenityPickerComponent } from '@/app/domains/real-estate/ui/amenity-picker';
import { DocumentListComponent } from '@/app/domains/real-estate/ui/document-list';
import { PhotoGalleryComponent } from '@/app/domains/real-estate/ui/photo-gallery';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-properties-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
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
    PhotoGalleryComponent,
    DocumentListComponent,
    AmenityPickerComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/real-estate/properties">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="home" class="size-7 text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-2xl font-semibold tracking-tight">{{ property()?.name }}</h1>
          <p class="mt-0.5 text-sm text-neutral-a11">
            {{ property()?.city }}{{ property()?.city && property()?.region ? ', ' : '' }}{{
              property()?.region
            }}
          </p>
        </div>
        @if (property()) {
          <app-status-badge [status]="property()!.status" />
        }
        @if (auth.hasPermission('PROPERTIES_WRITE')) {
          <a class="primary" matButton [routerLink]="['/admin/real-estate/properties', propertyId, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (property() && !loading()) {
        @let p = property()!;

        <!-- Info cards -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                >
                  <mat-icon svgIcon="map-pin" class="size-4 text-primary-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Address & GPS
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between gap-2">
                  <dt class="shrink-0 text-neutral-a11">Address</dt>
                  <dd class="text-right font-medium">
                    {{ p.addressLine1 || '—' }}
                    @if (p.addressLine2) {
                      <br />{{ p.addressLine2 }}
                    }
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Postal Code</dt>
                  <dd class="font-medium">{{ p.postalCode || '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Country</dt>
                  <dd class="font-medium">{{ p.country || '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Coordinates</dt>
                  <dd class="font-medium">
                    @if (p.latitude !== null && p.longitude !== null) {
                      {{ p.latitude }}, {{ p.longitude }}
                    } @else {
                      —
                    }
                  </dd>
                </div>
              </dl>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-a3"
                >
                  <mat-icon svgIcon="ruler" class="size-4 text-violet-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Details
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Bedrooms</dt>
                  <dd class="font-medium">{{ p.bedrooms ?? '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Bathrooms</dt>
                  <dd class="font-medium">{{ p.bathrooms ?? '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Size</dt>
                  <dd class="font-medium">
                    {{ p.sizeSqm !== null ? (p.sizeSqm | number: '1.0-0') + ' sqm' : '—' }}
                  </dd>
                </div>
                @if (p.notes) {
                  <div class="pt-1 text-neutral-a11">{{ p.notes }}</div>
                }
              </dl>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-a3"
                >
                  <mat-icon svgIcon="user-round" class="size-4 text-amber-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Owner
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <a
                [routerLink]="['/admin/real-estate/owners', p.ownerId]"
                class="flex items-center gap-2 text-sm font-medium text-primary-a11 hover:underline"
              >
                {{ p.ownerName || 'View owner' }}
                <mat-icon svgIcon="arrow-right" class="size-3.5" />
              </a>
              <p class="mt-2 text-xs text-neutral-a9">
                Created {{ p.createdAt | date: 'mediumDate' }} · Updated
                {{ p.updatedAt | date: 'mediumDate' }}
              </p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Overview">
              <div class="p-4 text-sm text-neutral-a11">
                <p>
                  {{ p.propertyType }} · {{ p.rentalType }} rental ·
                  {{ p.photoCount }} photo{{ p.photoCount === 1 ? '' : 's' }} ·
                  {{ p.documentCount }} document{{ p.documentCount === 1 ? '' : 's' }}
                </p>
              </div>
            </mat-tab>

            <mat-tab label="Leases">
              <ng-template matTabContent>
                <div class="flex flex-col">
                  <div class="flex justify-end p-3">
                    @if (auth.hasPermission('LEASES_WRITE')) {
                      <a
                        matButton
                        class="primary"
                        [routerLink]="['/admin/real-estate/leases/new']"
                        [queryParams]="{ propertyId: propertyId }"
                      >
                        <mat-icon svgIcon="file-signature" />
                        New Lease
                      </a>
                    }
                  </div>
                  <app-loading [loading]="loadingLeases()" />
                  <div class="relative isolate overflow-x-visible overflow-y-hidden">
                    <table
                      class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                      mat-table
                      [dataSource]="leases()"
                    >
                      <ng-container matColumnDef="renter">
                        <th mat-header-cell *matHeaderCellDef>Renter</th>
                        <td mat-cell *matCellDef="let l">
                          <a
                            [routerLink]="['/admin/real-estate/renters', l.renterId]"
                            class="font-medium text-primary-a11 hover:underline"
                            >{{ l.renterName }}</a
                          >
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="dates">
                        <th mat-header-cell *matHeaderCellDef>Dates</th>
                        <td mat-cell *matCellDef="let l">
                          {{ l.startDate }} – {{ l.endDate || 'Open-ended' }}
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="rent">
                        <th mat-header-cell *matHeaderCellDef>Rent</th>
                        <td mat-cell *matCellDef="let l">{{ l.rentAmount }} / {{ l.billingCycle }}</td>
                      </ng-container>
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let l">
                          <app-status-badge [status]="l.status" />
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="leaseCols"></tr>
                      <tr
                        class="group relative cursor-pointer hover:bg-neutral-a2"
                        mat-row
                        *matRowDef="let l; columns: leaseCols"
                        [routerLink]="['/admin/real-estate/leases', l.id]"
                      ></tr>
                    </table>
                    @if (leases().length === 0 && !loadingLeases()) {
                      <p class="py-8 text-center text-sm text-neutral-a9">No leases yet</p>
                    }
                  </div>
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Photos">
              <ng-template matTabContent>
                <div class="p-4">
                  <app-photo-gallery [propertyId]="propertyId" />
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Documents">
              <ng-template matTabContent>
                <div class="p-4">
                  <app-document-list [propertyId]="propertyId" />
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Amenities">
              <ng-template matTabContent>
                <div class="p-4">
                  @if (!editingAmenities()) {
                    <div class="flex flex-col gap-3">
                      @if (p.amenities.length === 0) {
                        <p class="text-sm text-neutral-a9">No amenities assigned.</p>
                      } @else {
                        <div class="flex flex-wrap gap-2">
                          @for (a of p.amenities; track a.id) {
                            <span
                              class="inline-flex items-center rounded-full bg-neutral-a3 px-2.5 py-1 text-xs font-medium text-neutral-a11"
                            >
                              {{ a.name }}
                            </span>
                          }
                        </div>
                      }
                      @if (auth.hasPermission('PROPERTIES_WRITE')) {
                        <button matButton type="button" class="w-fit" (click)="startEditAmenities(p)">
                          <mat-icon svgIcon="pencil" />
                          Edit Amenities
                        </button>
                      }
                    </div>
                  } @else {
                    <div class="flex flex-col gap-3">
                      <app-amenity-picker [(selectedIds)]="editingAmenityIds" />
                      <div class="flex justify-end gap-2">
                        <button matButton type="button" (click)="editingAmenities.set(false)">
                          Cancel
                        </button>
                        <button
                          matButton
                          class="primary"
                          type="button"
                          [disabled]="savingAmenities()"
                          (click)="saveAmenities()"
                        >
                          {{ savingAmenities() ? 'Saving…' : 'Save Amenities' }}
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
})
export class PropertiesDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly leaseApi = inject(LeaseApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly property = signal<PropertyDto | null>(null);
  readonly editingAmenities = signal(false);
  readonly editingAmenityIds = signal<string[]>([]);
  readonly savingAmenities = signal(false);
  readonly loadingLeases = signal(true);
  readonly leases = signal<LeaseDto[]>([]);
  readonly leaseCols = ['renter', 'dates', 'rent', 'status'];

  propertyId = '';

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.propertyApi.getById(this.propertyId).subscribe({
      next: (p) => {
        this.property.set(p);
        this.loading.set(false);
        this.loadLeases();
      },
      error: () => this.loading.set(false),
    });
  }

  loadLeases(): void {
    this.loadingLeases.set(true);
    this.leaseApi.getPage(0, 50, 'startDate,desc', '', this.propertyId).subscribe({
      next: (page) => {
        this.leases.set(page.content);
        this.loadingLeases.set(false);
      },
      error: () => this.loadingLeases.set(false),
    });
  }

  startEditAmenities(p: PropertyDto): void {
    this.editingAmenityIds.set(p.amenities.map((a) => a.id));
    this.editingAmenities.set(true);
  }

  saveAmenities(): void {
    this.savingAmenities.set(true);
    this.propertyApi.updateAmenities(this.propertyId, this.editingAmenityIds()).subscribe({
      next: () => {
        this.savingAmenities.set(false);
        this.editingAmenities.set(false);
        this.snackBar.open('Amenities updated', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => {
        this.savingAmenities.set(false);
        this.snackBar.open('Failed to update amenities', 'Close', { duration: 3000 });
      },
    });
  }
}
