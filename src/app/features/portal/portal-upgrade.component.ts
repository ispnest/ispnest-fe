import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { PlanApiService } from '../../core/api/plan-api.service';
import { PlanDto } from '../../core/models/plan.model';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-portal-upgrade',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, LoadingComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="bg-blue-600 text-white px-4 py-4">
        <div class="max-w-4xl mx-auto flex items-center gap-3">
          <a routerLink="/portal/dashboard" mat-icon-button class="text-white"><mat-icon>arrow_back</mat-icon></a>
          <h1 class="font-bold text-lg">Upgrade Plan</h1>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-6">
        <app-loading [loading]="loading()" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (plan of plans(); track plan.id) {
            <mat-card class="p-5 relative" [class]="plan.badge === 'Popular' ? 'ring-2 ring-blue-500' : ''">
              @if (plan.badge) {
                <div class="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span class="bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">{{ plan.badge }}</span>
                </div>
              }
              <h3 class="font-bold text-lg">{{ plan.name }}</h3>
              <div class="text-2xl font-extrabold text-blue-600 my-2">
                KES {{ plan.price | number:'1.0-0' }}
                <span class="text-sm font-normal text-gray-500">/ {{ plan.validity }} {{ plan.validityUnit }}</span>
              </div>
              @if (plan.description) {
                <p class="text-sm text-gray-500 mb-3">{{ plan.description }}</p>
              }
              <button mat-flat-button color="primary" class="w-full" (click)="selectPlan(plan)">
                Select Plan
              </button>
            </mat-card>
          }
        </div>
        @if (!loading() && plans().length === 0) {
          <div class="text-center py-12 text-gray-400">
            <mat-icon class="text-4xl mb-2">info</mat-icon>
            <p>No plans available at the moment.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class PortalUpgradeComponent implements OnInit {
  private readonly planApi = inject(PlanApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly plans = signal<PlanDto[]>([]);

  ngOnInit(): void {
    const customerId = sessionStorage.getItem('portalCustomerId');
    if (!customerId) { this.router.navigate(['/portal']); return; }

    this.planApi.getPage(0, 100, 'name', 'asc', true).subscribe({
      next: page => { this.plans.set(page.content.filter((p: PlanDto) => p.type === 'pppoe')); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  selectPlan(plan: PlanDto): void {
    this.router.navigate(['/portal/payment'], { queryParams: { planId: plan.id } });
  }
}


