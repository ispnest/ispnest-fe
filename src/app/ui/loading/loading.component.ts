import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinner],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-12">
        <mat-spinner diameter="36" />
        @if (message()) {
          <span class="ml-3 text-neutral-a11 text-sm">{{ message() }}</span>
        }
      </div>
    }
  `,
})
export class LoadingComponent {
  readonly loading = input(false);
  readonly message = input('');
}

