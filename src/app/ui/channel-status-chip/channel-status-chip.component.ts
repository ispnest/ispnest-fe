import { Component, input } from '@angular/core';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-channel-status-chip',
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full border border-neutral-a5 py-0.5 pl-2 pr-0.5 text-xs"
    >
      <span class="font-medium text-neutral-a11 lowercase">{{ channel() }}</span>
      <app-status-badge [status]="status()" />
    </span>
  `,
})
export class ChannelStatusChipComponent {
  readonly channel = input.required<string>();
  readonly status = input.required<string>();
}
