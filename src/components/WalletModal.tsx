import { useState, forwardRef } from 'react';
import { Wallet, Plus, Trash2, Zap, Globe, WalletMinimal, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNWC } from '@/hooks/useNWCContext';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/useToast';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { NWCConnection, NWCInfo } from '@/hooks/useNWC';
import type { WebLNProvider } from "@webbtc/webln-types";

interface WalletModalProps {
  children?: React.ReactNode;
  className?: string;
}

// Extracted AddWalletContent to prevent re-renders
const AddWalletContent = forwardRef<HTMLDivElement, {
  alias: string;
  setAlias: (value: string) => void;
  connectionUri: string;
  setConnectionUri: (value: string) => void;
}>(({ alias, setAlias, connectionUri, setConnectionUri }, ref) => (
  <div className="space-y-4 px-4" ref={ref}>
    <div>
      <Label htmlFor="alias" className="text-slate-300 font-medium">Wallet Name (optional)</Label>
      <Input
        id="alias"
        placeholder="My Lightning Wallet"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
      />
    </div>
    <div>
      <Label htmlFor="connection-uri" className="text-slate-300 font-medium">Connection URI</Label>
      <Textarea
        id="connection-uri"
        placeholder="nostr+walletconnect://..."
        value={connectionUri}
        onChange={(e) => setConnectionUri(e.target.value)}
        rows={3}
        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20 font-mono text-xs"
      />
    </div>
  </div>
));
AddWalletContent.displayName = 'AddWalletContent';

// Extracted WalletContent to prevent re-renders
const WalletContent = forwardRef<HTMLDivElement, {
  webln: WebLNProvider | null;
  hasNWC: boolean;
  connections: NWCConnection[];
  connectionInfo: Record<string, NWCInfo>;
  activeConnection: string | null;
  handleSetActive: (cs: string) => void;
  handleRemoveConnection: (cs: string) => void;
  setAddDialogOpen: (open: boolean) => void;
}>(({
  webln,
  hasNWC,
  connections,
  connectionInfo,
  activeConnection,
  handleSetActive,
  handleRemoveConnection,
  setAddDialogOpen
}, ref) => (
  <div 
    className="space-y-6 px-4 pb-4 max-h-[60vh] overflow-y-auto wallet-scroll" 
    ref={ref}
  >
    {/* Current Status */}
    <div className="space-y-4">
      <h3 className="font-semibold text-white text-sm">Current Status</h3>
      <div className="grid gap-3">
        {/* WebLN */}
        <div className="flex items-center justify-between p-4 bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-lg hover:bg-slate-900/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg">
              <Globe className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">WebLN</p>
              <p className="text-xs text-slate-400">Browser extension</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {webln && <CheckCircle className="h-4 w-4 text-green-400" />}
            <Badge 
              variant={webln ? "default" : "secondary"} 
              className={`text-xs backdrop-blur-sm ${
                webln 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-slate-700/50 text-slate-300 border-slate-600/50'
              }`}
            >
              {webln ? "Ready" : "Not Found"}
            </Badge>
          </div>
        </div>
        {/* NWC */}
        <div className="flex items-center justify-between p-4 bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-lg hover:bg-slate-900/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
              <WalletMinimal className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Nostr Wallet Connect</p>
              <p className="text-xs text-slate-400">
                {connections.length > 0
                  ? `${connections.length} wallet${connections.length !== 1 ? 's' : ''} connected`
                  : "Remote wallet connection"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasNWC && <CheckCircle className="h-4 w-4 text-green-400" />}
            <Badge 
              variant={hasNWC ? "default" : "secondary"} 
              className={`text-xs backdrop-blur-sm ${
                hasNWC 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-slate-700/50 text-slate-300 border-slate-600/50'
              }`}
            >
              {hasNWC ? "Ready" : "None"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
    <Separator />
    {/* NWC Management */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white text-sm">Nostr Wallet Connect</h3>
        <Button 
          size="sm" 
          onClick={() => setAddDialogOpen(true)}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      {/* Connected Wallets List */}
      {connections.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/20 backdrop-blur-sm border border-dashed border-slate-700/50 rounded-lg">
          <WalletMinimal className="h-10 w-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400 font-medium">No wallets connected</p>
          <p className="text-xs text-slate-500 mt-1">Add a wallet to start sending zaps</p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((connection) => {
            const info = connectionInfo[connection.connectionString];
            const isActive = activeConnection === connection.connectionString;
            return (
              <div 
                key={connection.connectionString} 
                className={`
                  flex items-center justify-between p-4 rounded-lg backdrop-blur-sm transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/40 shadow-lg shadow-teal-500/10' 
                    : 'bg-slate-900/40 border border-slate-700/50 hover:bg-slate-900/60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-teal-500/30' 
                      : 'bg-slate-800/50'
                  }`}>
                    <WalletMinimal className={`h-4 w-4 ${
                      isActive ? 'text-teal-300' : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {connection.alias || info?.alias || 'Lightning Wallet'}
                    </p>
                    <p className="text-xs text-slate-400">
                      NWC Connection
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isActive && <CheckCircle className="h-4 w-4 text-green-400" />}
                  {!isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetActive(connection.connectionString)}
                      className="h-8 w-8 p-0 hover:bg-teal-500/20 hover:text-teal-300"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveConnection(connection.connectionString)}
                    className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    {/* Help */}
    {!webln && connections.length === 0 && (
      <>
        <Separator className="bg-slate-700/50" />
        <div className="text-center py-6 px-4 bg-slate-900/20 backdrop-blur-sm rounded-lg border border-slate-700/30">
          <Zap className="h-8 w-8 mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-300 font-medium mb-1">
            No Lightning Wallet Connected
          </p>
          <p className="text-xs text-slate-400">
            Install a WebLN extension or connect a NWC wallet to send zaps.
          </p>
        </div>
      </>
    )}
  </div>
));
WalletContent.displayName = 'WalletContent';

export function WalletModal({ children, className }: WalletModalProps) {
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [connectionUri, setConnectionUri] = useState('');
  const [alias, setAlias] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const isMobile = useIsMobile();

  const {
    connections,
    activeConnection,
    connectionInfo,
    addConnection,
    removeConnection,
    setActiveConnection
  } = useNWC();

  const { webln } = useWallet();

  const hasNWC = connections.length > 0 && connections.some(c => c.isConnected);
  const { toast } = useToast();

  const handleAddConnection = async () => {
    if (!connectionUri.trim()) {
      toast({
        title: 'Connection URI required',
        description: 'Please enter a valid NWC connection URI.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const success = await addConnection(connectionUri.trim(), alias.trim() || undefined);
      if (success) {
        setConnectionUri('');
        setAlias('');
        setAddDialogOpen(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemoveConnection = (connectionString: string) => {
    removeConnection(connectionString);
  };

  const handleSetActive = (connectionString: string) => {
    setActiveConnection(connectionString);
    toast({
      title: 'Active wallet changed',
      description: 'The selected wallet is now active for zaps.',
    });
  };

  const walletContentProps = {
    webln,
    hasNWC,
    connections,
    connectionInfo,
    activeConnection,
    handleSetActive,
    handleRemoveConnection,
    setAddDialogOpen,
  };

  const addWalletDialog = (
    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-[#0a1f2e]/95 via-[#0d2838]/95 to-[#0a1f2e]/95 backdrop-blur-2xl border-teal-700/30">
        <DialogHeader>
          <DialogTitle className="text-white">Connect NWC Wallet</DialogTitle>
          <DialogDescription className="text-teal-200/60">
            Enter your connection string from a compatible wallet.
          </DialogDescription>
        </DialogHeader>
        <AddWalletContent
          alias={alias}
          setAlias={setAlias}
          connectionUri={connectionUri}
          setConnectionUri={setConnectionUri}
        />
        <DialogFooter className="px-4">
          <Button
            onClick={handleAddConnection}
            disabled={isConnecting || !connectionUri.trim()}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            {children || (
              <Button variant="outline" size="sm" className={className}>
                <Wallet className="h-4 w-4 mr-2" />
                Wallet Settings
              </Button>
            )}
          </DrawerTrigger>
          <DrawerContent className="h-full bg-gradient-to-br from-[#0a1f2e]/95 via-[#0d2838]/95 to-[#0a1f2e]/95 backdrop-blur-2xl border-teal-700/30">
            <DrawerHeader className="text-center relative border-b border-teal-700/30">
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="absolute right-4 top-4 text-teal-300/70 hover:text-white hover:bg-teal-800/30">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
              <DrawerTitle className="flex items-center justify-center gap-2 pt-2 text-white">
                <Wallet className="h-5 w-5 text-teal-400" />
                Lightning Wallet
              </DrawerTitle>
              <DrawerDescription className="text-teal-200/60">
                Connect your lightning wallet to send zaps instantly.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto bg-[#0a1f2e]/40 wallet-scroll">
              <WalletContent {...walletContentProps} />
            </div>
          </DrawerContent>
        </Drawer>
        {/* Render Add Wallet as a separate Drawer for mobile */}
        <Drawer open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DrawerContent className="bg-gradient-to-br from-[#0a1f2e]/95 via-[#0d2838]/95 to-[#0a1f2e]/95 backdrop-blur-2xl border-teal-700/30">
            <DrawerHeader className="border-b border-slate-700/50">
              <DrawerTitle className="text-white">Connect NWC Wallet</DrawerTitle>
              <DrawerDescription className="text-slate-400">
                Enter your connection string from a compatible wallet.
              </DrawerDescription>
            </DrawerHeader>
            <AddWalletContent
              alias={alias}
              setAlias={setAlias}
              connectionUri={connectionUri}
              setConnectionUri={setConnectionUri}
            />
            <div className="p-4">
              <Button
                onClick={handleAddConnection}
                disabled={isConnecting || !connectionUri.trim()}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm" className={className}>
              <Wallet className="h-4 w-4 mr-2" />
              Wallet Settings
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#0a1f2e]/95 via-[#0d2838]/95 to-[#0a1f2e]/95 backdrop-blur-2xl border-teal-700/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5 text-teal-400" />
              Lightning Wallet
            </DialogTitle>
            <DialogDescription className="text-teal-200/60">
              Connect your lightning wallet to send zaps instantly.
            </DialogDescription>
          </DialogHeader>
          <WalletContent {...walletContentProps} />
        </DialogContent>
      </Dialog>
      {addWalletDialog}
    </>
  );
}