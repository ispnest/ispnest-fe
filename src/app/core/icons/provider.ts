import { HttpClient } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

const LUCIDE_ICON_PATH = 'assets/lucide-icons';

export const provideIcons = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(async () => {
      const domSanitizer = inject(DomSanitizer);
      const matIconRegistry = inject(MatIconRegistry);
      const http = inject(HttpClient);

      try {
        const manifestUrl = `${LUCIDE_ICON_PATH}/manifest.json`;
        const manifest = await firstValueFrom(http.get<string[]>(manifestUrl));

        matIconRegistry.addSvgIconResolver((name) => {
          if (manifest.includes(name)) {
            return domSanitizer.bypassSecurityTrustResourceUrl(`${LUCIDE_ICON_PATH}/${name}.svg`);
          }

          // fallback
          return null;
        });
      } catch (error) {
        console.error('Failed to load icon manifest:', error);
      }
    }),
  ]);
