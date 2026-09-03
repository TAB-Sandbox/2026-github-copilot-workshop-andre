import { describe, test, expect, beforeEach } from 'vitest';
import { useTheme } from '../useTheme.js';

const STORAGE_KEY = 'theme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  test('initializes in light mode by default', () => {
    const { theme, init } = useTheme();
    init();
    expect(theme.value).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('initializes from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { theme, init } = useTheme();
    init();
    expect(theme.value).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('toggle switches between light and dark mode', () => {
    const { theme, init, toggle } = useTheme();
    init();
    expect(theme.value).toBe('light');

    toggle();
    expect(theme.value).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    toggle();
    expect(theme.value).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
