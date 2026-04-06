import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetFooter, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger } from '@/app/ui/sheet';

@Component({
  selector: 'SheetsWithHeaderAndFooter',
  imports: [MatButton, MatIconButton, MatIcon, BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger, BuiSheetFooter],
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
            <div buiSheetBody class="flex flex-col gap-y-4">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
            <div buiSheetFooter class="flex items-center justify-end gap-x-3">
              <button matButton buiSheetClose>Close</button>
              <button matButton buiSheetClose class="primary">Save</button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class SheetsWithHeaderAndFooter {
  // Demo state. Remove when using in your project.
  protected readonly sheetOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.sheetOpen.set(true);
    });
  }
}
