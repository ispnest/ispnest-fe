import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { HotspotApiService } from '../../core/api/hotspot-api.service';
import { HotspotStatusResponse } from '../../core/models/hotspot.model';

@Component({
  selector: 'app-hotspot-status',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-800 flex items-center justify-center p-4">
      <div class="w-full max-w-sm text-center">
        @if (!status()?.ready) {
          <mat-spinner diameter="60" class="mx-auto" style="--mdc-circular-progress-active-indicator-color: white;"></mat-spinner>
          <h2 class="text-xl font-bold text-white mt-6">Waiting for Payment</h2>
          <p class="text-blue-200 mt-2">Enter your M-Pesa PIN to complete payment</p>
          <div class="bg-white/10 rounded-xl p-4 mt-6 text-blue-200 text-sm">
            <mat-icon class="text-yellow-400">info</mat-icon>
            Check your phone for the M-Pesa prompt
          </div>
        } @else {
          <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <mat-icon class="text-white" style="font-size: 2.5rem; width: 2.5rem; height: 2.5rem;">check</mat-icon>
          </div>
          <h2 class="text-2xl font-bold text-white mt-6">Payment Successful!</h2>
          <p class="text-blue-200 mt-2">Connecting you to the internet…</p>
          <div class="bg-white/10 rounded-xl p-4 mt-4 text-blue-200 text-sm animate-pulse">
            <mat-icon class="text-green-400">wifi</mat-icon>
            Auto-connecting…
          </div>
        }

        <!-- Hidden MikroTik auto-login form -->
        <form #loginForm id="mikrotik-login" method="post" style="display:none">
          <input type="hidden" name="username" [value]="credentials?.username || ''">
          <input type="hidden" name="password" [value]="credentials?.password || ''">
        </form>
      </div>
    </div>
  `
})
export class HotspotStatusComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly hotspotApi = inject(HotspotApiService);

  @ViewChild('loginForm') loginFormRef?: ElementRef<HTMLFormElement>;

  readonly status = signal<HotspotStatusResponse | null>(null);
  credentials: { username: string; password: string } | null = null;
  private pollSub?: Subscription;

  ngOnInit(): void {
    const paymentId = this.route.snapshot.paramMap.get('paymentId')!;
    const stored = sessionStorage.getItem('hs_credentials');
    if (stored) {
      try { this.credentials = JSON.parse(stored); } catch {}
    }

    this.pollSub = interval(3000).pipe(
      switchMap(() => this.hotspotApi.checkStatus(paymentId)),
      takeWhile(s => !s.ready, true)
    ).subscribe(s => {
      this.status.set(s);
      if (s.ready) {
        // Auto-submit MikroTik login after short delay
        setTimeout(() => {
          const form = this.loginFormRef?.nativeElement;
          const loginUrl = s.loginUrl || this.route.snapshot.queryParams['loginUrl'];
          if (form && loginUrl) {
            form.action = loginUrl;
            form.submit();
          }
        }, 1500);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}

