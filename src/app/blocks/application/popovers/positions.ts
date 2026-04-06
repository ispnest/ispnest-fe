import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BuiPopover, BuiPopoverContent, BuiPopoverDescription, BuiPopoverPortal, BuiPopoverTitle, BuiPopoverTrigger } from '@/app/ui/popover';

@Component({
  selector: 'PopoversPositions',
  imports: [MatButton, BuiPopover, BuiPopoverTrigger, BuiPopoverPortal, BuiPopoverContent, BuiPopoverTitle, BuiPopoverDescription],
  template: `
    <div class="flex flex-auto items-center justify-center gap-x-2 p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiPopover position="top" [autoFocus]="undefined" [open]="popoverOpen()">
        <button matButton buiPopoverTrigger>Top</button>
        <ng-template buiPopoverPortal>
          <div buiPopoverContent>
            <h2 buiPopoverTitle>Top positioned popover</h2>
            <p buiPopoverDescription>You can also position to <code>top-start</code> or <code>top-end</code> for more granular control.</p>
          </div>
        </ng-template>
      </div>

      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiPopover position="bottom" [autoFocus]="undefined">
        <button matButton buiPopoverTrigger>Bottom</button>
        <ng-template buiPopoverPortal>
          <div buiPopoverContent>
            <h2 buiPopoverTitle>Bottom positioned popover</h2>
            <p buiPopoverDescription>You can also position to <code>bottom-start</code> or <code>bottom-end</code> for more granular control.</p>
          </div>
        </ng-template>
      </div>

      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiPopover position="start" [autoFocus]="undefined">
        <button matButton buiPopoverTrigger>Start</button>
        <ng-template buiPopoverPortal>
          <div buiPopoverContent>
            <h2 buiPopoverTitle>Start positioned popover</h2>
            <p buiPopoverDescription>You can also position to <code>start-top</code> or <code>start-bottom</code> for more granular control.</p>
          </div>
        </ng-template>
      </div>

      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiPopover position="end" [autoFocus]="undefined">
        <button matButton buiPopoverTrigger>End</button>
        <ng-template buiPopoverPortal>
          <div buiPopoverContent>
            <h2 buiPopoverTitle>End positioned popover</h2>
            <p buiPopoverDescription>You can also position to <code>end-top</code> or <code>end-bottom</code> for more granular control.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class PopoversPositions {
  // Demo state. Remove when using in your project.
  protected readonly popoverOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.popoverOpen.set(true);
    });
  }
}
