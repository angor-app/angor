import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import { getDefaultNetworkConfig } from '@/lib/defaultConfigs';

/**
 * Hook to automatically update network-specific configs when network changes
 */
export function useNetworkSync() {
  const { config, updateConfig } = useAppContext();

  useEffect(() => {
    // When network changes, update explorers, indexers, and relays to network defaults
    // Only if they haven't been customized by the user
    const defaultConfig = getDefaultNetworkConfig(config.network);
    
    updateConfig((cfg) => {
      // Check if user has customized configs
      const hasCustomExplorers = cfg.explorers && cfg.explorers.length > 0;
      const hasCustomIndexers = cfg.indexers && cfg.indexers.length > 0;
      const hasCustomRelays = cfg.nostrRelays && cfg.nostrRelays.length > 0;

      // Only update if empty or using defaults from different network
      return {
        ...cfg,
        explorers: hasCustomExplorers ? cfg.explorers : defaultConfig.explorers,
        indexers: hasCustomIndexers ? cfg.indexers : defaultConfig.indexers,
        nostrRelays: hasCustomRelays ? cfg.nostrRelays : defaultConfig.nostrRelays,
      };
    });
  }, [config.network, updateConfig]); // Only run when network changes
}
