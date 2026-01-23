import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ThemeProvider from '../ThemeProvider';

describe('ThemeProvider component', () => {
  it('Verify Light Theme is selected', async () => {
    const { container } = render(<ThemeProvider><div/></ThemeProvider>);
    const div : any | HTMLDivElement = container.firstChild;
    expect(div.className).contains('light');
  });

  it('Verify Dark Theme is selected', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => {
      return {
        matches: query === '(prefers-color-scheme: dark)',
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
    });
    const { container } = render(<ThemeProvider><div/></ThemeProvider>);
    const div : any | HTMLDivElement = container.firstChild;
    expect(div.className).contains('dark');
  });
});
