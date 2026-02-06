import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  rawTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = 'papers-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [rawTheme, setRawTheme] = useState<Theme>(() => {
    const stored = getStoredTheme();
    return stored || defaultTheme;
  });

  const [theme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const stored = getStoredTheme() || defaultTheme;
    return stored === 'system' ? getSystemTheme() : stored;
  });

  // Apply theme on mount and changes
  useEffect(() => {
    const resolved = rawTheme === 'system' ? getSystemTheme() : rawTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
    localStorage.setItem(THEME_KEY, rawTheme);
  }, [rawTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (rawTheme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [rawTheme]);

  const setTheme = (newTheme: Theme) => {
    setRawTheme(newTheme);
  };

  const toggleTheme = () => {
    setRawTheme(prev => {
      const resolved = prev === 'system' ? getSystemTheme() : prev;
      return resolved === 'dark' ? 'light' : 'dark';
    });
  };

  // Prevent flash of wrong theme
  useEffect(() => {
    const stored = getStoredTheme();
    const resolved = stored === 'system' ? getSystemTheme() : stored;
    applyTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, rawTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
