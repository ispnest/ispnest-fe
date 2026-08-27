import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  RouterActivityCategory,
  RouterActivityEventDto,
  RouterOnboardingApiService,
} from '@/app/domains/network/data';

const CATEGORY_COLOR: Record<RouterActivityCategory, string> = {
  ONBOARDING: 'text-neutral-12',
  DESIRED_CONFIG: 'text-blue-a11',
  RECONCILIATION: 'text-violet-a11',
  PROVISIONING_PROFILE: 'text-amber-a11',
  POOL: 'text-cyan-a11',
  STATUS: 'text-neutral-a10',
};

/**
 * Live, terminal-styled feed of everything done to or observed about a router — onboarding steps,
 * desired-config writes, reconciliation runs, provisioning-profile edits, pool CRUD, and
 * connectivity status flips, all backed by the same `router_activity_event` audit trail and pushed
 * live over SSE. Shared between the create wizard's live-progress step and the router detail page's
 * Overview tab, so both surfaces render byte-for-byte the same feed — fully self-sufficient (own
 * initial resync GET + own SSE subscribe), so it works unmodified wherever it's dropped in.
 *
 * &lt;p>Newest entry appended at the bottom (classic terminal/console ordering), auto-scrolling unless
 * the viewer has scrolled up to read earlier lines.
 */
@Component({
  selector: 'app-router-activity-terminal',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="flex flex-col overflow-hidden rounded-lg bg-neutral-1 text-neutral-12">
      <div class="flex items-center justify-between gap-3 border-b border-neutral-a4 px-4 py-2">
        <span class="text-xs font-medium text-neutral-a11">Router Activity</span>
        <span class="flex items-center gap-1.5 text-xs text-neutral-a11">
          <span
            class="size-1.5 rounded-full"
            [class.bg-green-a11]="connected()"
            [class.bg-neutral-a8]="!connected()"
          ></span>
          {{ connected() ? 'Live' : 'Connecting…' }}
        </span>
      </div>
      <div
        #logContainer
        class="overflow-y-auto p-3 font-mono text-xs leading-relaxed"
        [style.maxHeight]="maxHeight()"
        (scroll)="onScroll()"
      >
        @if (lines().length === 0) {
          <p class="text-neutral-a10">No activity yet.</p>
        } @else {
          @for (line of lines(); track line.id) {
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-0.5">
              <span class="shrink-0 text-neutral-a10"
                >[{{ line.createdAt | date: 'HH:mm:ss' }}]</span
              >
              <span class="shrink-0 font-semibold" [class]="CATEGORY_COLOR[line.category]">{{
                line.category
              }}</span>
              @if (line.step) {
                <span class="shrink-0 text-neutral-a10">{{ line.step }}</span>
              }
              <span
                class="shrink-0"
                [class.text-green-a11]="line.result === 'OK'"
                [class.text-red-a11]="line.result === 'FAILED'"
                [class.text-neutral-a10]="line.result === 'SKIPPED_ALREADY_SATISFIED'"
              >
                {{ line.result }}
              </span>
              <span class="min-w-0 flex-1 break-words">
                {{ describeLine(line) }}
                @if (line.actor) {
                  <span class="text-neutral-a10">· {{ line.actor }}</span>
                }
              </span>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class RouterActivityTerminalComponent implements OnInit {
  readonly routerId = input.required<string>();
  readonly maxHeight = input<string>('20rem');
  readonly maxLines = input<number>(300);

  /**
   * Emits every line as it's seen (the initial resync's latest, plus every SSE push) so a host that
   * needs "current state" (e.g. the onboarding wizard) doesn't need a second parallel SSE
   * connection.
   */
  readonly activityRecorded = output<RouterActivityEventDto>();

  private readonly api = inject(RouterOnboardingApiService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly CATEGORY_COLOR = CATEGORY_COLOR;

  protected readonly lines = signal<RouterActivityEventDto[]>([]);
  protected readonly connected = signal(false);
  private stickToBottom = true;

  @ViewChild('logContainer') private logContainer?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.lines(); // track
      if (this.stickToBottom) {
        queueMicrotask(() => this.scrollToBottom());
      }
    });
  }

  ngOnInit(): void {
    const routerId = this.routerId();

    this.api.getManagementState(routerId).subscribe((state) => {
      const oldestFirst = [...state.recentEvents].reverse();
      this.lines.set(oldestFirst);
      const last = oldestFirst.at(-1);
      if (last) this.activityRecorded.emit(last);
    });

    this.api
      .streamActivityEvents(routerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.connected.set(true);
        this.lines.update((list) => [...list, event].slice(-this.maxLines()));
        this.activityRecorded.emit(event);
      });
  }

  protected onScroll(): void {
    const el = this.logContainer?.nativeElement;
    if (!el) return;
    this.stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
  }

  protected describeLine(line: RouterActivityEventDto): string {
    return line.fromState ? `${line.fromState} → ${line.toState}` : line.toState;
  }

  private scrollToBottom(): void {
    const el = this.logContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
