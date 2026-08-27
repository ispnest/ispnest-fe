import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * A simple click-to-browse file picker with native drag-and-drop enhancement (there is no CDK "OS
 * file drop" primitive — CDK's drag-drop module is for in-page reordering, not receiving files
 * dropped from the OS — so this is just the native HTML5 drag events).
 */
@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  imports: [MatIcon],
  template: `
    <button
      type="button"
      class="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors"
      [class]="
        dragActive()
          ? 'border-primary-a8 bg-primary-a3'
          : 'border-neutral-a6 bg-neutral-a2 hover:border-neutral-a8 hover:bg-neutral-a3'
      "
      (click)="fileInput().nativeElement.click()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <mat-icon svgIcon="upload" class="size-8 text-neutral-a9" />
      <p class="text-sm font-medium">{{ label() }}</p>
      @if (hint()) {
        <p class="text-xs text-neutral-a10">{{ hint() }}</p>
      }
    </button>
    <input #fileInputEl type="file" [accept]="accept()" hidden (change)="onChange($event)" />
  `,
})
export class FileDropzoneComponent {
  readonly accept = input('');
  readonly label = input('Click to upload or drag and drop');
  readonly hint = input('');
  readonly fileSelected = output<File>();

  protected readonly dragActive = signal(false);
  // A template-ref-variable query on a plain DOM element resolves to ElementRef by default
  // (Angular's documented behavior for viewChild without an explicit `read` option) — not the raw
  // native element, despite what a naive `HTMLInputElement` type param might suggest.
  protected readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInputEl');

  onChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.fileSelected.emit(file);
    (event.target as HTMLInputElement).value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.fileSelected.emit(file);
  }
}
