/**
 * Resolves the app's runtime Radix-style theme variables into concrete colors for ApexCharts.
 *
 * The theme variables (`--theme-color-primary-9`, …) hold `light-dark(...)` values which
 * `getComputedStyle` does NOT resolve when reading the custom property directly — substitution
 * only happens at a use site. So each color is resolved through a probe element whose `color`
 * property references the variable.
 */
export type ChartTheme = {
  /** Series colors: [download, upload]. */
  colors: string[];
  /** Axis label / legend text color. */
  foreColor: string;
  /** Grid line color. */
  gridColor: string;
  mode: 'light' | 'dark';
}

export function resolveChartTheme(isDark: boolean): ChartTheme {
  return {
    colors: [
      resolveCssColor('--theme-color-primary-9'),
      resolveCssColor('--theme-color-primary-a6'),
    ],
    foreColor: resolveCssColor('--theme-color-neutral-a11'),
    gridColor: resolveCssColor('--theme-color-neutral-a4'),
    mode: isDark ? 'dark' : 'light',
  };
}

function resolveCssColor(variableName: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${variableName})`;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}
