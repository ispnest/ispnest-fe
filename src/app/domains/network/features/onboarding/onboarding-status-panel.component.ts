import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { RouterApiService, RouterOnboardingStatus } from '@/app/domains/network/data';

type CheckTone = 'ok' | 'warn' | 'pending';

type Check = {
  key: 'script' | 'wireguard' | 'pools' | 'heartbeat';
  label: string;
  detail: string;
  tone: CheckTone;
  done: boolean;
};

/**
 * Live 4-check verification panel. Opens an SSE subscription for the given router and re-renders
 * whenever the backend pushes a new status snapshot. Safe to drop into any page that needs
 * "is this router fully onboarded?" feedback.
 */
@Component({
  selector: 'app-onboarding-status-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatIcon],
  template: `
    @let snap = status();
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold">Verification</h3>
          <p class="text-xs text-neutral-a11">
            {{ doneCount() }} of 4 checks passing — updates live via SSE.
          </p>
        </div>
        @if (snap?.lastSeen) {
          <span class="text-xs text-neutral-a11">
            Last seen {{ snap?.lastSeen | date: 'short' }}
          </span>
        }
      </div>

      <ul class="flex flex-col gap-2">
        @for (c of checks(); track c.key) {
          <li
            class="flex items-start gap-3 rounded-lg border px-3 py-2.5"
            [class.border-green-a6]="c.tone === 'ok'"
            [class.bg-green-a2]="c.tone === 'ok'"
            [class.border-amber-a6]="c.tone === 'warn'"
            [class.bg-amber-a2]="c.tone === 'warn'"
            [class.border-neutral-a6]="c.tone === 'pending'"
            [class.bg-neutral-a2]="c.tone === 'pending'"
          >
            <span
              class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full"
              [class.bg-green-9]="c.tone === 'ok'"
              [class.text-white]="c.tone !== 'pending'"
              [class.bg-amber-9]="c.tone === 'warn'"
              [class.bg-neutral-a4]="c.tone === 'pending'"
              [class.text-neutral-a11]="c.tone === 'pending'"
            >
              <mat-icon
                class="size-3.5!"
                [svgIcon]="c.tone === 'ok' ? 'check' : c.tone === 'warn' ? 'circle-alert' : 'clock'"
              />
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium">{{ c.label }}</p>
              <p class="text-xs text-neutral-a11">{{ c.detail }}</p>
            </div>
          </li>
        }
      </ul>

      @if (error()) {
        <p class="text-xs text-red-a11">
          Connection to live status stream interrupted — values may be stale.
        </p>
      }
    </div>
  `,
})
export class OnboardingStatusPanelComponent implements OnInit {
  private readonly api = inject(RouterApiService);
  private readonly destroyRef = inject(DestroyRef);

  /** Router id to watch. */
  readonly routerId = input.required<string>();

  readonly status = signal<RouterOnboardingStatus | null>(null);
  readonly error = signal(false);

  readonly checks = signal<Check[]>(this.buildChecks(null));
  readonly doneCount = signal(0);

  ngOnInit(): void {
    // First snapshot via plain GET so we render immediately even if SSE is slow.
    this.api.getOnboardingStatus(this.routerId()).subscribe({
      next: (s) => this.apply(s),
      error: () => this.error.set(true),
    });

    this.api
      .streamOnboardingStatus(this.routerId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => {
          this.error.set(false);
          this.apply(s);
        },
        error: () => this.error.set(true),
      });
  }

  private apply(s: RouterOnboardingStatus): void {
    this.status.set(s);
    const list = this.buildChecks(s);
    this.checks.set(list);
    this.doneCount.set(list.filter((c) => c.done).length);
  }

  private buildChecks(s: RouterOnboardingStatus | null): Check[] {
    return [
      {
        key: 'script',
        label: 'Onboarding script generated',
        detail: s?.scriptGenerated
          ? `v${s.latestScriptVersion} ready for download`
          : 'Waiting for script render…',
        tone: s?.scriptGenerated ? 'ok' : 'pending',
        done: !!s?.scriptGenerated,
      },
      {
        key: 'wireguard',
        label: 'WireGuard peer allocated',
        detail: s?.wireGuardReady
          ? `${s.wireGuardClientName} @ ${s.wireGuardAddress}`
          : 'Waiting for tunnel allocation…',
        tone: s?.wireGuardReady ? 'ok' : 'pending',
        done: !!s?.wireGuardReady,
      },
      {
        key: 'pools',
        label: 'IP pools synced to router',
        detail:
          (s?.poolsTotal ?? 0) === 0
            ? 'No pools attached yet (optional)'
            : s?.poolsSynced
              ? `${s.poolsSyncedCount}/${s.poolsTotal} pushed to MikroTik`
              : `${s?.poolsSyncedCount ?? 0}/${s?.poolsTotal ?? 0} pushed — waiting…`,
        tone: (s?.poolsTotal ?? 0) === 0 ? 'pending' : s?.poolsSynced ? 'ok' : 'warn',
        // Treat "no pools" as a soft pending — operator can finish without pools.
        done: !!s?.poolsSynced,
      },
      {
        key: 'heartbeat',
        label: 'Router checked in',
        detail: s?.heartbeatReceived
          ? `Heartbeat received ${s.lastSeen ? 'at ' + new Date(s.lastSeen).toLocaleTimeString() : 'recently'}`
          : 'Waiting for first /tool fetch to phone home…',
        tone: s?.heartbeatReceived ? 'ok' : 'pending',
        done: !!s?.heartbeatReceived,
      },
    ];
  }
}
