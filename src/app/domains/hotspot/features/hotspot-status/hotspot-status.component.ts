import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HotspotApiService } from '@/app/domains/hotspot/data';
import { HotspotStatusResponse } from '../../data/hotspot.model';

@Component({
  selector: 'app-hotspot-status',
  standalone: true,
  imports: [RouterLink, MatIcon],
  template: `
    <div class="min-h-screen bg-slate-1" style="color-scheme: dark">
      <!-- ── Top bar ──────────────────────────────────────────── -->
      <div class="flex items-center gap-3 px-4 pb-5 pt-8">
        <a
          [routerLink]="['/hotspot']"
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-3 text-slate-12 transition hover:bg-slate-4"
        >
          <mat-icon svgIcon="arrow-left" class="size-4" />
        </a>
        <div>
          <h1 class="text-xl font-bold text-slate-12">Payment Status</h1>
          <p class="text-xs text-slate-11">Step 3 of 3 — Getting connected</p>
        </div>
      </div>

      <div class="mx-auto max-w-sm px-4 pb-12">
        <!-- ── POLLING STATE (flat, no card) ─────────────── -->
        @if (!isComplete() && !isFailed()) {
          <div class="py-10 text-center">
            <!-- Pulsing ring -->
            <div class="relative mx-auto mb-6 flex size-16 items-center justify-center">
              <span class="absolute size-16 animate-ping rounded-full bg-blue-a4"></span>
              <span
                class="absolute size-10 animate-ping rounded-full bg-blue-a4 [animation-delay:300ms]"
              ></span>
              <div
                class="relative flex size-10 items-center justify-center rounded-full bg-blue-a3"
              >
                <mat-icon svgIcon="smartphone" class="size-5 text-blue-11" />
              </div>
            </div>

            @if (statusResp()?.planName) {
              <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-10">
                {{ statusResp()!.planName }}
              </p>
            }
            <h2 class="text-xl font-bold text-slate-12">
              {{ statusResp()?.paymentStatus === 'PENDING' ? 'Waiting for M-Pesa' : 'Processing…' }}
            </h2>
            <p class="mt-2 text-sm text-slate-11">
              {{ statusResp()?.message ?? 'Waiting for payment confirmation…' }}
            </p>

            <div class="mt-5 flex justify-center gap-2">
              <span
                class="size-1.5 animate-bounce rounded-full bg-blue-9 [animation-delay:0ms]"
              ></span>
              <span
                class="size-1.5 animate-bounce rounded-full bg-blue-9 [animation-delay:200ms]"
              ></span>
              <span
                class="size-1.5 animate-bounce rounded-full bg-blue-9 [animation-delay:400ms]"
              ></span>
            </div>

            <button
              (click)="reload()"
              class="mx-auto mt-6 flex items-center gap-1.5 rounded-lg bg-blue-9 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-10 active:scale-[0.98]"
            >
              <mat-icon svgIcon="refresh-cw" class="size-3.5" />
              Check now
              @if (pollCount() > 0) {
                <span class="font-normal opacity-70">({{ pollCount() }})</span>
              }
            </button>

            <p class="mt-6 flex items-center justify-center gap-1.5 text-xs text-amber-11">
              <mat-icon svgIcon="info" class="size-3.5 shrink-0" />
              Check your phone — enter your M-Pesa PIN to complete.
            </p>
          </div>
        }

        <!-- ── SUCCESS STATE ──────────────────────────────────────── -->
        @if (isComplete()) {
          <div class="py-10 text-center">
            <div
              class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-a4"
            >
              <mat-icon svgIcon="check-circle" class="size-9 text-green-11" />
            </div>
            <h2 class="text-2xl font-bold text-slate-12">You're Connected!</h2>
            @if (statusResp()?.planName) {
              <p class="mt-1 text-sm font-medium text-green-11">{{ statusResp()!.planName }}</p>
            }
            @if (statusResp()?.message) {
              <p class="mt-2 text-sm text-slate-11">{{ statusResp()!.message }}</p>
            }
            @if (statusResp()?.expiration) {
              <p class="mt-1 text-xs text-slate-10">
                Active until {{ formatExpiry(statusResp()!.expiration) }}
              </p>
            }
            <p class="mt-5 text-sm text-slate-11">
              Your device should now have internet access.<br />
              You can close this page.
            </p>
            <a
              [routerLink]="['/hotspot']"
              class="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-6 bg-slate-3 px-4 py-2 text-sm font-semibold text-slate-12 transition hover:bg-slate-4"
            >
              <mat-icon svgIcon="arrow-left" class="size-4" />
              Back to Plans
            </a>
          </div>
        }

        <!-- ── FAILED STATE ───────────────────────────────────────── -->
        @if (isFailed()) {
          <div class="py-10 text-center">
            <div
              class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-a4"
            >
              <mat-icon svgIcon="x-circle" class="size-8 text-red-11" />
            </div>
            <h2 class="text-xl font-bold text-slate-12">Payment Failed</h2>
            <p class="mt-2 text-sm text-slate-11">
              {{ statusResp()?.message ?? 'Your payment could not be processed.' }}
            </p>
            <a
              [routerLink]="['/hotspot']"
              class="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-6 bg-slate-3 px-4 py-2 text-sm font-semibold text-slate-12 transition hover:bg-slate-4"
            >
              <mat-icon svgIcon="arrow-left" class="size-4" />
              Back to Plans
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class HotspotStatusComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly hotspotApi = inject(HotspotApiService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly statusResp = signal<HotspotStatusResponse | null>(null);
  readonly pollCount = signal(0);
  readonly showPassword = signal(false);

  private paymentId = '';
  private pollTimer?: ReturnType<typeof setInterval>;

  isComplete(): boolean {
    const s = this.statusResp()?.paymentStatus?.toUpperCase();
    return s === 'COMPLETED' || this.statusResp()?.ready === true;
  }

  isFailed(): boolean {
    return this.statusResp()?.paymentStatus?.toUpperCase() === 'FAILED';
  }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('paymentId') ?? '';
    this.check();
    this.pollTimer = setInterval(() => {
      if (!this.isComplete() && !this.isFailed()) this.check();
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
  }

  check(): void {
    this.hotspotApi.checkStatus(this.paymentId).subscribe({
      next: (resp) => {
        this.statusResp.set(resp);
        this.loading.set(false);
        this.pollCount.update((n) => n + 1);
        if (resp.ready || resp.paymentStatus?.toUpperCase() === 'FAILED') {
          clearInterval(this.pollTimer);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  reload(): void {
    this.check();
  }

  copy(text: string | null | undefined, label: string): void {
    if (!text) return;
    this.clipboard.copy(text);
    this.snackBar.open(label, undefined, { duration: 2000 });
  }

  copyBoth(): void {
    const u = this.statusResp()?.username ?? '';
    const p = this.statusResp()?.password ?? '';
    if (u && p) {
      this.clipboard.copy(`${u}:${p}`);
      this.snackBar.open('Credentials copied!', undefined, { duration: 2000 });
    }
  }

  formatExpiry(iso: string | null): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  }
}
