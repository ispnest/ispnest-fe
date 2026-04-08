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
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-neutral-a3 text-neutral-a11',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      online: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      offline: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      void: 'bg-neutral-a3 text-neutral-a11',
      outstanding: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return map[this.status()?.toLowerCase()] ?? 'bg-neutral-a3 text-neutral-a11';
  });
}
