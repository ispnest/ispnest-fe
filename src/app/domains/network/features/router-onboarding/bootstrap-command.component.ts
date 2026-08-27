import { DatePipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

/**
 * The paste-ready MikroTik RouterOS 7 command for a freshly issued onboarding token — shared
 * between the create wizard's "Connect your router" step and the router detail page's Overview tab
 * so both surfaces produce byte-for-byte the same command.
 */
@Component({
  selector: 'app-bootstrap-command',
  standalone: true,
  imports: [DatePipe, MatButton, MatIcon],
  template: `
    <div class="overflow-hidden rounded-lg bg-neutral-1 text-neutral-12">
      <div class="flex items-center justify-between gap-3 border-b border-neutral-a4 px-4 py-2">
        <span class="text-xs font-medium text-neutral-a11">Bootstrap command</span>
        <button matButton class="tiny" type="button" (click)="copy()">
          <mat-icon [svgIcon]="copied() ? 'check' : 'copy'" class="size-4" />
          {{ copied() ? 'Copied!' : 'Copy command' }}
        </button>
      </div>
      <pre class="overflow-x-auto p-4 font-mono text-xs whitespace-pre-wrap break-all">{{
        command()
      }}</pre>
    </div>
    <p class="text-xs text-neutral-a10">Token expires {{ expiresAt() | date: 'short' }}.</p>
  `,
})
export class BootstrapCommandComponent {
  readonly token = input.required<string>();
  readonly expiresAt = input.required<string>();

  protected readonly copied = signal(false);

  readonly command = computed(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    // `as-value` matters, not just style: without it, `/tool fetch` prints a live,
    // carriage-return-redrawn progress block while it runs, and that redraw races with the rest
    // of a pasted multi-line command arriving on the same input stream -- routers have been seen
    // to silently drop everything pasted after the fetch line because of it. `as-value` suppresses
    // that live printout (the result is returned as a value instead), so the paste can't be
    // clobbered. The trailing `:put` is also deliberate: some terminal apps trim a trailing
    // newline when reading pasted clipboard text, which would otherwise swallow the Enter that
    // submits `/import`; putting a harmless command after it means `/import`'s own newline isn't
    // the buffer's last byte, and it gives visible confirmation that the whole paste ran.
    return (
      [
        `:global ispnestToken "${this.token()}"`,
        `:global ispnestBaseUrl "${base}"`,
        `:local ispnestFetch [/tool fetch url="$ispnestBaseUrl/api/routers/bootstrap-script" dst-path=ispnest-bootstrap.rsc as-value]`,
        `/import ispnest-bootstrap.rsc`,
        `:put "ispnest bootstrap import triggered"`,
      ].join('\n') + '\n'
    );
  });

  copy(): void {
    navigator.clipboard.writeText(this.command());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
