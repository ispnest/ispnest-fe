import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger } from '@/app/ui/dialog';

@Component({
  selector: 'AlertDialogsNested',
  imports: [MatButton, BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiDialog disableClose role="alertdialog" [autoFocus]="undefined" [open]="dialogOpen()" #parentDialog="buiDialog">
        <button matButton buiDialogTrigger class="primary destructive">Delete item</button>
        <ng-template buiDialogPortal>
          <div buiDialogBackdrop></div>
          <div buiDialogContent>
            <div buiDialogHeader>
              <h2 buiDialogTitle>Are you sure you want to delete this user?</h2>
              <p buiDialogDescription>This action cannot be undone. This will permanently delete the user and remove their data from our servers.</p>
            </div>
            <div buiDialogFooter>
              <button matButton buiDialogClose>Cancel</button>
              <button matButton class="primary destructive" (click)="confirmDialog.open()">Delete</button>
            </div>
          </div>
        </ng-template>

        <!-- Nested confirmation dialog -->
        <div buiDialog disableClose role="alertdialog" [autoFocus]="undefined" #confirmDialog="buiDialog">
          <ng-template buiDialogPortal>
            <div buiDialogContent>
              <div buiDialogHeader>
                <p buiDialogDescription>Are you absolutely sure? This will permanently delete the user and all of its data. This action cannot be undone.</p>
              </div>
              <div buiDialogFooter>
                <button matButton buiDialogClose (click)="parentDialog.close()">Cancel</button>
                <button matButton buiDialogClose class="primary destructive" (click)="parentDialog.close()">Yes, delete it!</button>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
})
export class AlertDialogsNested {
  // Demo state. Remove when using in your project.
  protected readonly dialogOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.dialogOpen.set(true);
    });
  }
}
