import { DestroyRef, EnvironmentInjector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Media } from './media';

describe('Media', () => {
  let media: Media;
  let addEventListener: Mock;
  let removeEventListener: Mock;
  const destroyCallbacks: (() => void)[] = [];

  beforeEach(() => {
    addEventListener = vi.fn();
    removeEventListener = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(),
    });

    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener,
          removeEventListener,
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    // Store the destroy callbacks so we can call them later
    vi.spyOn(TestBed.inject(EnvironmentInjector).get(DestroyRef), 'onDestroy').mockImplementation(
      (callback) => {
        destroyCallbacks.push(callback);
        return () => void 0;
      },
    );

    media = TestBed.inject(Media);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(media).toBeTruthy();
  });

  it('should return the existing query observer if already created', () => {
    media.match('(prefers-color-scheme: dark)');
    media.match('(prefers-color-scheme: dark)');

    expect(matchMedia).toHaveBeenCalledTimes(1);
  });

  it('should add event listeners in browser', () => {
    media.match('(prefers-color-scheme: dark)');

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update signal value when media query changes', () => {
    const query = '(min-width: 768px)';

    let capturedListener: (event: any) => void = () => void 0;
    addEventListener.mockImplementationOnce((type: string, listener: (events: any) => void) => {
      capturedListener = listener;
      return void 0;
    });
    const mediaSignal = media.match(query);

    capturedListener({ matches: true, media: query });
    expect(mediaSignal()).toBe(true);

    capturedListener({ matches: false, media: query });
    expect(mediaSignal()).toBe(false);
  });

  it('should clean up event listeners on destroy', () => {
    media.match('(prefers-color-scheme: dark)');

    destroyCallbacks.forEach((callback) => callback());

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
