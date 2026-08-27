import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { RouterOnboardingApiService } from '@/app/domains/network/data';
import { LoadingComponent } from '@/app/ui/loading';
import { RouterActivityTerminalComponent } from '../router-onboarding/router-activity-terminal.component';
import { RouterPlanAttachmentsComponent } from '../router-onboarding/router-plan-attachments.component';
import { RouterDetailStore } from './router-detail.store';

/**
 * "At a glance" tab: quick facts and short lists as compact cards — management state, a live
 * terminal-styled activity feed (self-sufficient, own resync + SSE subscribe — see {@link
 * RouterActivityTerminalComponent}), IP pools, plan attachments. Anything that grows into genuinely
 * bulky, independent content is a candidate for splitting into its own tab later; nothing here is
 * that yet.
 */
@Component({
  selector: 'app-router-overview',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatCard,
    MatButton,
    LoadingComponent,
    RouterActivityTerminalComponent,
    RouterPlanAttachmentsComponent,
  ],
  template: `
    <app-loading [loading]="store.loading()" />

    @if (!store.loading()) {
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Management State -->
        <mat-card class="p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-semibold">Management State</h2>
            <button
              matButton
              class="tertiary"
              type="button"
              (click)="reconcile()"
              [disabled]="reconciling()"
            >
              {{ reconciling() ? 'Reconciling…' : 'Trigger Reconciliation' }}
            </button>
          </div>
          @if (store.managementState(); as state) {
            <dl class="flex flex-col gap-1.5 text-sm">
              <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt class="text-neutral-a11">Hardware serial</dt>
                <dd class="font-mono">{{ state.hardwareSerial ?? '—' }}</dd>
              </div>
              <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt class="text-neutral-a11">RouterOS version</dt>
                <dd class="font-medium">{{ state.routerosVersion ?? '—' }}</dd>
              </div>
              <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt class="text-neutral-a11">Board</dt>
                <dd class="font-medium">{{ state.boardName ?? '—' }}</dd>
              </div>
              <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt class="text-neutral-a11">Last heartbeat</dt>
                <dd class="font-medium">
                  {{ state.lastHeartbeatAt ? (state.lastHeartbeatAt | date: 'short') : 'never' }}
                </dd>
              </div>
              <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt class="text-neutral-a11">Last reconciled</dt>
                <dd class="font-medium">
                  {{ state.lastReconciledAt ? (state.lastReconciledAt | date: 'short') : 'never' }}
                </dd>
              </div>
              <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt class="text-neutral-a11">Consecutive failures</dt>
                <dd class="font-medium">{{ state.consecutiveFailures }}</dd>
              </div>
            </dl>
          }
        </mat-card>

        <!-- Recent Activity -->
        <mat-card class="p-4">
          <h2 class="mb-3 text-sm font-semibold">Recent Activity</h2>
          <app-router-activity-terminal [routerId]="store.routerId" maxHeight="18rem" />
        </mat-card>

        <!-- IP Pools -->
        <mat-card class="p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-semibold">IP Pools</h2>
            <span class="text-xs text-neutral-a10">{{ store.pools().length }} total</span>
          </div>
          @if (store.pools().length > 0) {
            <ul class="flex flex-col gap-1.5">
              @for (pool of store.pools(); track pool.id) {
                <li class="flex items-center justify-between text-sm">
                  <span class="font-medium">{{ pool.name }}</span>
                  <span class="font-mono text-xs text-neutral-a10">{{ pool.rangeIp }}</span>
                </li>
              }
            </ul>
          } @else {
            <p class="text-sm text-neutral-a11">No pools tracked for this router yet.</p>
          }
          <a matButton class="tertiary mt-3 self-start" routerLink="/admin/pools/new"> Add Pool </a>
        </mat-card>

        <!-- Plans -->
        <mat-card class="p-4">
          <h2 class="mb-3 text-sm font-semibold">Plans</h2>
          <app-router-plan-attachments [routerId]="store.routerId" />
        </mat-card>
      </div>
    }
  `,
})
export class RouterOverviewComponent {
  protected readonly store = inject(RouterDetailStore);
  private readonly onboardingApi = inject(RouterOnboardingApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly reconciling = signal(false);

  reconcile(): void {
    this.reconciling.set(true);
    this.onboardingApi.reconcile(this.store.routerId).subscribe({
      next: (result) => {
        this.reconciling.set(false);
        this.snackBar.open(`Reconciliation complete — router is ${result.routerState}`, 'OK', {
          duration: 3000,
        });
        this.store.refreshManagementState();
      },
      error: () => {
        this.reconciling.set(false);
        this.snackBar.open('Reconciliation failed', 'Close', { duration: 3000 });
      },
    });
  }
}
