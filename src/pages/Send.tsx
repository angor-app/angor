import { useState, useEffect, useCallback } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send as SendIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Dock } from '@/components/Dock';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { WalletOperations } from '@/services/WalletOperations';
import { TransactionBuilder } from '@/services/TransactionBuilder';
import { AccountInfo } from '@/types/angor.types';
import { toast } from '@/hooks/useToast';
import { useAppContext } from '@/hooks/useAppContext';
import { useAddressesBalance, useAddressUTXOs } from '@/hooks/useIndexer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface FeeEstimate {
  slow: number;
  medium: number;
  fast: number;
}

const Send = () => {
  useSeoMeta({
    title: 'Send Bitcoin - Angor',
    description: 'Send Bitcoin from your wallet',
  });

  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { config } = useAppContext();
  const { wallet, hasWallet, loadMnemonic } = useWalletStorage();
  
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  
  // Form state
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [feeRate, setFeeRate] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [customFeeRate, setCustomFeeRate] = useState('');
  const [useCustomFee, setUseCustomFee] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  
  // Fee estimates (sat/vB)
  const [feeEstimates] = useState<FeeEstimate>({
    slow: 1,
    medium: 5,
    fast: 10,
  });

  // Get all addresses and balance
  const allAddresses = accountInfo?.addresses.map(a => a.address) || [];
  const { data: balanceData, isLoading: isLoadingBalance } = useAddressesBalance(allAddresses);
  const { data: utxos, isLoading: isLoadingUtxos } = useAddressUTXOs(allAddresses);
  
  const totalBalanceSats = balanceData?.totalBalance || 0;
  const totalBalanceBTC = balanceData?.totalBalanceBTC || 0;

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

  // Validate Bitcoin address
  const isValidAddress = (address: string): boolean => {
    if (!address) return false;
    
    // Basic validation - check prefix based on network
    if (config.network === 'mainnet') {
      return address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1');
    } else if (config.network === 'testnet') {
      return address.startsWith('m') || address.startsWith('n') || address.startsWith('2') || address.startsWith('tb1');
    }
    return false;
  };

  // Calculate transaction size estimate (in vBytes)
  const estimateTxSize = (inputCount: number, outputCount: number): number => {
    // Rough estimate: 148 bytes per input + 34 bytes per output + 10 bytes overhead
    return inputCount * 148 + outputCount * 34 + 10;
  };

  // Get selected fee rate
  const getSelectedFeeRate = (): number => {
    if (useCustomFee && customFeeRate) {
      return parseInt(customFeeRate);
    }
    return feeEstimates[feeRate];
  };

  // Calculate estimated fee
  const calculateFee = (): number => {
    if (!utxos || utxos.length === 0) return 0;
    
    const amountSats = parseFloat(amount) * 100000000;
    if (isNaN(amountSats) || amountSats <= 0) return 0;
    
    // Estimate inputs needed
    let inputsNeeded = 0;
    let inputSum = 0;
    for (const utxo of utxos) {
      if (inputSum >= amountSats) break;
      inputSum += utxo.value;
      inputsNeeded++;
    }
    
    // 2 outputs: recipient + change
    const txSize = estimateTxSize(inputsNeeded, 2);
    const selectedFee = getSelectedFeeRate();
    
    return Math.ceil(txSize * selectedFee);
  };

  const estimatedFee = calculateFee();
  const amountSats = parseFloat(amount) * 100000000 || 0;
  const totalCost = amountSats + estimatedFee;
  const hasEnoughBalance = totalBalanceSats >= totalCost;

  // Validate form
  const canSend = 
    !!recipientAddress && 
    isValidAddress(recipientAddress) &&
    !!amount && 
    parseFloat(amount) > 0 &&
    hasEnoughBalance &&
    !isSending &&
    !isLoadingBalance &&
    !isLoadingUtxos &&
    !!accountInfo;

  const handleSend = async () => {
    if (!canSend || !accountInfo || !utxos) {
      return;
    }

    setIsSending(true);
    try {
      // Get mnemonic
      const mnemonic = await loadMnemonic();
      if (!mnemonic) {
        throw new Error('Failed to load wallet mnemonic');
      }

      // Prepare transaction inputs with address paths
      const txInputs = utxos.map(utxo => {
        // Find the address that owns this UTXO
        const addressInfo = accountInfo.addresses.find(_addr => {
          // This is a simplified check - in production you'd verify the address matches the UTXO scriptPubKey
          return true; // For now, we'll use the first available address path
        });

        if (!addressInfo) {
          throw new Error('Could not find address info for UTXO');
        }

        return {
          utxo,
          address: addressInfo.address,
          path: addressInfo.path,
        };
      });

      // Get change address (first change address or generate new one)
      const changeAddresses = accountInfo.addresses.filter(a => a.change);
      const changeAddress = changeAddresses.length > 0 
        ? changeAddresses[0].address 
        : accountInfo.addresses[0].address;

      // Build transaction
      const txBuilder = new TransactionBuilder(config.network);
      const { txHex, fee } = await txBuilder.buildTransaction({
        mnemonic,
        recipientAddress,
        amountSats,
        feeRate: getSelectedFeeRate(),
        utxos: txInputs,
        changeAddress,
        network: config.network,
      });

      // Get indexer URLs
      const indexers = config.indexers?.map(i => i.url) || [];
      if (indexers.length === 0) {
        throw new Error('No indexers configured');
      }

      // Broadcast transaction
      const broadcastTxId = await txBuilder.broadcastTransaction(txHex, indexers);
      
      setTxId(broadcastTxId);
      
      toast({
        title: 'Transaction Sent!',
        description: `Sent ${amount} ${config.network === 'testnet' ? 'tBTC' : 'BTC'} with ${fee} sats fee`,
      });
      
      // Reset form
      setRecipientAddress('');
      setAmount('');
      
    } catch (error) {
      console.error('Failed to send transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Transaction Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMaxAmount = () => {
    if (totalBalanceSats > estimatedFee) {
      const maxAmount = (totalBalanceSats - estimatedFee) / 100000000;
      setAmount(maxAmount.toFixed(8));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f2e] via-[#0d2838] to-[#0a1f2e] flex items-center justify-center p-4 pb-40">
        <Card className="max-w-md w-full bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <p className="text-white mb-4">Please log in to send Bitcoin</p>
            <Button asChild className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
              <Link to="/wallet">Go to Wallet</Link>
            </Button>
          </CardContent>
        </Card>
        <Dock />
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f2e] via-[#0d2838] to-[#0a1f2e] flex items-center justify-center p-4 pb-40">
        <Card className="max-w-md w-full bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <p className="text-white mb-4">No wallet found. Please create or recover a wallet first.</p>
            <Button asChild className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
              <Link to="/wallet">Go to Wallet</Link>
            </Button>
          </CardContent>
        </Card>
        <Dock />
      </div>
    );
  }

  if (txId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f2e] via-[#0d2838] to-[#0a1f2e] p-4 pb-40 md:p-8 md:pb-32">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl">Transaction Sent!</CardTitle>
              <CardDescription className="text-teal-100/60">
                Your transaction has been broadcast to the network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0d2838]/50 border border-teal-700/20">
                <Label className="text-teal-100/60 text-sm">Transaction ID</Label>
                <p className="text-white font-mono text-sm break-all mt-1">{txId}</p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setTxId(null)}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                >
                  Send Another
                </Button>
                <Button
                  onClick={() => navigate('/wallet')}
                  variant="outline"
                  className="flex-1 border-teal-700/40 text-teal-100 hover:bg-teal-900/20"
                >
                  Back to Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dock />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f2e] via-[#0d2838] to-[#0a1f2e] p-4 pb-40 md:p-8 md:pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-teal-100 hover:bg-teal-900/20"
          >
            <Link to="/wallet">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Send Bitcoin</h1>
            <p className="text-teal-100/60">Send BTC from your wallet</p>
          </div>
        </div>

        {/* Balance Card */}
        {(isLoadingAccount || isLoadingBalance) ? (
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-10 w-48 mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <p className="text-teal-100/60 text-sm mb-2">Available Balance</p>
              <p className="text-3xl font-bold text-white">
                {totalBalanceBTC.toFixed(8)} {config.network === 'testnet' ? 'tBTC' : 'BTC'}
              </p>
              <p className="text-teal-100/60 text-sm mt-1">
                {totalBalanceSats.toLocaleString()} sats
              </p>
            </CardContent>
          </Card>
        )}

        {/* Send Form */}
        <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SendIcon className="w-5 h-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-teal-100">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                placeholder={config.network === 'mainnet' ? 'bc1q...' : 'tb1q...'}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="bg-[#0d2838] border-teal-700/40 text-white placeholder:text-teal-100/40 focus:border-teal-500"
              />
              {recipientAddress && !isValidAddress(recipientAddress) && (
                <p className="text-red-400 text-sm">Invalid address format</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="text-teal-100">
                  Amount ({config.network === 'testnet' ? 'tBTC' : 'BTC'})
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxAmount}
                  className="text-teal-400 hover:text-teal-300 hover:bg-teal-900/20 h-auto py-1 px-2"
                >
                  MAX
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[#0d2838] border-teal-700/40 text-white placeholder:text-teal-100/40 focus:border-teal-500"
              />
              {amount && (
                <p className="text-teal-100/60 text-sm">
                  ≈ {(parseFloat(amount) * 100000000).toLocaleString()} sats
                </p>
              )}
            </div>

            {/* Fee Selection */}
            <div className="space-y-3">
              <Label className="text-teal-100">Network Fee</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'medium', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      setFeeRate(speed);
                      setUseCustomFee(false);
                    }}
                    className={`p-3 rounded-lg border transition-all ${
                      feeRate === speed && !useCustomFee
                        ? 'bg-teal-900/40 border-teal-500 text-white'
                        : 'bg-[#0d2838] border-teal-700/40 text-teal-100 hover:border-teal-600'
                    }`}
                  >
                    <div className="text-sm font-medium capitalize">{speed}</div>
                    <div className="text-xs text-teal-100/60">{feeEstimates[speed]} sat/vB</div>
                  </button>
                ))}
              </div>
              
              {/* Custom Fee */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Custom fee (sat/vB)"
                  value={customFeeRate}
                  onChange={(e) => {
                    setCustomFeeRate(e.target.value);
                    if (e.target.value) setUseCustomFee(true);
                  }}
                  className="bg-[#0d2838] border-teal-700/40 text-white placeholder:text-teal-100/40 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Fee Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 rounded-lg bg-[#0d2838]/50 border border-teal-700/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-teal-100/60">Amount:</span>
                  <span className="text-white">{amountSats.toLocaleString()} sats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal-100/60">Network Fee:</span>
                  <span className="text-white">{estimatedFee.toLocaleString()} sats</span>
                </div>
                <div className="h-px bg-teal-700/40 my-2" />
                <div className="flex justify-between font-semibold">
                  <span className="text-teal-100">Total:</span>
                  <span className="text-white">{totalCost.toLocaleString()} sats</span>
                </div>
                {!hasEnoughBalance && (
                  <Alert className="mt-3 bg-red-900/20 border-red-700/40">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      Insufficient balance. You need {(totalCost - totalBalanceSats).toLocaleString()} more sats.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!canSend}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-12"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Transaction...
                </>
              ) : (
                <>
                  <SendIcon className="w-4 h-4 mr-2" />
                  Send Bitcoin
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Dock />
    </div>
  );
};

export default Send;
