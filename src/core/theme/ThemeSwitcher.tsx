"use client";

import { useTheme } from './ThemeProvider';
import { themes } from './themes';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      {Object.values(themes).map((t) => (
        <Button
          key={t.name}
          variant={theme === t.name ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme(t.name)}
        >
          {t.displayName}
        </Button>
      ))}
    </div>
  );
}
