import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';
import {
  CustomerDto,
  RechargeDto,
  MacBindingDto,
} from '@/app/domains/customers/data/customer.model';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-hotspot-guest-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
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
    LoadingComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/hotspot">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <p class="text-sm text-neutral-a11">Back to Hotspot Guests</p>
      </div>

      <app-loading [loading]="loading()" />

      @if (guest(); as g) {
        <!-- Header -->
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-accent-a3">
              <mat-icon svgIcon="wifi" class="size-7 text-accent-a11" />
            </div>
            <div>
              <h1 class="text-2xl font-semibold tracking-tight">
                {{ g.fullName || g.accountCode }}
              </h1>
              <p class="mt-0.5 flex items-center gap-2 text-sm text-neutral-a11">
                <span class="font-mono">{{ g.accountCode }}</span>
                <app-status-badge [status]="g.status" />
              </p>
            </div>
          </div>
          <button matButton class="warn" (click)="archiveGuest(g)" [disabled]="archiving()">
            <mat-icon svgIcon="archive" />
            {{ archiving() ? 'Archiving…' : 'Archive Guest' }}
          </button>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Identity -->
          <mat-card class="p-5">
            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-a11">
              Identity
            </p>
            <dl class="space-y-3">
              <div class="flex items-center justify-between">
                <dt class="text-xs text-neutral-a11">Username</dt>
                <dd class="font-mono text-sm font-bold">{{ g.accountCode }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-xs text-neutral-a11">Phone</dt>
                <dd class="text-sm">{{ g.phoneNumber || '—' }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-xs text-neutral-a11">Full Name</dt>
                <dd class="text-sm">{{ g.fullName || '—' }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-xs text-neutral-a11">First Seen</dt>
                <dd class="text-xs text-neutral-a11">{{ g.createdAt | date: 'medium' }}</dd>
              </div>
            </dl>
          </mat-card>

          <!-- MAC Bindings -->
          <mat-card class="p-5">
            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-a11">
              Bound Devices
              <span class="ml-1 rounded-full bg-accent-a3 px-2 py-0.5 text-accent-a11">{{
                macBindings().length
              }}</span>
            </p>
            @if (macBindings().length > 0) {
              <div class="space-y-2">
                @for (mac of macBindings(); track mac.id) {
                  <div class="flex items-center justify-between rounded-xl bg-neutral-a2 px-3 py-2">
                    <span class="font-mono text-xs font-bold">{{ mac.macAddress }}</span>
                    <span class="text-[10px] text-neutral-a11">
                      {{ mac.lastSeen ? 'Last: ' + (mac.lastSeen | date: 'd MMM HH:mm') : '' }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-xs italic text-neutral-a9">No devices bound yet</p>
            }
          </mat-card>
        </div>

        <!-- Session History -->
        <mat-card class="overflow-hidden">
          <div class="border-b border-neutral-a6 px-5 py-4">
            <p class="text-sm font-bold">Session History</p>
          </div>
          <div class="flex flex-col">
            <div class="relative isolate overflow-x-visible overflow-y-hidden">
              <table
                class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                mat-table
                [dataSource]="recharges()"
              >
                <ng-container matColumnDef="rechargedOn">
                  <th mat-header-cell *matHeaderCellDef>Started</th>
                  <td mat-cell *matCellDef="let r" class="text-xs text-neutral-a11">
                    {{ r.rechargedOn | date: 'medium' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="expiration">
                  <th mat-header-cell *matHeaderCellDef>Expires</th>
                  <td mat-cell *matCellDef="let r" class="text-xs text-neutral-a11">
                    {{ r.expiration ? (r.expiration | date: 'medium') : '—' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="method">
                  <th mat-header-cell *matHeaderCellDef>Method</th>
                  <td mat-cell *matCellDef="let r" class="text-xs text-neutral-a11 capitalize">
                    {{ r.method || '—' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let r">
                    <app-status-badge [status]="r.status" />
                  </td>
                </ng-container>
                <ng-container matColumnDef="dataLeft">
                  <th mat-header-cell *matHeaderCellDef>Data Left</th>
                  <td mat-cell *matCellDef="let r" class="text-xs text-neutral-a11 tabular-nums">
                    {{
                      r.remainingMb !== null
                        ? (r.remainingMb / 1024 | number: '1.1-1') + ' GB'
                        : 'Unlimited'
                    }}
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="rechargeCols"></tr>
                <tr
                  class="group relative hover:bg-neutral-a2"
                  mat-row
                  *matRowDef="let _; columns: rechargeCols"
                ></tr>
              </table>
            </div>
            @if (recharges().length === 0 && !loading()) {
              <div class="py-10 text-center text-sm text-neutral-a11">No sessions yet</div>
            }
          </div>
        </mat-card>
      }
    </div>
  `,
})
export class HotspotGuestDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerApi = inject(CustomerApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly archiving = signal(false);
  readonly guest = signal<CustomerDto | null>(null);
  readonly recharges = signal<RechargeDto[]>([]);
  readonly macBindings = signal<MacBindingDto[]>([]);
  readonly rechargeCols = ['rechargedOn', 'expiration', 'method', 'status', 'dataLeft'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.customerApi.getById(id).subscribe({
      next: (g) => {
        this.guest.set(g);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.customerApi.getRecharges(id).subscribe((r) => this.recharges.set(r));
    this.customerApi.getMacBindings(id).subscribe((m) => this.macBindings.set(m));
  }

  archiveGuest(g: CustomerDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Archive Guest',
          message: `Archive and permanently remove ${g.fullName || g.accountCode}? A record will be kept in the connection history.`,
          confirmText: 'Archive',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.archiving.set(true);
        this.customerApi.archiveGuest(g.id).subscribe({
          next: () => {
            this.snackBar.open('Guest archived', 'OK', { duration: 3000 });
            this.router.navigate(['/admin/hotspot']);
          },
          error: () => {
            this.archiving.set(false);
            this.snackBar.open('Failed to archive guest', 'Close', { duration: 3000 });
          },
        });
      });
  }
}
