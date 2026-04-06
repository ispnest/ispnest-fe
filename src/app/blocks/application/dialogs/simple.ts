import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { BuiDialog, BuiDialogBackdrop, BuiDialogBody, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger } from '@/app/ui/dialog';

@Component({
  selector: 'DialogsSimple',
  imports: [MatButton, BuiDialog, BuiDialogBackdrop, BuiDialogClose, BuiDialogContent, BuiDialogDescription, BuiDialogFooter, BuiDialogHeader, BuiDialogPortal, BuiDialogTitle, BuiDialogTrigger, BuiDialogBody, MatDatepicker, MatDatepickerInput, MatDatepickerToggle, MatFormField, MatInput, MatLabel, MatSuffix],
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
              <h2 buiDialogTitle>Edit Profile</h2>
              <p buiDialogDescription>Make changes to your profile information. Click save when you're done.</p>
            </div>
            <div buiDialogBody class="flex flex-col gap-y-5">
              <mat-form-field subscriptSizing="dynamic">
                <mat-label>Name</mat-label>
                <input matInput value="John Doe" />
              </mat-form-field>

              <div class="flex gap-x-5">
                <mat-form-field class="flex-auto" subscriptSizing="dynamic">
                  <mat-label>Username</mat-label>
                  <input matInput value="johndoe" />
                </mat-form-field>

                <mat-form-field class="flex-auto" subscriptSizing="dynamic">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput [matDatepicker]="datepicker" value="1990-01-01" />
                  <mat-datepicker-toggle matIconSuffix [for]="datepicker" />
                  <mat-datepicker panelClass="theme-indigo" #datepicker="matDatepicker" />
                </mat-form-field>
              </div>

              <mat-form-field subscriptSizing="dynamic">
                <mat-label>Email</mat-label>
                <input matInput value="johndoe@example.com" />
              </mat-form-field>
            </div>
            <div buiDialogFooter>
              <button matButton buiDialogClose>Cancel</button>
              <button matButton buiDialogClose class="primary">Save changes</button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class DialogsSimple {
  // Demo state. Remove when using in your project.
  protected readonly dialogOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.dialogOpen.set(true);
    });
  }
}
