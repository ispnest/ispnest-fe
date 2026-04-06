import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger } from '@/app/ui/sheet';

@Component({
  selector: 'SheetsSimple',
  imports: [MatButton, BuiSheet, BuiSheetBackdrop, BuiSheetBody, BuiSheetClose, BuiSheetContent, BuiSheetHeader, BuiSheetPortal, BuiSheetTitle, BuiSheetTrigger, MatIcon, MatIconButton],
  template: `
    <div class="flex flex-auto items-center justify-center gap-x-2 p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiSheet side="start" [(open)]="startSheetOpen" [autoFocus]="undefined">
        <button matButton buiSheetTrigger>Start</button>
        <ng-template buiSheetPortal>
          <div buiSheetBackdrop></div>
          <div buiSheetContent>
            <div buiSheetHeader class="flex items-center justify-between gap-x-2">
              <h2 buiSheetTitle class="text-lg font-bold">Start positioned sheet</h2>
              <button matIconButton buiSheetClose>
                <mat-icon svgIcon="x" />
              </button>
            </div>
            <div buiSheetBody class="m-4 mt-0 rounded-xl border bg-[linear-gradient(45deg,#00000050_5%,transparent_5%)] bg-size-[16px_16px] bg-position-[8px_8px]"></div>
          </div>
        </ng-template>
      </div>

      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiSheet side="end" [autoFocus]="undefined">
        <button matButton buiSheetTrigger>End</button>
        <ng-template buiSheetPortal>
          <div buiSheetBackdrop></div>
          <div buiSheetContent>
            <div buiSheetHeader class="flex items-center justify-between gap-x-2">
              <h2 buiSheetTitle class="text-lg font-bold">End positioned sheet</h2>
              <button matIconButton buiSheetClose>
                <mat-icon svgIcon="x" />
              </button>
            </div>
            <div buiSheetBody class="m-4 mt-0 rounded-xl border bg-[linear-gradient(45deg,#00000050_5%,transparent_5%)] bg-size-[16px_16px] bg-position-[8px_8px]"></div>
          </div>
        </ng-template>
      </div>

      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiSheet side="top" [autoFocus]="undefined">
        <button matButton buiSheetTrigger>Top</button>
        <ng-template buiSheetPortal>
          <div buiSheetBackdrop></div>
          <div buiSheetContent>
            <div buiSheetHeader class="flex items-center justify-between gap-x-2">
              <h2 buiSheetTitle class="text-lg font-bold">Top positioned sheet</h2>
              <button matIconButton buiSheetClose>
                <mat-icon svgIcon="x" />
              </button>
            </div>
            <div buiSheetBody class="m-4 mt-0 min-h-32 rounded-xl border bg-[linear-gradient(45deg,#00000050_5%,transparent_5%)] bg-size-[16px_16px] bg-position-[8px_8px] p-4"></div>
          </div>
        </ng-template>
      </div>

      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiSheet side="bottom" [autoFocus]="undefined">
        <button matButton buiSheetTrigger>Bottom</button>
        <ng-template buiSheetPortal>
          <div buiSheetBackdrop></div>
          <div buiSheetContent>
            <div buiSheetHeader class="flex items-center justify-between gap-x-2">
              <h2 buiSheetTitle class="text-lg font-bold">Bottom positioned sheet</h2>
              <button matIconButton buiSheetClose>
                <mat-icon svgIcon="x" />
              </button>
            </div>
            <div buiSheetBody class="m-4 mt-0 min-h-32 rounded-xl border bg-[linear-gradient(45deg,#00000050_5%,transparent_5%)] bg-size-[16px_16px] bg-position-[8px_8px]"></div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class SheetsSimple {
  // Demo state. Remove when using in your project.
  protected readonly startSheetOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.startSheetOpen.set(true);
    });
  }
}
