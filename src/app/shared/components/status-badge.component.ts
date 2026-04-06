import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass" class="px-2 py-1 rounded-full text-xs font-semibold capitalize">
      {{ status }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status = '';

  get badgeClass(): string {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-600',
      suspended: 'bg-yellow-100 text-yellow-800',
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      void: 'bg-gray-100 text-gray-500',
      outstanding: 'bg-orange-100 text-orange-800',
    };
    return map[this.status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  }
}

