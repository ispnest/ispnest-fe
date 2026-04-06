import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger } from '@/app/ui/dialog';

@Component({
  selector: 'AlertDialogsSingleActionWithCenteredContent',
  imports: [MatButton, BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiDialog disableClose role="alertdialog" [autoFocus]="undefined" [open]="dialogOpen()" class="max-w-sm">
        <button buiDialogTrigger matButton>Open dialog</button>
        <ng-template buiDialogPortal>
          <div buiDialogBackdrop></div>
          <div buiDialogContent>
            <div buiDialogHeader>
              <h2 buiDialogTitle class="text-center">Payment successful!</h2>
              <p buiDialogDescription class="text-center">Your payment has been processed successfully. You will receive a confirmation email shortly with your receipt and order details.</p>
            </div>
            <div buiDialogFooter>
              <button buiDialogClose matButton class="primary w-full">Go back to Dashboard</button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class AlertDialogsSingleActionWithCenteredContent {
  // Demo state. Remove when using in your project.
  protected readonly dialogOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.dialogOpen.set(true);
    });
  }
}
