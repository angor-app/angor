import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Globe, Bell, Shield, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dock } from '@/components/Dock';
import { useTheme } from '@/hooks/useTheme';
import { useAppContext } from '@/hooks/useAppContext';
import type { BitcoinNetwork } from '@/contexts/AppContext';
import { ExplorerManager } from '@/components/ExplorerManager';
import { IndexerManager } from '@/components/IndexerManager';
import { NostrRelayManager } from '@/components/NostrRelayManager';
import { getDefaultNetworkConfig } from '@/lib/defaultConfigs';

const Settings = () => {
  useSeoMeta({
    title: 'Settings - Angor',
    description: 'Configure your Angor settings',
  });

  const { theme, setTheme } = useTheme();
  const { config, updateConfig } = useAppContext();

  const handleNetworkChange = (newNetwork: BitcoinNetwork) => {
    const networkDefaults = getDefaultNetworkConfig(newNetwork);
    updateConfig((cfg) => ({
      ...cfg,
      network: newNetwork,
      explorers: networkDefaults.explorers,
      indexers: networkDefaults.indexers,
      nostrRelays: networkDefaults.nostrRelays,
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      <div className="fixed inset-0 z-0 dashboard-background">
        <div className="absolute inset-0 dashboard-overlay" />
      </div>

      <div className="relative z-10 px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 mb-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-teal-100/70">Customize your Angor experience</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription className="text-teal-100/60">
                Customize the look and feel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-white">
                  Dark Mode
                </Label>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Network */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Network
              </CardTitle>
              <CardDescription className="text-teal-100/60">
                Configure Bitcoin network settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Network Type</Label>
                <Select 
                  value={config.network} 
                  onValueChange={(value) => handleNetworkChange(value as BitcoinNetwork)}
                >
                  <SelectTrigger className="border-teal-700/40 bg-teal-950/30 text-white">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f2833] border-teal-700/40">
                    <SelectItem value="testnet" className="text-white focus:bg-teal-900/40 focus:text-white">
                      <div className="flex flex-col">
                        <span>Testnet</span>
                        <span className="text-xs text-teal-100/60">For development and testing</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mainnet" className="text-white focus:bg-teal-900/40 focus:text-white">
                      <div className="flex flex-col">
                        <span>Mainnet</span>
                        <span className="text-xs text-teal-100/60">Production network</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="regtest" className="text-white focus:bg-teal-900/40 focus:text-white">
                      <div className="flex flex-col">
                        <span>Regtest</span>
                        <span className="text-xs text-teal-100/60">Local testing</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-teal-100/60">
                  {config.network === 'mainnet' && '⚠️ Using real Bitcoin - be careful with transactions'}
                  {config.network === 'testnet' && '✓ Using test Bitcoin - safe for development'}
                  {config.network === 'regtest' && '✓ Using local network - for testing only'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Explorer Manager */}
          <ExplorerManager />

          {/* Indexer Manager */}
          <IndexerManager />

          {/* Nostr Relay Manager */}
          <NostrRelayManager />

          {/* Notifications */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-teal-100/60">
                Control notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="project-updates" className="text-white">
                  Project Updates
                </Label>
                <Switch id="project-updates" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="stage-releases" className="text-white">
                  Stage Releases
                </Label>
                <Switch id="stage-releases" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-projects" className="text-white">
                  New Projects
                </Label>
                <Switch id="new-projects" />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription className="text-teal-100/60">
                Protect your account and funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full bg-white/5 border-teal-700/30 text-white">
                Backup Wallet
              </Button>
              <Button variant="outline" className="w-full bg-white/5 border-teal-700/30 text-white">
                View Recovery Phrase
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dock />
    </div>
  );
};

export default Settings;
