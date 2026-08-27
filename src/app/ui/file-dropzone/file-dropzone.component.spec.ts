import { TestBed } from '@angular/core/testing';
import { FileDropzoneComponent } from './file-dropzone.component';

function createComponent() {
  TestBed.configureTestingModule({ imports: [FileDropzoneComponent] });
  const fixture = TestBed.createComponent(FileDropzoneComponent);
  fixture.detectChanges();
  return fixture;
}

describe('FileDropzoneComponent', () => {
  it('clicking the visible button opens the native file picker', () => {
    const fixture = createComponent();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(input, 'click');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('emits fileSelected when a file is chosen via the input', () => {
    const fixture = createComponent();
    const file = new File(['content'], 'wg0.conf', { type: 'text/plain' });
    const emitted: File[] = [];
    fixture.componentInstance.fileSelected.subscribe((f) => emitted.push(f));

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    Object.defineProperty(input, 'files', { value: dataTransfer.files });
    input.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([file]);
  });

  it('emits fileSelected on drop and clears the drag-active state', () => {
    const fixture = createComponent();
    const file = new File(['content'], 'wg0.conf', { type: 'text/plain' });
    const emitted: File[] = [];
    fixture.componentInstance.fileSelected.subscribe((f) => emitted.push(f));

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const dropEvent = new DragEvent('drop', { cancelable: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });

    fixture.componentInstance.onDrop(dropEvent);

    expect(emitted).toEqual([file]);
    expect(fixture.componentInstance['dragActive']()).toBe(false);
  });
});
