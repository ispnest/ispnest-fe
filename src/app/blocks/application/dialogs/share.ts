import { afterNextRender, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BuiDialog, BuiDialogBackdrop, BuiDialogBody, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger } from '@/app/ui/dialog';

@Component({
  selector: 'DialogsShare',
  imports: [MatButton, BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger, BuiDialogBody, MatFormField, MatInput, MatLabel, MatIcon, FormsModule, MatSlideToggle],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiDialog [autoFocus]="undefined" [open]="dialogOpen()">
        <button matButton buiDialogTrigger>Open dialog</button>
        <ng-template buiDialogPortal>
          <div buiDialogBackdrop></div>
          <div buiDialogContent>
            <div buiDialogHeader class="gap-y-2">
              <h2 buiDialogTitle>Share Project</h2>
              <p buiDialogDescription>Add the users you want to share this project with. They will receive an email with a link to access the project.</p>
            </div>
            <div buiDialogBody class="mb-2 flex flex-col gap-y-4">
              <mat-form-field subscriptSizing="dynamic">
                <mat-label>Link</mat-label>
                <input matInput value="https://example.com/project/aFis92" readonly />
              </mat-form-field>
              <mat-slide-toggle checked>Only people with access can open the link</mat-slide-toggle>
              <mat-slide-toggle>Allow editing</mat-slide-toggle>
              <mat-slide-toggle>Notify people</mat-slide-toggle>
            </div>
            <div buiDialogFooter>
              <button matButton buiDialogClose>
                <mat-icon svgIcon="copy" />
                Copy link
              </button>
              <button matButton buiDialogClose>
                <mat-icon svgIcon="code" />
                Embed
              </button>
              <div class="flex-auto"></div>
              <button matButton buiDialogClose class="primary">
                <mat-icon svgIcon="share" />
                Share
              </button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class DialogsShare {
  // Demo state. Remove when using in your project.
  protected readonly dialogOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.dialogOpen.set(true);
    });
  }
}
