import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

export function NostrRelayManager() {
  const { config, updateConfig } = useAppContext();
  const [newRelayUrl, setNewRelayUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const addRelay = () => {
    if (!newRelayUrl.trim()) return;

    if (!newRelayUrl.startsWith('wss://') && !newRelayUrl.startsWith('ws://')) {
      alert('Relay URL must start with wss:// or ws://');
      return;
    }

    // Extract relay name from URL
    const url = new URL(newRelayUrl);
    const name = url.hostname;

    updateConfig((cfg) => ({
      ...cfg,
      nostrRelays: [
        ...(cfg.nostrRelays || []),
        { 
          url: newRelayUrl, 
          name,
          status: 'unknown' as const
        },
      ],
    }));
    setNewRelayUrl('');
  };

  const removeRelay = (url: string) => {
    updateConfig((cfg) => ({
      ...cfg,
      nostrRelays: (cfg.nostrRelays || []).filter((r) => r.url !== url),
    }));
  };

  const checkRelayStatus = useCallback(async (url: string) => {
    try {
      const ws = new WebSocket(url);
      
      const timeout = setTimeout(() => {
        ws.close();
        updateConfig((cfg) => ({
          ...cfg,
          nostrRelays: (cfg.nostrRelays || []).map((r) =>
            r.url === url ? { ...r, status: 'offline' as const } : r
          ),
        }));
      }, 3000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        updateConfig((cfg) => ({
          ...cfg,
          nostrRelays: (cfg.nostrRelays || []).map((r) =>
            r.url === url ? { ...r, status: 'online' as const } : r
          ),
        }));
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        updateConfig((cfg) => ({
          ...cfg,
          nostrRelays: (cfg.nostrRelays || []).map((r) =>
            r.url === url ? { ...r, status: 'offline' as const } : r
          ),
        }));
      };
    } catch {
      updateConfig((cfg) => ({
        ...cfg,
        nostrRelays: (cfg.nostrRelays || []).map((r) =>
          r.url === url ? { ...r, status: 'offline' as const } : r
        ),
      }));
    }
  }, [updateConfig]);

  const checkAllStatuses = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all(
      config.nostrRelays.map((relay) => checkRelayStatus(relay.url))
    );
    setIsRefreshing(false);
  }, [config.nostrRelays, checkRelayStatus]);

  // Check all relay statuses on mount - move useEffect after checkAllStatuses definition
  useEffect(() => {
    checkAllStatuses();
  }, [checkAllStatuses]);

  return (
    <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Nostr Relays
          </CardTitle>
          <CardDescription className="text-teal-100/60">
            Manage Nostr relay connections
          </CardDescription>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={checkAllStatuses}
          disabled={isRefreshing}
          className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
          title="Refresh all statuses"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Relay */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter new relay link"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRelay()}
            className="bg-teal-950/30 border-teal-700/40 text-white placeholder:text-teal-100/40"
          />
          <Button
            onClick={addRelay}
            size="icon"
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Relay List */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 text-xs text-teal-100/60 font-semibold mb-2">
            <div>LINK</div>
            <div>NAME</div>
            <div>STATUS</div>
            <div></div>
          </div>
          {config.nostrRelays.map((relay) => (
            <div
              key={relay.url}
              className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center p-2 rounded bg-teal-950/20 border border-teal-700/20"
            >
              <span className="text-sm text-orange-400 truncate" title={relay.url}>
                {relay.url}
              </span>
              <span className="text-xs text-teal-100/70">{relay.name}</span>
              <span
                className={`text-xs font-semibold ${
                  relay.status === 'online'
                    ? 'text-green-400'
                    : relay.status === 'offline'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}
              >
                {relay.status.charAt(0).toUpperCase() + relay.status.slice(1)}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeRelay(relay.url)}
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
