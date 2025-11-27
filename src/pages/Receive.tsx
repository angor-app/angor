import { useState, useEffect, useCallback } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, Download, CheckCircle2, QrCode as QrCodeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dock } from '@/components/Dock';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { WalletOperations } from '@/services/WalletOperations';
import { AccountInfo, AddressInfo } from '@/types/angor.types';
import { toast } from '@/hooks/useToast';
import { useAppContext } from '@/hooks/useAppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import QRCode from 'qrcode';

const Receive = () => {
  useSeoMeta({
    title: 'Receive Bitcoin - Angor',
    description: 'Receive Bitcoin to your wallet',
  });

  const { user } = useCurrentUser();
  const { config } = useAppContext();
  const { wallet, hasWallet, loadMnemonic } = useWalletStorage();
  
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [currentReceiveAddress, setCurrentReceiveAddress] = useState<AddressInfo | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');

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
        
        // Get current receive address (first unused receive address)
        const receiveAddresses = account.addresses.filter(a => !a.change);
        if (receiveAddresses.length > 0) {
          setCurrentReceiveAddress(receiveAddresses[0]);
        }
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

  // Generate QR code
  useEffect(() => {
    if (currentReceiveAddress) {
      const generateQRCode = async () => {
        try {
          let qrData = currentReceiveAddress.address;
          
          // Add BIP-21 URI with amount and label if provided
          if (amount || label) {
            qrData = `bitcoin:${currentReceiveAddress.address}`;
            const params = new URLSearchParams();
            if (amount) params.append('amount', amount);
            if (label) params.append('label', label);
            if (params.toString()) {
              qrData += `?${params.toString()}`;
            }
          }
          
          const dataUrl = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
              dark: '#0d9488',
              light: '#0d2838',
            },
          });
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      };
      
      generateQRCode();
    }
  }, [currentReceiveAddress, amount, label]);

  const handleCopyAddress = () => {
    if (currentReceiveAddress) {
      navigator.clipboard.writeText(currentReceiveAddress.address);
      setCopiedAddress(true);
      toast({
        title: 'Address Copied!',
        description: 'Bitcoin address copied to clipboard',
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `bitcoin-address-${currentReceiveAddress?.address.substring(0, 10)}.png`;
      link.href = qrCodeDataUrl;
      link.click();
      toast({
        title: 'QR Code Downloaded',
        description: 'QR code saved to your downloads',
      });
    }
  };

  const getBIP21URI = () => {
    if (!currentReceiveAddress) return '';
    
    let uri = `bitcoin:${currentReceiveAddress.address}`;
    const params = new URLSearchParams();
    if (amount) params.append('amount', amount);
    if (label) params.append('label', label);
    if (params.toString()) {
      uri += `?${params.toString()}`;
    }
    return uri;
  };

  const handleCopyURI = () => {
    const uri = getBIP21URI();
    navigator.clipboard.writeText(uri);
    toast({
      title: 'Payment URI Copied!',
      description: 'BIP-21 payment URI copied to clipboard',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f2e] via-[#0d2838] to-[#0a1f2e] flex items-center justify-center p-4 pb-40">
        <Card className="max-w-md w-full bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
          <CardContent className="pt-6 text-center">
            <p className="text-white mb-4">Please log in to receive Bitcoin</p>
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
            <h1 className="text-3xl font-bold text-white">Receive Bitcoin</h1>
            <p className="text-teal-100/60">Get paid in BTC</p>
          </div>
        </div>

        <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5" />
              Your Receive Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0d2838] border border-teal-700/40">
                <TabsTrigger 
                  value="qr"
                  className="data-[state=active]:bg-teal-900/40 data-[state=active]:text-white text-teal-100"
                >
                  QR Code
                </TabsTrigger>
                <TabsTrigger 
                  value="details"
                  className="data-[state=active]:bg-teal-900/40 data-[state=active]:text-white text-teal-100"
                >
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-6">
                {isLoadingAccount ? (
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-[300px] h-[300px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-[#0d2838] rounded-lg border border-teal-700/40">
                        {qrCodeDataUrl ? (
                          <img 
                            src={qrCodeDataUrl} 
                            alt="Bitcoin Address QR Code" 
                            className="w-[300px] h-[300px]"
                          />
                        ) : (
                          <div className="w-[300px] h-[300px] flex items-center justify-center">
                            <Skeleton className="w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Display */}
                    {currentReceiveAddress && (
                      <div className="space-y-2">
                        <Label className="text-teal-100">Bitcoin Address</Label>
                        <div className="flex gap-2">
                          <Input
                            value={currentReceiveAddress.address}
                            readOnly
                            className="bg-[#0d2838] border-teal-700/40 text-white font-mono text-sm"
                          />
                          <Button
                            onClick={handleCopyAddress}
                            className="bg-teal-900/40 hover:bg-teal-900/60 text-white border border-teal-700/40"
                          >
                            {copiedAddress ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Download QR Button */}
                    <Button
                      onClick={handleDownloadQR}
                      variant="outline"
                      className="w-full border-teal-700/40 text-teal-100 hover:bg-teal-900/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                {isLoadingAccount ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <>
                    {/* Optional Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-teal-100">
                        Amount ({config.network === 'testnet' ? 'tBTC' : 'BTC'}) - Optional
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-[#0d2838] border-teal-700/40 text-white placeholder:text-teal-100/40 focus:border-teal-500"
                      />
                      <p className="text-teal-100/60 text-xs">
                        Adding an amount creates a BIP-21 payment request
                      </p>
                    </div>

                    {/* Optional Label */}
                    <div className="space-y-2">
                      <Label htmlFor="label" className="text-teal-100">
                        Label - Optional
                      </Label>
                      <Input
                        id="label"
                        placeholder="Payment for..."
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="bg-[#0d2838] border-teal-700/40 text-white placeholder:text-teal-100/40 focus:border-teal-500"
                      />
                      <p className="text-teal-100/60 text-xs">
                        Add a description for this payment request
                      </p>
                    </div>

                    {/* BIP-21 URI (if amount or label provided) */}
                    {(amount || label) && (
                      <div className="space-y-2">
                        <Label className="text-teal-100">Payment URI (BIP-21)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={getBIP21URI()}
                            readOnly
                            className="bg-[#0d2838] border-teal-700/40 text-white font-mono text-xs"
                          />
                          <Button
                            onClick={handleCopyURI}
                            className="bg-teal-900/40 hover:bg-teal-900/60 text-white border border-teal-700/40"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-teal-100/60 text-xs">
                          This URI can be used in Bitcoin wallets to auto-fill payment details
                        </p>
                      </div>
                    )}

                    {/* Address Info */}
                    {currentReceiveAddress && (
                      <div className="p-4 rounded-lg bg-[#0d2838]/50 border border-teal-700/20 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-teal-100/60">Address Type:</span>
                          <span className="text-white">
                            {currentReceiveAddress.address.startsWith('bc1') || currentReceiveAddress.address.startsWith('tb1') 
                              ? 'Native SegWit (Bech32)' 
                              : 'Legacy'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-teal-100/60">Derivation Path:</span>
                          <span className="text-white font-mono text-xs">{currentReceiveAddress.path}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-teal-100/60">Network:</span>
                          <span className="text-white capitalize">{config.network}</span>
                        </div>
                      </div>
                    )}

                    {/* Warning */}
                    <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-700/40">
                      <p className="text-yellow-200 text-sm">
                        <strong>Security Note:</strong> Only share this address with trusted parties. 
                        Each address should ideally be used only once for better privacy.
                      </p>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Dock />
    </div>
  );
};

export default Receive;
