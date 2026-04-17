import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Palettes, Theme } from '../models/theming';
import { generatePalette } from '../utils/generate-palette';

/**
 * Service that generates color palettes, using a Web Worker when available
 * for better performance, with a fallback to main thread computation for
 * browsers without Web Worker support.
 */
@Injectable({ providedIn: 'root' })
export class PaletteGenerator {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private worker: Worker | null = null;
  private workerSupported = false;

  constructor() {
    this.initWorker();
  }

  /**
   * Initialize the Web Worker if supported.
   */
  private initWorker(): void {
    if (!this.isBrowser) {
      return;
    }

    // Check if Web Workers are supported
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers are not supported in this browser. Falling back to main thread.');
      return;
    }

    try {
      // Create the worker
      this.worker = new Worker(new URL('../workers/palette.worker', import.meta.url), {
        type: 'module',
      });
      this.workerSupported = true;
    } catch (error) {
      console.warn('Failed to initialize Web Worker. Falling back to main thread.', error);
      this.workerSupported = false;
    }
  }

  /**
   * Generate palettes from the theme config.
   * Uses Web Worker if available, otherwise falls back to main thread.
   */
  generate(config: Theme): Promise<Palettes> {
    if (this.workerSupported && this.worker) {
      return this.generateWithWorker(config);
    }
    return this.generateOnMainThread(config);
  }

  /**
   * Generate palettes using the Web Worker.
   */
  private generateWithWorker(config: Theme): Promise<Palettes> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const handleMessage = (event: MessageEvent<Palettes>) => {
        this.worker?.removeEventListener('message', handleMessage);
        this.worker?.removeEventListener('error', handleError);
        resolve(event.data);
      };

      const handleError = (error: ErrorEvent) => {
        this.worker?.removeEventListener('message', handleMessage);
        this.worker?.removeEventListener('error', handleError);

        console.warn('Worker error, falling back to main thread:', error);
        // Fallback to main thread on worker error
        this.generateOnMainThread(config).then(resolve).catch(reject);
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.addEventListener('error', handleError);
      this.worker.postMessage(config);
    });
  }

  /**
   * Generate palettes on the main thread (fallback).
   */
  private generateOnMainThread(config: Theme): Promise<Palettes> {
    return Promise.resolve(this.generatePalettesSync(config));
  }

  /**
   * Synchronously generate palettes (used for fallback and SSR).
   */
  generateSync(config: Theme): Palettes {
    return this.generatePalettesSync(config);
  }

  /**
   * Internal synchronous palette generation.
   */
  private generatePalettesSync(config: Theme): Palettes {
    return {
      source: {
        primary: config.primary,
        error: config.error,
        neutral: config.neutral,
      },
      light: generatePalette({
        appearance: 'light',
        primary: config.primary,
        error: config.error,
        neutral: config.neutral,
        background: '#FFFFFF',
      }),
      dark: generatePalette({
        appearance: 'dark',
        primary: config.primary,
        error: config.error,
        neutral: config.neutral,
        background: '#111111',
      }),
    };
  }

  /**
   * Check if Web Worker is being used.
   */
  isUsingWorker(): boolean {
    return this.workerSupported && this.worker !== null;
  }

  /**
   * Terminate the worker when the service is destroyed.
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerSupported = false;
    }
  }
}
