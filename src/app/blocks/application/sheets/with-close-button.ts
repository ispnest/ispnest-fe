import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger } from '@/app/ui/sheet';

@Component({
  selector: 'SheetsWithCloseButton',
  imports: [MatButton, MatIconButton, MatIcon, BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger],
  template: `
    <div class="flex flex-auto items-center justify-center gap-x-2 p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiSheet [(open)]="sheetOpen" [autoFocus]="undefined">
        <button matButton buiSheetTrigger>Open</button>
        <ng-template buiSheetPortal>
          <div buiSheetBackdrop></div>
          <div buiSheetContent>
            <div buiSheetHeader class="flex items-center justify-between gap-x-2">
              <h2 buiSheetTitle class="text-lg font-bold">Sheet</h2>
              <button matIconButton buiSheetClose>
                <mat-icon svgIcon="x" />
              </button>
            </div>
            <div buiSheetBody class="m-4 mt-0 rounded-xl border bg-[linear-gradient(45deg,#00000050_5%,transparent_5%)] bg-size-[16px_16px] bg-position-[8px_8px]"></div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class SheetsWithCloseButton {
  // Demo state. Remove when using in your project.
  protected readonly sheetOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.sheetOpen.set(true);
    });
  }
}
