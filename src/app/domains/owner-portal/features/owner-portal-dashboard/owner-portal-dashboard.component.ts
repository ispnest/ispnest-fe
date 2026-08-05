import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { OwnerPortalApiService } from '@/app/domains/owner-portal/data';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-owner-portal-dashboard',
  standalone: true,
  imports: [RouterLink, MatCard, MatIcon, LoadingComponent, StatusBadgeComponent],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div class="mx-auto flex w-full max-w-5xl flex-auto flex-col gap-6 p-6 lg:p-10">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          Welcome{{ auth.currentUser()?.displayName ? ', ' + auth.currentUser()?.displayName : '' }}
        </h1>
        <p class="mt-1 text-neutral-a11">{{ properties().length }} propert{{ properties().length === 1 ? 'y' : 'ies' }}</p>
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        @if (properties().length === 0) {
          <div class="flex flex-col items-center gap-2 rounded-xl border border-neutral-a5 p-12 text-center text-neutral-a9">
            <mat-icon svgIcon="home" class="size-10 text-neutral-a6" />
            <div class="font-medium">No properties yet</div>
            <div class="text-sm">Properties assigned to you will appear here.</div>
          </div>
        } @else {
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (p of properties(); track p.id) {
              <a [routerLink]="['/owner-portal/properties', p.id]">
                <mat-card appearance="outlined" class="h-full transition-shadow hover:shadow-md">
                  <div class="flex flex-col gap-3 p-4">
                    <div class="flex items-start justify-between gap-2">
                      <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-a3"
                      >
                        <mat-icon svgIcon="home" class="size-5 text-primary-a11" />
                      </div>
                      <app-status-badge [status]="p.status" />
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-semibold">{{ p.name }}</p>
                      <p class="mt-0.5 truncate text-sm text-neutral-a11">
                        {{ p.addressLine1 || p.city || 'No address on file' }}
                      </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 text-[10px]">
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
                </mat-card>
              </a>
            }
          </div>
        }
      }
    </div>
  `,
})
export class OwnerPortalDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly ownerPortalApi = inject(OwnerPortalApiService);

  readonly loading = signal(true);
  readonly properties = signal<PropertyDto[]>([]);

  ngOnInit(): void {
    this.ownerPortalApi.getMyProperties(0, 100).subscribe({
      next: (page) => {
        this.properties.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
