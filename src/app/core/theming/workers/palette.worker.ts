/// <reference lib="webworker" />

import { Palettes, Theme } from '../models/theming';
import { generatePalette } from '../utils/generate-palette';

addEventListener('message', ({ data }: MessageEvent<Theme>) => {
  const palettes = generatePalettes(data);
  postMessage(palettes);
});

function generatePalettes(config: Theme): Palettes {
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

