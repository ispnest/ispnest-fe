import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger } from '@/app/ui/sheet';

@Component({
  selector: 'SheetsNested',
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
              <h2 buiSheetTitle class="text-lg font-bold">Sheet #1</h2>
              <button matIconButton buiSheetClose>
                <mat-icon svgIcon="x" />
              </button>
            </div>
            <div buiSheetBody class="flex flex-col gap-y-2">
              <!-- Sheet #2 -->
              <div buiSheet [autoFocus]="undefined">
                <button matButton buiSheetTrigger>Open Sheet #2</button>
                <ng-template buiSheetPortal>
                  <div buiSheetContent>
                    <div buiSheetHeader class="flex items-center justify-between gap-x-2">
                      <h2 buiSheetTitle class="text-lg font-bold">Sheet #2</h2>
                      <button matIconButton buiSheetClose>
                        <mat-icon svgIcon="x" />
                      </button>
                    </div>
                  </div>
                </ng-template>
              </div>

              <!-- Sheet #3 -->
              <div buiSheet side="start" [autoFocus]="undefined">
                <button matButton buiSheetTrigger>Open Sheet #3</button>
                <ng-template buiSheetPortal>
                  <div buiSheetBackdrop></div>
                  <div buiSheetContent>
                    <div buiSheetHeader class="flex items-center justify-between gap-x-2">
                      <h2 buiSheetTitle class="text-lg font-bold">Sheet #3 (different position)</h2>
                      <button matIconButton buiSheetClose>
                        <mat-icon svgIcon="x" />
                      </button>
                    </div>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class SheetsNested {
  // Demo state. Remove when using in your project.
  protected readonly sheetOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.sheetOpen.set(true);
    });
  }
}
