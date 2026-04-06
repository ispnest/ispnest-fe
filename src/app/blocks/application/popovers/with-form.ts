import { afterNextRender, Component, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput } from '@angular/material/input';
import { BuiPopover, BuiPopoverContent, BuiPopoverDescription, BuiPopoverPortal, BuiPopoverTitle, BuiPopoverTrigger } from '@/app/ui/popover';

@Component({
  selector: 'PopoversWithForm',
  imports: [MatButton, BuiPopover, BuiPopoverTrigger, BuiPopoverPortal, BuiPopoverContent, BuiPopoverTitle, BuiPopoverDescription, FormRoot, MatFormField, MatInput, FormField],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiPopover [autoFocus]="undefined" [open]="popoverOpen()" [offset]="8" class="sm:w-72">
        <button matButton buiPopoverTrigger>Open popover</button>
        <ng-template buiPopoverPortal>
          <div buiPopoverContent>
            <h2 buiPopoverTitle>Dimensions</h2>
            <p buiPopoverDescription>Set the dimensions of the layer</p>

            <form [formRoot]="popoverForm" class="mt-3 grid grid-cols-3 items-center gap-x-2 gap-y-3">
              <label for="width" class="font-medium">Width</label>
              <mat-form-field subscriptSizing="dynamic" class="col-span-2">
                <input id="width" matInput [formField]="popoverForm.width" />
              </mat-form-field>

              <label for="max-width" class="font-medium">Max. width</label>
              <mat-form-field subscriptSizing="dynamic" class="col-span-2">
                <input id="max-width" matInput [formField]="popoverForm.maxWidth" />
              </mat-form-field>

              <label for="height" class="font-medium">Height</label>
              <mat-form-field subscriptSizing="dynamic" class="col-span-2">
                <input id="height" matInput [formField]="popoverForm.height" />
              </mat-form-field>

              <label for="max-height" class="font-medium">Max. height</label>
              <mat-form-field subscriptSizing="dynamic" class="col-span-2">
                <input id="max-height" matInput [formField]="popoverForm.maxHeight" />
              </mat-form-field>
            </form>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class PopoversWithForm {
  // Demo state. Remove when using in your project.
  protected readonly popoverOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.popoverOpen.set(true);
    });
  }

  // State
  readonly popoverFormModel = signal({ width: '100%', maxWidth: '300px', height: '25px', maxHeight: 'none' });
  readonly popoverForm = form(this.popoverFormModel);
}
