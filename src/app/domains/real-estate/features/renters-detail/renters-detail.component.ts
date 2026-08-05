import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
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
import { RenterApiService } from '@/app/domains/real-estate/data/renter-api.service';
import { RenterDto } from '@/app/domains/real-estate/data/renter.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-renters-detail',
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
        <a matIconButton routerLink="/admin/real-estate/renters">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="user-round" class="size-7 text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-2xl font-semibold tracking-tight">{{ renter()?.fullName }}</h1>
          <p class="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-neutral-a11">
            @if (renter()?.email) {
              <span class="break-all">{{ renter()?.email }}</span>
            }
            @if (renter()?.email && renter()?.phoneNumber) {
              <span>·</span>
            }
            <span>{{ renter()?.phoneNumber }}</span>
          </p>
        </div>
        @if (renter()) {
          <app-status-badge [status]="renter()!.status" />
        }
        @if (auth.hasPermission('RENTERS_WRITE')) {
          <a class="primary" matButton [routerLink]="['/admin/real-estate/renters', renterId, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (renter() && !loading()) {
        @let r = renter()!;

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
                  Renter Info
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">ID Number</dt>
                  <dd class="font-medium">{{ r.idNumber || '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Created</dt>
                  <dd class="font-medium">{{ r.createdAt | date: 'mediumDate' }}</dd>
                </div>
                @if (r.notes) {
                  <div class="pt-1 text-neutral-a11">{{ r.notes }}</div>
                }
              </dl>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Leases">
              <ng-template matTabContent>
                <div class="flex flex-col">
                  <app-loading [loading]="loadingLeases()" />
                  <div class="relative isolate overflow-x-visible overflow-y-hidden">
                    <table
                      class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                      mat-table
                      [dataSource]="leases()"
                    >
                      <ng-container matColumnDef="property">
                        <th mat-header-cell *matHeaderCellDef>Property</th>
                        <td mat-cell *matCellDef="let l">
                          <a
                            [routerLink]="['/admin/real-estate/properties', l.propertyId]"
                            class="font-medium text-primary-a11 hover:underline"
                            >{{ l.propertyName }}</a
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
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
})
export class RentersDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly renterApi = inject(RenterApiService);
  private readonly leaseApi = inject(LeaseApiService);

  readonly loading = signal(true);
  readonly renter = signal<RenterDto | null>(null);
  readonly loadingLeases = signal(true);
  readonly leases = signal<LeaseDto[]>([]);
  readonly leaseCols = ['property', 'dates', 'rent', 'status'];

  renterId = '';

  ngOnInit(): void {
    this.renterId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.renterApi.getById(this.renterId).subscribe({
      next: (r) => {
        this.renter.set(r);
        this.loading.set(false);
        this.loadLeases();
      },
      error: () => this.loading.set(false),
    });
  }

  loadLeases(): void {
    this.loadingLeases.set(true);
    this.leaseApi.getPage(0, 50, 'startDate,desc', '', '', this.renterId).subscribe({
      next: (page) => {
        this.leases.set(page.content);
        this.loadingLeases.set(false);
      },
      error: () => this.loadingLeases.set(false),
    });
  }
}
