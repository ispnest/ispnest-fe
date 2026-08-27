import { Component, input, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

/** Copies `text()` to the clipboard on click, briefly swapping the icon to confirm. */
@Component({
  selector: 'app-copy-button',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `
    <button
      matIconButton
      type="button"
      [matTooltip]="copied() ? 'Copied!' : 'Copy to clipboard'"
      (click)="copy()"
    >
      <mat-icon [svgIcon]="copied() ? 'check' : 'copy'" class="size-4" />
    </button>
  `,
})
export class CopyButtonComponent {
  readonly text = input.required<string>();

  protected readonly copied = signal(false);

  copy(): void {
    navigator.clipboard.writeText(this.text());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
