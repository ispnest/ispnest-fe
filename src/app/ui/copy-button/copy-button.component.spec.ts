import { TestBed } from '@angular/core/testing';
import { CopyButtonComponent } from './copy-button.component';

describe('CopyButtonComponent', () => {
  it('copies text() to the clipboard and flips copied() to true', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    TestBed.configureTestingModule({ imports: [CopyButtonComponent] });
    const fixture = TestBed.createComponent(CopyButtonComponent);
    fixture.componentRef.setInput('text', 'hello world');
    fixture.detectChanges();

    fixture.componentInstance.copy();

    expect(writeText).toHaveBeenCalledWith('hello world');
    expect(fixture.componentInstance['copied']()).toBe(true);
  });
});
