import { isPlatformServer } from '@angular/common';
import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  DOCUMENT,
  PLATFORM_ID,
} from '@angular/core';
import { LocalStorage } from '../local-storage';
import { Media } from '../media';
import { Palette, Palettes, Scheme, Theme } from './models/theming';
import { THEME_CONFIG } from './provider';
import { generatePalette } from './utils/generate-palette';

@Injectable({ providedIn: 'root' })
export class Theming {
  // Dependencies
  private document = inject(DOCUMENT);
  private isServer = isPlatformServer(inject(PLATFORM_ID));
  private localStorage = inject(LocalStorage);
  private media = inject(Media);
  private themeConfig = inject(THEME_CONFIG);

  // State
  private prefersDarkMode = this.media.match('(prefers-color-scheme: dark)');

  theme = signal<Theme>({
    primary: this.themeConfig.primary,
    error: this.themeConfig.error,
    neutral: this.themeConfig.neutral,
  });
  scheme = signal<Scheme>(
    (this.localStorage.getItem('scheme') as Scheme) || this.themeConfig.scheme
  );
  isDark = computed(
    () =>
      this.scheme() === 'dark' ||
      (this.scheme() === 'system' && this.prefersDarkMode())
  );
  palettes = computed(() => this.generatePalettes(this.theme()));

  // DOM
  private rootEl = this.document.documentElement;
  private themeStyleEl = this.document.createElement('style');

  constructor() {
    // Append the themeStyleEl to the DOM if it's not already there
    if (!this.document.head.querySelector('.theme-colors')) {
      this.document.head.appendChild(this.themeStyleEl);
      this.themeStyleEl.classList.add('theme-colors');
    }

    // Update scheme
    effect(() => {
      // Skip the server. Otherwise, the scheme will always be 'system' and
      // the class will always be 'scheme-dark'.
      if (this.isServer) {
        return;
      }

      const scheme = this.scheme();
      const isDark = this.isDark();

      // Add the 'dark' or 'light' class to the HTML element
      this.rootEl.classList.toggle('scheme-dark', isDark);
      this.rootEl.classList.toggle('scheme-light', !isDark);

      // Store the scheme in local storage
      this.localStorage.setItem('scheme', scheme);
    });

    // Apply palettes
    effect(() => {
      this.applyPalettes(this.palettes());
    });
  }

  /**
   * Generate palettes from the theme config.
   */
  private generatePalettes(config: Theme): Palettes {
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
   * Applies generated color palettes to the DOM by injecting CSS variables
   * into the style element.
   */
  private applyPalettes(palettes: Palettes) {
    const variablePrefix = 'theme';
    const style = this.themeStyleEl;

    // Build the style content
    style.textContent = `:root {`;

    // Primary
    const primaryKeys = Object.keys(
      palettes.light.primary
    ) as (keyof Palette['primary'])[];
    for (const name of primaryKeys) {
      const lightColor = palettes.light.primary[name];
      const darkColor = palettes.dark.primary[name];
      style.textContent += `--${variablePrefix}-color-primary-${name}: light-dark(${lightColor}, ${darkColor});`;
    }

    // Error
    const errorKeys = Object.keys(
      palettes.light.error
    ) as (keyof Palette['error'])[];
    for (const name of errorKeys) {
      const lightColor = palettes.light.error[name];
      const darkColor = palettes.dark.error[name];
      style.textContent += `--${variablePrefix}-color-error-${name}: light-dark(${lightColor}, ${darkColor});`;
    }

    // Neutral
    const neutralKeys = Object.keys(
      palettes.light.neutral
    ) as (keyof Palette['neutral'])[];
    for (const name of neutralKeys) {
      const lightColor = palettes.light.neutral[name];
      const darkColor = palettes.dark.neutral[name];
      style.textContent += `--${variablePrefix}-color-neutral-${name}: light-dark(${lightColor}, ${darkColor});`;
    }

    style.textContent += `}`;
  }
}
