import { ReactNode, useEffect, useMemo, useCallback } from 'react';
import { z } from 'zod';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppContext, type AppConfig, type AppContextType, type Theme, type RelayMetadata } from '@/contexts/AppContext';

interface AppProviderProps {
  children: ReactNode;
  /** Application storage key */
  storageKey: string;
  /** Default app configuration */
  defaultConfig: AppConfig;
}

// Zod schema for RelayMetadata validation
const RelayMetadataSchema = z.object({
  relays: z.array(z.object({
    url: z.string().url(),
    read: z.boolean(),
    write: z.boolean(),
  })),
  updatedAt: z.number(),
}) satisfies z.ZodType<RelayMetadata>;

// Zod schema for AppConfig validation
const AppConfigSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
  network: z.enum(['mainnet', 'testnet']),
  explorers: z.array(z.object({
    url: z.string().url(),
    isDefault: z.boolean(),
  })),
  indexers: z.array(z.object({
    url: z.string().url(),
    status: z.enum(['online', 'offline', 'unknown']),
    isDefault: z.boolean(),
  })),
  nostrRelays: z.array(z.object({
    url: z.string(),
    name: z.string(),
    status: z.enum(['online', 'offline', 'unknown']),
  })),
  relayMetadata: RelayMetadataSchema,
}) satisfies z.ZodType<AppConfig>;

// Track if migration has been done to prevent infinite loops
const migrationKey = 'nostr:app-config-migrated';

export function AppProvider(props: AppProviderProps) {
  const {
    children,
    storageKey,
    defaultConfig,
  } = props;

  // App configuration state with localStorage persistence
  const [rawConfig, setConfig] = useLocalStorage<Partial<AppConfig>>(
    storageKey,
    {},
    {
      serialize: JSON.stringify,
      deserialize: (value: string) => {
        try {
          const parsed = JSON.parse(value);
          const validated = AppConfigSchema.partial().parse(parsed);
          return validated;
        } catch {
          // Check if migration already done in this session
          const alreadyMigrated = sessionStorage.getItem(migrationKey);
          if (alreadyMigrated) {
            return {};
          }
          
          // Mark as migrated
          sessionStorage.setItem(migrationKey, 'true');
          console.warn('Invalid config in localStorage, clearing it.');
          
          // Clear invalid config immediately
          try {
            localStorage.removeItem(storageKey);
          } catch {
            // Ignore errors
          }
          
          return {};
        }
      }
    }
  );

  // Generic config updater with callback pattern - memoized to prevent re-renders
  const updateConfig = useCallback((updater: (currentConfig: Partial<AppConfig>) => Partial<AppConfig>) => {
    setConfig(updater);
  }, [setConfig]);

  // Memoize merged config to prevent unnecessary re-renders
  const config = useMemo(() => ({ ...defaultConfig, ...rawConfig }), [defaultConfig, rawConfig]);

  // Memoize context value to prevent re-renders when config hasn't actually changed
  const appContextValue: AppContextType = useMemo(() => ({
    config,
    updateConfig,
  }), [config, updateConfig]);

  // Apply theme effects to document
  useApplyTheme(config.theme);

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to apply theme changes to the document root
 */
function useApplyTheme(theme: Theme) {
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Handle system theme changes when theme is set to "system"
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
}