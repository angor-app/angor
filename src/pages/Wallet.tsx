import { useState, useEffect, useCallback } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, ArrowDownToLine, Copy, ExternalLink, Plus, KeyRound, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dock } from '@/components/Dock';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { CreateWalletDialog } from '@/components/wallet/CreateWalletDialog';
import { RecoverWalletDialog } from '@/components/wallet/RecoverWalletDialog';
import { WalletOperations } from '@/services/WalletOperations';
import { AccountInfo } from '@/types/angor.types';
import { toast } from '@/hooks/useToast';
import { useAppContext } from '@/hooks/useAppContext';
import { useAddressesBalance, useAddressUTXOs } from '@/hooks/useIndexer';
import { getAddressUrl } from '@/lib/networkConfig';

const Wallet = () => {
  useSeoMeta({
    title: 'Wallet - Angor',
    description: 'Manage your Bitcoin wallet',
  });

  const { user } = useCurrentUser();
  const { config } = useAppContext();
  const { wallet, hasWallet, isLoading: walletLoading, loadMnemonic } = useWalletStorage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRecoverDialog, setShowRecoverDialog] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  
  // Get all addresses from account info
  const allAddresses = accountInfo?.addresses.map(a => a.address) || [];
  const { data: balanceData, isLoading: isLoadingBalance } = useAddressesBalance(allAddresses);
  const { data: utxos, isLoading: isLoadingUtxos } = useAddressUTXOs(allAddresses);

  const loadWalletAccount = useCallback(async () => {
    setIsLoadingAccount(true);
    try {
      const mnemonic = await loadMnemonic();
      if (mnemonic) {
        const walletOps = new WalletOperations(config.network);
        const account = walletOps.generateAccountInfo(
          { words: mnemonic },
          wallet?.accountIndex || 0
        );
        setAccountInfo(account);
      }
    } catch (error) {
      console.error('Failed to load wallet account:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAccount(false);
    }
  }, [loadMnemonic, config.network, wallet?.accountIndex]);

  useEffect(() => {
    if (hasWallet && !accountInfo) {
      loadWalletAccount();
    }
  }, [hasWallet, accountInfo, loadWalletAccount]);

  // Log UTXOs when they change
  useEffect(() => {
    if (utxos) {
      console.log('=== Wallet UTXOs ===');
      console.log('Total UTXOs:', utxos.length);
      console.log('UTXOs:', utxos);
      console.log('Total value (sats):', utxos.reduce((sum, u) => sum + u.value, 0));
      console.log('Total value (BTC):', utxos.reduce((sum, u) => sum + u.value, 0) / 100000000);
    }
  }, [utxos]);

  const handleWalletCreated = () => {
    loadWalletAccount();
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Address Copied',
      description: 'Address copied to clipboard',
    });
  };

  const currentAddress = accountInfo?.addresses.find(a => !a.change && a.index === accountInfo.receiveIndex)?.address;

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden pb-32">
        <div className="fixed inset-0 z-0 dashboard-background">
          <div className="absolute inset-0 dashboard-overlay" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl max-w-md w-full">
            <CardContent className="p-8 text-center">
              <KeyRound className="w-16 h-16 mx-auto mb-4 text-teal-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
              <p className="text-teal-100/70 mb-6">Please log in with your Nostr account to access your wallet.</p>
              <Button asChild className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white">
                <Link to="/">Go to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Dock />
      </div>
    );
  }

  if (walletLoading || isLoadingAccount) {
    return (
      <div className="min-h-screen relative overflow-hidden pb-32">
        <div className="fixed inset-0 z-0 dashboard-background">
          <div className="absolute inset-0 dashboard-overlay" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto mb-4" />
            <p className="text-teal-100">Loading wallet...</p>
          </div>
        </div>
        <Dock />
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen relative overflow-hidden pb-32">
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
            
            <h1 className="text-4xl font-bold text-white mb-2">Bitcoin Wallet</h1>
            <p className="text-teal-100/70">Create or recover your Bitcoin wallet</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
              <CardContent className="p-8">
                <Plus className="w-12 h-12 text-teal-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Create New Wallet</h2>
                <p className="text-teal-100/70 mb-6">
                  Generate a new Bitcoin wallet with a 12-word recovery phrase.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Wallet
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
              <CardContent className="p-8">
                <KeyRound className="w-12 h-12 text-teal-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Recover Wallet</h2>
                <p className="text-teal-100/70 mb-6">
                  Already have a wallet? Restore it with your recovery phrase.
                </p>
                <Button
                  onClick={() => setShowRecoverDialog(true)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-teal-700/40"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Recover Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <CreateWalletDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onComplete={handleWalletCreated}
          networkType={config.network}
        />

        <RecoverWalletDialog
          isOpen={showRecoverDialog}
          onClose={() => setShowRecoverDialog(false)}
          onComplete={handleWalletCreated}
          networkType={config.network}
        />

        <Dock />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-32">
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
          
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">Bitcoin Wallet</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              config.network === 'mainnet' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                : config.network === 'testnet'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
            }`}>
              {config.network.toUpperCase()}
            </span>
          </div>
          <p className="text-teal-100/70">Manage your Bitcoin funds</p>
        </div>

        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border-teal-700/40 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-teal-100/70 mb-2">Total Balance</p>
                {isLoadingBalance ? (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    <span className="text-2xl text-teal-100/70">Loading balance...</span>
                  </div>
                ) : (
                  <h2 className="text-5xl font-bold text-white mb-6">
                    {balanceData?.totalBalanceBTC?.toFixed(8) || '0.00000000'} {config.network === 'testnet' ? 'tBTC' : 'BTC'}
                  </h2>
                )}
                <p className="text-teal-100/60 text-lg">
                  {balanceData?.totalBalance ? `${balanceData.totalBalance.toLocaleString()} sats` : '0 sats'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button 
                  asChild
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                >
                  <Link to="/wallet/send">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Link>
                </Button>
                <Button 
                  asChild
                  className="bg-white/10 hover:bg-white/20 text-white border border-teal-700/40"
                >
                  <Link to="/wallet/receive">
                    <ArrowDownToLine className="w-4 h-4 mr-2" />
                    Receive
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Your Receiving Address</CardTitle>
            </CardHeader>
            <CardContent>
              {currentAddress ? (
                <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg">
                  <code className="flex-1 text-sm text-white font-mono break-all">
                    {currentAddress}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyAddress(currentAddress)}
                    className="text-teal-300 hover:text-teal-200 hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="text-teal-300 hover:text-teal-200 hover:bg-white/10"
                  >
                    <a 
                      href={getAddressUrl(
                        currentAddress, 
                        config.network,
                        config.explorers?.find(e => e.isDefault)?.url
                      )} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="View in Explorer"
                      aria-label="View address in blockchain explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-teal-100/50 text-center py-4">Loading address...</p>
              )}
            </CardContent>
          </Card>

          {/* UTXOs */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Unspent Transaction Outputs (UTXOs)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUtxos ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                  <span className="text-teal-100/70">Loading UTXOs...</span>
                </div>
              ) : utxos && utxos.length > 0 ? (
                <div className="space-y-2">
                  {utxos.map((utxo, index) => (
                    <div 
                      key={`${utxo.txid}-${utxo.vout}`}
                      className="p-3 bg-white/5 rounded-lg border border-teal-700/20 hover:border-teal-700/40 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-teal-400 font-semibold">#{index + 1}</span>
                            <span className="text-xs text-teal-100/60">
                              {utxo.confirmations > 0 ? `${utxo.confirmations} confirmations` : 'Unconfirmed'}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-white/80 truncate" title={utxo.txid}>
                            {utxo.txid.substring(0, 32)}...:{utxo.vout}
                          </div>
                          {'address' in utxo && (
                            <div className="text-xs text-teal-300 mt-1 truncate" title={utxo.address}>
                              {utxo.address}
                            </div>
                          )}
                          {utxo.height > 0 && (
                            <div className="text-xs text-teal-100/50 mt-1">
                              Block: {utxo.height}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {(utxo.value / 100000000).toFixed(8)}
                          </div>
                          <div className="text-xs text-teal-100/60">
                            {utxo.value.toLocaleString()} sats
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-teal-700/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-teal-100/70">Total UTXOs:</span>
                      <span className="text-lg font-semibold text-white">{utxos.length}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-teal-100/50">
                  No UTXOs found. Send some Bitcoin to your address to get started.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-teal-100/50">
                No transactions yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dock />
    </div>
  );
};

export default Wallet;
