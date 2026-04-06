import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { HotspotApiService } from '../../core/api/hotspot-api.service';
import { PlanDto } from '../../core/models/plan.model';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-hotspot-plans',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, LoadingComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-800 p-4">
      <div class="max-w-md mx-auto">
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-white text-3xl" style="font-size: 2rem; width: 2rem; height: 2rem;">wifi</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-white">WiFi Hotspot</h1>
          <p class="text-blue-200 mt-1">Choose a plan to get started</p>
        </div>

        <app-loading [loading]="loading()" message="Loading plans…" />

        <div class="space-y-3">
          @for (plan of plans(); track plan.id) {
            <div class="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition"
                 (click)="selectPlan(plan)">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-white text-lg">{{ plan.name }}</div>
                  <div class="text-blue-200 text-sm">{{ plan.validity }} {{ plan.validityUnit }}</div>
                  @if (plan.description) {
                    <div class="text-blue-300 text-xs mt-1">{{ plan.description }}</div>
                  }
                </div>
                <div class="text-right">
                  <div class="text-2xl font-extrabold text-white">KES {{ plan.price | number:'1.0-0' }}</div>
                  @if (plan.badge) {
                    <span class="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full">{{ plan.badge }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        @if (!loading() && plans().length === 0) {
          <div class="text-center py-8 text-blue-200">
            <mat-icon class="text-4xl mb-2">wifi_off</mat-icon>
            <p>No hotspot plans available</p>
          </div>
        }
      </div>
    </div>
  `
})
export class HotspotPlansComponent implements OnInit {
  private readonly hotspotApi = inject(HotspotApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly plans = signal<PlanDto[]>([]);

  ngOnInit(): void {
    // Check reconnect first
    const mac = this.route.snapshot.queryParamMap.get('mac');
    if (mac) {
      this.hotspotApi.reconnectCheck(mac).subscribe({
        next: r => {
          if (r.canReconnect && r.username && r.password) {
            sessionStorage.setItem('hs_credentials', JSON.stringify(r));
          }
        }
      });
    }

    this.hotspotApi.getPlans().subscribe({
      next: plans => { this.plans.set(plans); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  selectPlan(plan: PlanDto): void {
    const qp = this.route.snapshot.queryParams;
    this.router.navigate(['/hotspot/purchase'], { queryParams: { planId: plan.id, ...qp } });
  }
}



