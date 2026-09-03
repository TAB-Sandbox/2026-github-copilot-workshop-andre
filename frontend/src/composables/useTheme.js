import { ref, readonly } from 'vue';

const STORAGE_KEY = 'theme';
const DARK = 'dark';
const LIGHT = 'light';

function apply(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

function save(theme) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}

function load() {
  if (typeof localStorage === 'undefined') return LIGHT;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === DARK || stored === LIGHT ? stored : LIGHT;
}

const currentTheme = ref(LIGHT);

export function useTheme() {
  function init() {
    currentTheme.value = load();
    apply(currentTheme.value);
  }

  function toggle() {
    currentTheme.value = currentTheme.value === DARK ? LIGHT : DARK;
    apply(currentTheme.value);
    save(currentTheme.value);
  }

  return {
    theme: readonly(currentTheme),
    isDark: readonly(currentTheme),
    init,
    toggle,
  };
}
