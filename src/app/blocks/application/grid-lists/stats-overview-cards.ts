import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'GridListStatsOverviewCards',
  imports: [MatCard, MatIcon, MatCardHeader, MatCardContent, DecimalPipe],
  template: `
    <div class="@container">
      <div class="grid gap-4 sm:gap-6 @max-md:grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4">
        @for (item of overview; track item) {
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <mat-icon class="size-4" [svgIcon]="item.icon" />
                <div class="font-medium tracking-tight">
                  {{ item.title }}
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="text-4xl font-semibold tabular-nums">
                {{ item.value | number }}
              </div>
              <div class="mt-2 flex items-center gap-x-1">
                @if (item.change.up) {
                  <mat-icon class="size-4 text-green-11" svgIcon="arrow-up" />
                } @else {
                  <mat-icon class="size-4 text-red-11" svgIcon="arrow-down" />
                }
                <div class="flex items-center gap-x-1 text-sm font-medium text-neutral-a11">
                  <div>{{ item.change.value > 0 ? '+' : '' }}{{ item.change.value | number }}{{ item.change.unit }}</div>
                  <div>{{ item.change.period }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
})
export class GridListStatsOverviewCards {
  protected overview = [
    {
      id: 1,
      title: 'New Customers',
      icon: 'user-plus',
      value: 1404,
      change: {
        value: 12.4,
        unit: '%',
        period: 'since last month',
        up: true,
      },
    },
    {
      id: 2,
      title: 'Total Orders',
      icon: 'truck',
      value: 1200,
      change: {
        value: -8.7,
        unit: '%',
        period: 'since last month',
        up: false,
      },
    },
    {
      id: 3,
      title: 'Total Revenue',
      icon: 'wallet',
      value: 15680.0,
      change: {
        value: 5.6,
        unit: '%',
        period: 'since last month',
        up: true,
      },
    },
    {
      id: 4,
      title: 'Avg. Order Value',
      icon: 'hand-coins',
      value: 122,
      change: {
        value: 3.2,
        unit: '%',
        period: 'since last month',
        up: true,
      },
    },
  ];
}
