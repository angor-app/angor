import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Globe, Zap, Bell, Shield, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dock } from '@/components/Dock';
import { useTheme } from '@/hooks/useTheme';

const Settings = () => {
  useSeoMeta({
    title: 'Settings - Angor',
    description: 'Configure your Angor settings',
  });

  const { theme, setTheme } = useTheme();

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
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Network Type</Label>
                  <p className="text-sm text-teal-100/60">Currently: Testnet</p>
                </div>
                <Button variant="outline" className="bg-white/5 border-teal-700/30 text-white">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nostr Relays */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Nostr Relays
              </CardTitle>
              <CardDescription className="text-teal-100/60">
                Manage your Nostr relay connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-white/5 border-teal-700/30 text-white">
                Manage Relays
              </Button>
            </CardContent>
          </Card>

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
