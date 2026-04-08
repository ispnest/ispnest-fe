import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { HotspotApiService } from '@/app/domains/hotspot/data/hotspot-api.service';
import { PlanDto } from '@/app/domains/plans/data/plan.model';
import { LoadingComponent } from '@/app/ui/loading/loading.component';

@Component({
  selector: 'app-hotspot-plans',
  standalone: true,
  imports: [DecimalPipe, MatIcon, LoadingComponent],
  template: `
    <div class="min-h-screen bg-linear-to-br from-indigo-900 to-blue-800 p-4">
      <div class="mx-auto max-w-md">
        <div class="py-8 text-center">
          <div
            class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20"
          >
            <mat-icon svgIcon="wifi" class="size-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white">WiFi Hotspot</h1>
          <p class="mt-1 text-blue-200">Choose a plan to get started</p>
        </div>

        <app-loading [loading]="loading()" message="Loading plans…" />

        <div class="space-y-3">
          @for (plan of plans(); track plan.id) {
            <button
              type="button"
              class="w-full cursor-pointer rounded-xl border border-white/20 bg-white/10 p-4
                           backdrop-blur text-left transition hover:bg-white/20"
              (click)="selectPlan(plan)"
              (keydown.enter)="selectPlan(plan)"
              (keydown.space)="$event.preventDefault(); selectPlan(plan)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-bold text-white">{{ plan.name }}</div>
                  <div class="text-sm text-blue-200">
                    {{ plan.validity }} {{ plan.validityUnit }}
                  </div>
                  @if (plan.description) {
                    <div class="mt-1 text-xs text-blue-300">{{ plan.description }}</div>
                  }
                </div>
                <div class="text-right">
                  <div class="text-2xl font-extrabold text-white">
                    KES {{ plan.price | number: '1.0-0' }}
                  </div>
                  @if (plan.badge) {
                    <span
                      class="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900"
                    >
                      {{ plan.badge }}
                    </span>
                  }
                </div>
              </div>
            </button>
          }
        </div>

        @if (!loading() && plans().length === 0) {
          <div class="py-8 text-center text-blue-200">
            <mat-icon svgIcon="wifi-off" class="mb-2 size-10" />
            <p>No hotspot plans available</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class HotspotPlansComponent implements OnInit {
  private readonly hotspotApi = inject(HotspotApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly plans = signal<PlanDto[]>([]);

  ngOnInit(): void {
    const mac = this.route.snapshot.queryParamMap.get('mac');
    if (mac) {
      this.hotspotApi.reconnectCheck(mac).subscribe({
        next: (r) => {
          if (r.canReconnect && r.username && r.password) {
            sessionStorage.setItem('hs_credentials', JSON.stringify(r));
          }
        },
      });
    }
    this.hotspotApi.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectPlan(plan: PlanDto): void {
    const qp = this.route.snapshot.queryParams;
    this.router.navigate(['/hotspot/purchase'], { queryParams: { planId: plan.id, ...qp } });
  }
}
