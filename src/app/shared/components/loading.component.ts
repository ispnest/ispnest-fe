import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loading) {
      <div class="flex items-center justify-center py-12">
        <mat-spinner diameter="40"></mat-spinner>
        @if (message) {
          <span class="ml-3 text-gray-500">{{ message }}</span>
        }
      </div>
    }
  `
})
export class LoadingComponent {
  @Input() loading = false;
  @Input() message = '';
}

