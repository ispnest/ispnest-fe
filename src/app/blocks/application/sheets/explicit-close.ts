import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger } from '@/app/ui/sheet';

@Component({
  selector: 'SheetsExplicitClose',
  imports: [MatButton, MatIconButton, MatIcon, BuiSheet, BuiSheetTrigger, BuiSheetPortal, BuiSheetContent, BuiSheetBody, BuiSheetHeader, BuiSheetClose, BuiSheetTitle, BuiSheetBackdrop],
  template: `
    <div class="flex flex-auto items-center justify-center gap-x-2 p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiSheet disableClose [(open)]="sheetOpen" [autoFocus]="undefined">
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
            <div buiSheetBody>You can only close this sheet by clicking the close button in the header. Clicking outside of the sheet or pressing the escape key will not close it.</div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class SheetsExplicitClose {
  // Demo state. Remove when using in your project.
  protected readonly sheetOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.sheetOpen.set(true);
    });
  }
}
