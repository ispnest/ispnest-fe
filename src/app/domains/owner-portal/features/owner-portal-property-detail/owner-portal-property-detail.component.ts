import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OwnerPortalApiService } from '@/app/domains/owner-portal/data';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
import { DocumentListComponent } from '@/app/domains/real-estate/ui/document-list';
import { PhotoGalleryComponent } from '@/app/domains/real-estate/ui/photo-gallery';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-owner-portal-property-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DecimalPipe,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatIconButton,
    MatIcon,
    MatTabGroup,
    MatTab,
    MatTabContent,
    StatusBadgeComponent,
    LoadingComponent,
    PhotoGalleryComponent,
    DocumentListComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-5xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-10">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/owner-portal/dashboard">
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
      </div>

      <app-loading [loading]="loading()" />

      @if (property() && !loading()) {
        @let p = property()!;

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                >
                  <mat-icon svgIcon="map-pin" class="size-4 text-primary-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Address
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
                  <dt class="text-neutral-a11">Country</dt>
                  <dd class="font-medium">{{ p.country || '—' }}</dd>
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
              </dl>
            </mat-card-content>
          </mat-card>
        </div>

        @if (p.amenities.length > 0) {
          <mat-card appearance="filled">
            <mat-card-content class="p-4">
              <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                Amenities
              </p>
              <div class="flex flex-wrap gap-2">
                @for (a of p.amenities; track a.id) {
                  <span
                    class="inline-flex items-center rounded-full bg-neutral-a3 px-2.5 py-1 text-xs font-medium text-neutral-a11"
                  >
                    {{ a.name }}
                  </span>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }

        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Photos">
              <ng-template matTabContent>
                <div class="p-4">
                  <app-photo-gallery
                    [propertyId]="propertyId"
                    [readOnly]="true"
                    [loadOverride]="photosLoader"
                  />
                </div>
              </ng-template>
            </mat-tab>
            <mat-tab label="Documents">
              <ng-template matTabContent>
                <div class="p-4">
                  <app-document-list
                    [propertyId]="propertyId"
                    [readOnly]="true"
                    [loadOverride]="documentsLoader"
                  />
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
})
export class OwnerPortalPropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ownerPortalApi = inject(OwnerPortalApiService);

  readonly loading = signal(true);
  readonly property = signal<PropertyDto | null>(null);

  propertyId = '';

  readonly photosLoader = (propertyId: string) => this.ownerPortalApi.getPhotos(propertyId);
  readonly documentsLoader = (propertyId: string) => this.ownerPortalApi.getDocuments(propertyId);

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id') ?? '';
    this.ownerPortalApi.getMyProperty(this.propertyId).subscribe({
      next: (p) => {
        this.property.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
