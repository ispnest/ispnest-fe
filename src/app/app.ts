import { afterNextRender, Component, inject, DOCUMENT } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  host: {
    // Ensure root component fills the entire viewport
    class: 'flex min-h-full w-full flex-auto flex-col',
  },
  template: `<router-outlet />`,
})
export class App {
  constructor() {
    const document = inject(DOCUMENT);

    afterNextRender(() => {
      const splash = document.getElementById('app-loading');
      // Hidden by CSS (SSR path: app-root already had server-rendered children)
      if (!splash || getComputedStyle(splash).display === 'none') return;

      splash.classList.add('dismiss');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    });
  }
}
