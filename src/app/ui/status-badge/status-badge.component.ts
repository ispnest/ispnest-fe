import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      [class]="badgeClass()"
      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
    >
      {{ status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input('');

  readonly badgeClass = computed(() => {
    const hueMap: Record<string, string> = {
      active: 'green',
      online: 'green',
      completed: 'green',
      paid: 'green',
      cleared: 'green',
      delivered: 'green',
      pending: 'amber',
      suspended: 'amber',
      sent: 'blue',
      inactive: 'neutral',
      void: 'neutral',
      read: 'neutral',
      failed: 'red',
      offline: 'red',
      outstanding: 'orange',
    };
    const hue = hueMap[this.status()?.toLowerCase()] ?? 'neutral';
    return `bg-${hue}-a3 text-${hue}-a11`;
  });
}
