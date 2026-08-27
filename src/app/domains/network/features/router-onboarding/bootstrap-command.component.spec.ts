import { TestBed } from '@angular/core/testing';
import { BootstrapCommandComponent } from './bootstrap-command.component';

describe('BootstrapCommandComponent', () => {
  function createComponent() {
    TestBed.configureTestingModule({ imports: [BootstrapCommandComponent] });
    const fixture = TestBed.createComponent(BootstrapCommandComponent);
    fixture.componentRef.setInput('token', 'one-time-token-abc');
    fixture.componentRef.setInput('expiresAt', '2026-01-01T00:00:00Z');
    fixture.detectChanges();
    return fixture;
  }

  it('ends the command with a trailing newline so a terminal paste executes every line', () => {
    const fixture = createComponent();
    const command = fixture.componentInstance.command();

    expect(command.endsWith('ispnest bootstrap import triggered"\n')).toBe(true);
  });

  it('includes the token and base URL in the command', () => {
    const fixture = createComponent();
    const command = fixture.componentInstance.command();

    expect(command).toContain('ispnestToken "one-time-token-abc"');
    expect(command).toContain(':global ispnestBaseUrl');
  });

  it('fetches with as-value so the live progress redraw cannot clobber the rest of the paste', () => {
    const fixture = createComponent();
    const command = fixture.componentInstance.command();

    expect(command).toContain(
      '[/tool fetch url="$ispnestBaseUrl/api/routers/bootstrap-script" dst-path=ispnest-bootstrap.rsc as-value]',
    );
  });

  it('puts a harmless command after /import so a trailing-newline-trimming paste still submits it', () => {
    const fixture = createComponent();
    const command = fixture.componentInstance.command();
    const lines = command.split('\n');
    const importIndex = lines.indexOf('/import ispnest-bootstrap.rsc');

    expect(importIndex).toBeGreaterThanOrEqual(0);
    expect(importIndex).toBeLessThan(lines.length - 2);
  });

  it('copying writes the exact command (including trailing newline) to the clipboard', () => {
    const fixture = createComponent();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });

    fixture.componentInstance.copy();

    expect(writeText).toHaveBeenCalledWith(fixture.componentInstance.command());
    vi.unstubAllGlobals();
  });
});
