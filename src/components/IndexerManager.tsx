import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

export function IndexerManager() {
  const { config, updateConfig } = useAppContext();
  const [newIndexerUrl, setNewIndexerUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const addIndexer = () => {
    if (!newIndexerUrl.trim()) return;

    try {
      new URL(newIndexerUrl); // Validate URL
      updateConfig((cfg) => ({
        ...cfg,
        indexers: [
          ...(cfg.indexers || []),
          { 
            url: newIndexerUrl, 
            status: 'unknown' as const,
            isDefault: (cfg.indexers || []).length === 0 
          },
        ],
      }));
      setNewIndexerUrl('');
    } catch {
      alert('Invalid URL');
    }
  };

  const removeIndexer = (url: string) => {
    updateConfig((cfg) => ({
      ...cfg,
      indexers: (cfg.indexers || []).filter((i) => i.url !== url),
    }));
  };

  const setDefault = (url: string) => {
    updateConfig((cfg) => ({
      ...cfg,
      indexers: (cfg.indexers || []).map((i) => ({
        ...i,
        isDefault: i.url === url,
      })),
    }));
  };

  const refreshStatus = useCallback(async (url: string) => {
    try {
      const response = await fetch(`${url}/api/blocks/tip/height`, {
        signal: AbortSignal.timeout(3000),
      });
      const status = response.ok ? 'online' : 'offline';
      
      updateConfig((cfg) => ({
        ...cfg,
        indexers: (cfg.indexers || []).map((i) =>
          i.url === url ? { ...i, status: status as 'online' | 'offline' } : i
        ),
      }));
    } catch {
      updateConfig((cfg) => ({
        ...cfg,
        indexers: (cfg.indexers || []).map((i) =>
          i.url === url ? { ...i, status: 'offline' as const } : i
        ),
      }));
    }
  }, [updateConfig]);

  const checkAllStatuses = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all(
      config.indexers.map((indexer) => refreshStatus(indexer.url))
    );
    setIsRefreshing(false);
  }, [config.indexers, refreshStatus]);

  // Automatic status checking is disabled - only manual refresh
  useEffect(() => {
    // Auto-check disabled to prevent excessive network requests
  }, []);

  return (
    <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5" />
            Indexer
          </CardTitle>
          <CardDescription className="text-teal-100/60">
            Manage blockchain indexer endpoints
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
        {/* Add New Indexer */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter new indexer link"
            value={newIndexerUrl}
            onChange={(e) => setNewIndexerUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addIndexer()}
            className="bg-teal-950/30 border-teal-700/40 text-white placeholder:text-teal-100/40"
          />
          <Button
            onClick={addIndexer}
            size="icon"
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Indexer List */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 text-xs text-teal-100/60 font-semibold mb-2">
            <div>LINK</div>
            <div>STATUS</div>
            <div>DEFAULT</div>
            <div></div>
          </div>
          {config.indexers.map((indexer) => (
            <div
              key={indexer.url}
              className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center p-2 rounded bg-teal-950/20 border border-teal-700/20"
            >
              <a
                href={indexer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-400 hover:text-orange-300 truncate"
                title={indexer.url}
              >
                {indexer.url}
              </a>
              <span
                className={`text-xs font-semibold ${
                  indexer.status === 'online'
                    ? 'text-green-400'
                    : indexer.status === 'offline'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}
              >
                {indexer.status.charAt(0).toUpperCase() + indexer.status.slice(1)}
              </span>
              <button
                onClick={() => setDefault(indexer.url)}
                className={`w-5 h-5 rounded-full border-2 ${
                  indexer.isDefault
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-teal-700/40 hover:border-teal-500'
                }`}
                aria-label="Set as default"
                title="Set as default"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeIndexer(indexer.url)}
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
