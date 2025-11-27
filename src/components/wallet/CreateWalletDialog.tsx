import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, CheckCircle, Sparkles, Key, AlertTriangle, Shield } from 'lucide-react';
import { WalletOperations } from '@/services/WalletOperations';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { toast } from '@/hooks/useToast';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { scrollbarOptions } from '@/lib/scrollbars';

interface CreateWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  networkType: 'mainnet' | 'testnet' | 'regtest';
}

export function CreateWalletDialog({ isOpen, onClose, onComplete, networkType }: CreateWalletDialogProps) {
  const [step, setStep] = useState<'intro' | 'generate' | 'backup' | 'verify'>('intro');
  const [mnemonic, setMnemonic] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [verifyWords, setVerifyWords] = useState<{ index: number; word: string }[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [_isVerified, setIsVerified] = useState(false);
  
  const { saveWallet } = useWalletStorage();
  const walletOps = new WalletOperations(networkType);

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setMnemonic('');
      setWords([]);
      setHasBackedUp(false);
      setIsVerified(false);
      setVerifyWords([]);
      setSelectedWords([]);
    }
  }, [isOpen]);

  const generateWallet = async () => {
    setIsGenerating(true);
    setStep('generate');

    setTimeout(() => {
      const newMnemonic = walletOps.generateWalletWords();
      setMnemonic(newMnemonic);
      setWords(newMnemonic.split(' '));
      setIsGenerating(false);
      setStep('backup');
    }, 2000);
  };

  const downloadMnemonic = () => {
    const blob = new Blob([mnemonic], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angor-wallet-backup-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setHasBackedUp(true);
    
    toast({
      title: 'Backup Downloaded',
      description: 'Keep this file safe and secure!',
    });
  };

  const startVerification = () => {
    // Select 3 random words to verify
    const indices = Array.from({ length: 12 }, (_, i) => i);
    const randomIndices = indices.sort(() => Math.random() - 0.5).slice(0, 3);
    const wordsToVerify = randomIndices.map(i => ({ index: i, word: words[i] }));
    setVerifyWords(wordsToVerify);
    setSelectedWords([]);
    setStep('verify');
  };

  const handleWordSelect = (word: string) => {
    if (selectedWords.length < verifyWords.length) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const verifyAndComplete = async () => {
    const correct = verifyWords.every((item, i) => item.word === selectedWords[i]);
    
    if (!correct) {
      toast({
        title: 'Verification Failed',
        description: 'The words you selected do not match. Please try again.',
        variant: 'destructive',
      });
      setSelectedWords([]);
      return;
    }

    setIsVerified(true);
    
    // Save encrypted wallet
    const success = await saveWallet(mnemonic);
    
    if (success) {
      toast({
        title: 'Wallet Created!',
        description: 'Your Bitcoin wallet has been created successfully.',
      });
      onComplete();
      onClose();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90dvh] p-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2833] to-[#1a3d4d] border-[#1a3d4d]/50">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-center text-xl text-teal-100">
            {step === 'intro' && 'Create New Wallet'}
            {step === 'generate' && 'Generating Wallet'}
            {step === 'backup' && 'Backup Your Wallet'}
            {step === 'verify' && 'Verify Backup'}
          </DialogTitle>
          <DialogDescription className="text-center text-teal-200">
            {step === 'intro' && 'Create a new Bitcoin wallet with a recovery phrase'}
            {step === 'generate' && 'Creating your secure wallet...'}
            {step === 'backup' && 'Write down these 12 words in order'}
            {step === 'verify' && 'Select the correct words to verify your backup'}
          </DialogDescription>
        </DialogHeader>

        <OverlayScrollbarsComponent options={scrollbarOptions} defer>
          <div className="px-6 pt-2 pb-4 space-y-4 max-h-[calc(90vh-120px)]">
            {/* Intro Step */}
            {step === 'intro' && (
              <div className="space-y-4">
                <Card className="bg-teal-900/40 border-teal-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-8 h-8 text-teal-400" />
                      <h3 className="text-lg font-semibold text-teal-100">Secure & Private</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-teal-200">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" />
                        <span>Your wallet is stored encrypted on your device</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" />
                        <span>12-word recovery phrase for backup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" />
                        <span>Compatible with BIP39 standard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" />
                        <span>Full control of your Bitcoin</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-amber-900/40 border-amber-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                      <h3 className="font-semibold text-amber-100">Important Warning</h3>
                    </div>
                    <p className="text-sm text-amber-200">
                      Your recovery phrase is the <strong>only way</strong> to restore your wallet. 
                      Never share it with anyone. Store it safely offline.
                    </p>
                  </CardContent>
                </Card>

                <Button
                  onClick={generateWallet}
                  className="w-full py-6 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create My Wallet
                </Button>
              </div>
            )}

            {/* Generate Step */}
            {step === 'generate' && isGenerating && (
              <div className="text-center py-12 space-y-4">
                <div className="relative inline-block">
                  <Key className="w-24 h-24 text-teal-400 mx-auto animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <p className="text-lg font-semibold text-teal-100">Generating secure wallet...</p>
                <p className="text-sm text-teal-200">Creating your recovery phrase</p>
              </div>
            )}

            {/* Backup Step */}
            {step === 'backup' && (
              <div className="space-y-4">
                <Card className="bg-amber-900/40 border-amber-500/30 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-200">
                        <strong>Write these words down</strong> in order on paper. 
                        Do not take a screenshot or save digitally.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-teal-950/50 border-teal-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {words.map((word, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-teal-700/30"
                        >
                          <span className="text-teal-400 font-mono text-sm">{index + 1}.</span>
                          <span className="text-white font-medium">{word}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Button
                    onClick={downloadMnemonic}
                    variant="outline"
                    className="w-full border-teal-600/50 text-teal-200 hover:bg-teal-900/50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Backup File
                  </Button>

                  <Button
                    onClick={startVerification}
                    disabled={!hasBackedUp}
                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white disabled:opacity-50"
                  >
                    I've Written It Down - Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Verify Step */}
            {step === 'verify' && (
              <div className="space-y-4">
                <Card className="bg-teal-900/40 border-teal-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-teal-100 mb-4">Select the correct words:</h3>
                    <div className="space-y-3">
                      {verifyWords.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-teal-300 font-mono">Word #{item.index + 1}:</span>
                          <div className="flex-1 p-3 bg-white/5 rounded-lg border border-teal-700/30">
                            <span className="text-white font-medium">
                              {selectedWords[i] || '???'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-teal-950/50 border-teal-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-2">
                      {words.map((word, index) => (
                        <Button
                          key={index}
                          onClick={() => handleWordSelect(word)}
                          disabled={selectedWords.length >= verifyWords.length}
                          variant="outline"
                          className="border-teal-600/30 text-teal-200 hover:bg-teal-900/50 disabled:opacity-30"
                        >
                          {word}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedWords([])}
                    variant="outline"
                    className="flex-1 border-teal-600/50 text-teal-200 hover:bg-teal-900/50"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={verifyAndComplete}
                    disabled={selectedWords.length < verifyWords.length}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify & Complete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </OverlayScrollbarsComponent>
      </DialogContent>
    </Dialog>
  );
}
