import type ApexCharts from 'apexcharts';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Theming } from '@/app/core/theming/theming';
import { formatBytes } from '@/app/core/utils/data-size.utils';
import { resolveChartTheme } from './chart-theme';

/** One chart series: `x` is an epoch-millis timestamp or category label, `y` is bytes. */
export type UsageChartSeries = {
  name: string;
  data: { x: number | string; y: number }[];
};

/**
 * Reusable usage chart wrapping ApexCharts. The library is loaded via dynamic import inside
 * `afterNextRender`, so it never runs during SSR and stays out of the initial bundle. Colors are
 * resolved from the app's runtime theme variables and re-applied when the scheme flips.
 */
@Component({
  selector: 'app-usage-chart',
  template: `<div #host [style.minHeight.px]="height()"></div>`,
})
export class UsageChartComponent {
  readonly series = input.required<UsageChartSeries[]>();
  readonly type = input<'bar' | 'area'>('bar');
  readonly height = input(280);
  readonly xType = input<'datetime' | 'category'>('datetime');
  readonly stacked = input(false);
  readonly yFormatter = input<(value: number) => string>(formatBytes);

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly theming = inject(Theming);

  private chart: ApexCharts | null = null;
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.chart?.destroy();
      this.chart = null;
    });

    afterNextRender(() => {
      void this.initChart();
    });

    // Push data updates into the already-rendered chart; before render, initChart reads the
    // current series itself.
    effect(() => {
      const series = this.series();
      void this.chart?.updateSeries(series);
    });

    // Re-theme in place when the color scheme flips
    effect(() => {
      const isDark = this.theming.isDark();
      if (this.chart) void this.chart.updateOptions(this.themeOptions(isDark));
    });
  }

  private async initChart(): Promise<void> {
    const { default: ApexChartsCtor } = await import('apexcharts');
    if (this.destroyed) return;
    this.chart = new ApexChartsCtor(this.host().nativeElement, this.buildOptions());
    await this.chart.render();
  }

  private buildOptions(): Record<string, unknown> {
    const formatter = this.yFormatter();
    return {
      ...this.themeOptions(this.theming.isDark()),
      chart: {
        type: this.type(),
        height: this.height(),
        stacked: this.stacked(),
        toolbar: { show: false },
        animations: { enabled: false },
        fontFamily: 'inherit',
        background: 'transparent',
      },
      series: this.series(),
      dataLabels: { enabled: false },
      stroke: this.type() === 'area' ? { curve: 'smooth', width: 2 } : { width: 0 },
      fill:
        this.type() === 'area'
          ? { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } }
          : {},
      xaxis: {
        type: this.xType(),
        tooltip: { enabled: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { formatter: (value: number) => formatter(value) },
      },
      tooltip: {
        y: { formatter: (value: number) => formatter(value) },
      },
      legend: { position: 'top', horizontalAlign: 'left' },
    };
  }

  private themeOptions(isDark: boolean): Record<string, unknown> {
    const theme = resolveChartTheme(isDark);
    return {
      colors: theme.colors,
      chart: { foreColor: theme.foreColor, background: 'transparent' },
      grid: { borderColor: theme.gridColor },
      theme: { mode: theme.mode },
      tooltip: { theme: theme.mode },
    };
  }
}
