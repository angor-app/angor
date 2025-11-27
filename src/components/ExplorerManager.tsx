import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

export function ExplorerManager() {
  const { config, updateConfig } = useAppContext();
  const [newExplorerUrl, setNewExplorerUrl] = useState('');

  const addExplorer = () => {
    if (!newExplorerUrl.trim()) return;

    try {
      new URL(newExplorerUrl); // Validate URL
      updateConfig((cfg) => ({
        ...cfg,
        explorers: [
          ...(cfg.explorers || []),
          { url: newExplorerUrl, isDefault: (cfg.explorers || []).length === 0 },
        ],
      }));
      setNewExplorerUrl('');
    } catch {
      alert('Invalid URL');
    }
  };

  const removeExplorer = (url: string) => {
    updateConfig((cfg) => ({
      ...cfg,
      explorers: (cfg.explorers || []).filter((e) => e.url !== url),
    }));
  };

  const setDefault = (url: string) => {
    updateConfig((cfg) => ({
      ...cfg,
      explorers: (cfg.explorers || []).map((e) => ({
        ...e,
        isDefault: e.url === url,
      })),
    }));
  };

  return (
    <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Explorer
        </CardTitle>
        <CardDescription className="text-teal-100/60">
          Manage blockchain explorer endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Explorer */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter new explorer link"
            value={newExplorerUrl}
            onChange={(e) => setNewExplorerUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExplorer()}
            className="bg-teal-950/30 border-teal-700/40 text-white placeholder:text-teal-100/40"
          />
          <Button
            onClick={addExplorer}
            size="icon"
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Explorer List */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr,auto,auto] gap-2 text-xs text-teal-100/60 font-semibold mb-2">
            <div>LINK</div>
            <div>DEFAULT</div>
            <div></div>
          </div>
          {config.explorers.map((explorer) => (
            <div
              key={explorer.url}
              className="grid grid-cols-[1fr,auto,auto] gap-2 items-center p-2 rounded bg-teal-950/20 border border-teal-700/20"
            >
              <a
                href={explorer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-400 hover:text-orange-300 truncate"
                title={explorer.url}
              >
                {explorer.url}
              </a>
              <button
                onClick={() => setDefault(explorer.url)}
                className={`w-5 h-5 rounded-full border-2 ${
                  explorer.isDefault
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-teal-700/40 hover:border-teal-500'
                }`}
                aria-label="Set as default"
                title="Set as default"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeExplorer(explorer.url)}
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
