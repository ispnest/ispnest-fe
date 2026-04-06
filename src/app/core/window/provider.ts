import {
  DOCUMENT,
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';

export const WINDOW = new InjectionToken<Window>('WINDOW');

export const provideWindow = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: WINDOW,
      useFactory: () => inject(DOCUMENT).defaultView,
    },
  ]);
