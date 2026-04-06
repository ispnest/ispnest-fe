import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-no-customers',
  standalone: true,
  imports: [MatIcon],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <mat-icon svgIcon="users" class="mb-4 size-12 text-neutral-a6" />
      <h3 class="text-lg font-semibold">No customers found</h3>
      <p class="mt-1 text-sm text-neutral-a11">{{ message() }}</p>
    </div>
  `,
})
export class NoCustomersComponent {
  readonly message = input('Try adjusting your filters or add a new customer.');
}

