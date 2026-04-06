import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PlanApiService } from '../../core/api/plan-api.service';
import { PlanDto } from '../../core/models/plan.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Nav -->
      <nav class="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <mat-icon class="text-white text-sm">wifi</mat-icon>
            </div>
            <span class="font-bold text-gray-900 text-lg">ISPNest</span>
          </div>
          <div class="flex items-center gap-3">
            <a routerLink="/portal" mat-button>Customer Portal</a>
            <a routerLink="/login" mat-flat-button color="primary">Admin Login</a>
          </div>
        </div>
      </nav>

      <!-- Hero -->
      <section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">Fast, Reliable Internet</h1>
          <p class="text-xl text-blue-100 mb-8">Connect your home or business with our high-speed fiber and hotspot packages.</p>
          <div class="flex gap-4 justify-center flex-wrap">
            <a routerLink="/register" mat-flat-button class="bg-white text-blue-700 hover:bg-blue-50 py-3 px-6 text-base">
              Get Started
            </a>
            <a routerLink="/portal" mat-stroked-button class="border-white text-white py-3 px-6 text-base">
              Existing Customer
            </a>
          </div>
        </div>
      </section>

      <!-- Plans -->
      <section class="py-16 px-4 bg-gray-50">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-3">Our Plans</h2>
          <p class="text-gray-500 text-center mb-10">Choose the plan that's right for you</p>

          @if (loading()) {
            <div class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }

          <!-- PPPoE Plans -->
          @if (ppoePlans().length > 0) {
            <h3 class="text-xl font-semibold text-gray-700 mb-4">Home & Business Internet</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              @for (plan of ppoePlans(); track plan.id) {
                <mat-card [class]="plan.badge === 'Popular' ? 'ring-2 ring-blue-500' : ''" class="p-6 relative">
                  @if (plan.badge) {
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span class="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">{{ plan.badge }}</span>
                    </div>
                  }
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ plan.name }}</h3>
                  <div class="text-3xl font-extrabold text-blue-600 mb-1">
                    KES {{ plan.price | number:'1.0-0' }}
                  </div>
                  <div class="text-sm text-gray-500 mb-4">per {{ plan.validity }} {{ plan.validityUnit }}</div>
                  @if (plan.description) {
                    <p class="text-sm text-gray-600 mb-4">{{ plan.description }}</p>
                  }
                  <a routerLink="/register" mat-flat-button color="primary" class="w-full">Get Started</a>
                </mat-card>
              }
            </div>
          }

          <!-- Hotspot Plans -->
          @if (hotspotPlans().length > 0) {
            <h3 class="text-xl font-semibold text-gray-700 mb-4">Hotspot / WiFi Vouchers</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              @for (plan of hotspotPlans(); track plan.id) {
                <mat-card class="p-4 text-center">
                  <div class="text-lg font-bold text-gray-900 mb-1">{{ plan.name }}</div>
                  <div class="text-2xl font-extrabold text-blue-600">KES {{ plan.price | number:'1.0-0' }}</div>
                  <div class="text-sm text-gray-500 mb-3">{{ plan.validity }} {{ plan.validityUnit }}</div>
                  <a routerLink="/hotspot" mat-stroked-button color="primary" class="w-full text-sm">Connect Now</a>
                </mat-card>
              }
            </div>
          }
        </div>
      </section>

      <!-- Features -->
      <section class="py-16 px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-10">Why Choose Us?</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
            @for (feat of features; track feat.icon) {
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <mat-icon class="text-blue-600 text-2xl">{{ feat.icon }}</mat-icon>
                </div>
                <h3 class="font-semibold text-lg mb-2">{{ feat.title }}</h3>
                <p class="text-gray-500 text-sm">{{ feat.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <p class="text-sm">&copy; 2026 ISPNest. All rights reserved.</p>
      </footer>
    </div>
  `
})
export class LandingComponent implements OnInit {
  private readonly planApi = inject(PlanApiService);

  readonly loading = signal(true);
  readonly ppoePlans = signal<PlanDto[]>([]);
  readonly hotspotPlans = signal<PlanDto[]>([]);

  readonly features = [
    { icon: 'bolt', title: 'Blazing Fast', desc: 'Up to 1Gbps fiber connectivity for homes and businesses.' },
    { icon: 'support_agent', title: '24/7 Support', desc: 'Our team is always available to help you stay connected.' },
    { icon: 'lock', title: 'Secure Network', desc: 'Enterprise-grade security to protect your connection.' }
  ];

  ngOnInit(): void {
    this.planApi.getPage(0, 100, 'name', 'asc', true).subscribe({
      next: page => {
        this.ppoePlans.set(page.content.filter((p: any) => p.type === 'pppoe'));
        this.hotspotPlans.set(page.content.filter((p: any) => p.type === 'hotspot'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}


