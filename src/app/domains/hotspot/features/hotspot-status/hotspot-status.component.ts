import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoadingComponent } from '@/app/ui/loading';
import { HotspotApiService } from '@/app/domains/hotspot/data';
import { HotspotStatusResponse } from '../../data/hotspot.model';

@Component({
  selector: 'app-hotspot-status',
  standalone: true,
  imports: [RouterLink, MatCard, MatButton, MatIcon, LoadingComponent],
  template: `
    <div class="min-h-screen bg-linear-to-br from-indigo-900 to-blue-800 flex items-center justify-center p-4">
      <div class="w-full max-w-sm text-center">
        <app-loading [loading]="loading()" message="Checking payment status…" />

        @if (!loading() && statusResp()) {
          @if (statusResp()!.ready) {
            <mat-card class="p-8">
              <mat-icon svgIcon="check-circle" class="mb-4 size-16 text-green-500" />
              <h2 class="text-2xl font-bold text-green-700">Connected!</h2>
              <p class="mt-2 text-neutral-a11">Your credentials are ready.</p>
              <div class="mt-4 rounded-lg bg-neutral-a3 p-4 text-left font-mono text-sm space-y-1">
                <div><span class="text-neutral-a11">Username: </span>{{ statusResp()!.username }}</div>
                <div><span class="text-neutral-a11">Password: </span>{{ statusResp()!.password }}</div>
              </div>
              @if (statusResp()!.loginUrl) {
                <a class="primary mt-4 w-full" matButton [href]="statusResp()!.loginUrl">
                  <mat-icon svgIcon="log-in" />
                  Login to Network
                </a>
              }
            </mat-card>
          } @else {
            <mat-card class="p-8">
              <mat-icon svgIcon="clock" class="mb-4 size-16 text-yellow-500" />
              <h2 class="text-xl font-bold">{{ statusResp()!.status }}</h2>
              <p class="mt-2 text-neutral-a11">Please wait while we process your payment…</p>
              <button class="primary mt-4" matButton (click)="reload()">
                <mat-icon svgIcon="refresh-cw" />
                Check Again
              </button>
            </mat-card>
          }
        }
      </div>
    </div>
  `,
})
export class HotspotStatusComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly hotspotApi = inject(HotspotApiService);

  readonly loading = signal(true);
  readonly statusResp = signal<HotspotStatusResponse | null>(null);

  private paymentId = '';
  private pollTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('paymentId') ?? '';
    this.check();
    this.pollTimer = setInterval(() => {
      if (!this.statusResp()?.ready) this.check();
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
  }

  check(): void {
    this.hotspotApi.checkStatus(this.paymentId).subscribe({
      next: resp => {
        this.statusResp.set(resp);
        this.loading.set(false);
        if (resp.ready) clearInterval(this.pollTimer);
      },
      error: () => this.loading.set(false),
    });
  }

  reload(): void {
    this.loading.set(true);
    this.check();
  }
}

