import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BuiPopover, BuiPopoverContent, BuiPopoverDescription, BuiPopoverPortal, BuiPopoverTitle, BuiPopoverTrigger } from '@/app/ui/popover';

@Component({
  selector: 'PopoversSimple',
  imports: [MatButton, BuiPopover, BuiPopoverTrigger, BuiPopoverPortal, BuiPopoverContent, BuiPopoverTitle, BuiPopoverDescription],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiPopover [autoFocus]="undefined" [open]="popoverOpen()">
        <button matButton buiPopoverTrigger>Open popover</button>
        <ng-template buiPopoverPortal>
          <div buiPopoverContent class="flex flex-col gap-y-1">
            <h2 buiPopoverTitle>Popover Title</h2>
            <p buiPopoverDescription>This is the popover content. It can include any elements or components.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class PopoversSimple {
  // Demo state. Remove when using in your project.
  protected readonly popoverOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.popoverOpen.set(true);
    });
  }
}
