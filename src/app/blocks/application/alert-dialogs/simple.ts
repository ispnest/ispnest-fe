import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger } from '@/app/ui/dialog';

@Component({
  selector: 'AlertDialogsSimple',
  imports: [MatButton, BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiDialog disableClose role="alertdialog" [autoFocus]="undefined" [open]="dialogOpen()">
        <button buiDialogTrigger matButton>Open dialog</button>
        <ng-template buiDialogPortal>
          <div buiDialogBackdrop></div>
          <div buiDialogContent>
            <div buiDialogHeader>
              <h2 buiDialogTitle>Are you sure you want to delete this user?</h2>
              <p buiDialogDescription>This action cannot be undone. This will permanently delete the user and remove their data from our servers.</p>
            </div>
            <div buiDialogFooter>
              <button buiDialogClose matButton class="primary destructive">Delete</button>
              <button buiDialogClose matButton>Cancel</button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class AlertDialogsSimple {
  // Demo state. Remove when using in your project.
  protected readonly dialogOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.dialogOpen.set(true);
    });
  }
}
