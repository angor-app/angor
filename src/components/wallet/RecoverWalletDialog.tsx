import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, KeyRound } from 'lucide-react';
import { WalletOperations } from '@/services/WalletOperations';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { toast } from '@/hooks/useToast';

interface RecoverWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  networkType: 'mainnet' | 'testnet' | 'regtest';
}

export function RecoverWalletDialog({ isOpen, onClose, onComplete, networkType }: RecoverWalletDialogProps) {
  const [mnemonic, setMnemonic] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const { saveWallet } = useWalletStorage();
  const walletOps = new WalletOperations(networkType);

  const handleRecover = async () => {
    const trimmedMnemonic = mnemonic.trim().toLowerCase();
    
    // Validate mnemonic
    if (!walletOps.validateMnemonic(trimmedMnemonic)) {
      toast({
        title: 'Invalid Recovery Phrase',
        description: 'Please check your 12-word recovery phrase and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsRecovering(true);

    try {
      // Save encrypted wallet
      const success = await saveWallet(trimmedMnemonic);
      
      if (success) {
        toast({
          title: 'Wallet Recovered!',
          description: 'Your wallet has been successfully recovered.',
        });
        setMnemonic('');
        onComplete();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save wallet. Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Recovery Failed',
        description: 'An error occurred while recovering your wallet.',
        variant: 'destructive',
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90dvh] p-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2833] to-[#1a3d4d] border-[#1a3d4d]/50">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-center text-xl text-teal-100">
            <KeyRound className="w-8 h-8 mx-auto mb-2 text-teal-400" />
            Recover Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-teal-200">
            Enter your 12-word recovery phrase
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-2 pb-6 space-y-4">
          <Card className="bg-amber-900/40 border-amber-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-semibold mb-1">Security Warning</p>
                  <p>Make sure you are in a private place. Never share your recovery phrase with anyone.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <label className="text-sm font-medium text-teal-200">
              Recovery Phrase (12 words)
            </label>
            <Textarea
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your 12-word recovery phrase, separated by spaces..."
              rows={4}
              className="bg-teal-950/50 border-teal-700/50 text-teal-100 placeholder:text-teal-400/50 focus-visible:ring-teal-500"
            />
            <p className="text-xs text-teal-300/70">
              Words should be lowercase and separated by spaces
            </p>
          </div>

          {mnemonic.trim().split(/\s+/).length === 12 && (
            <Card className="bg-teal-900/40 border-teal-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-teal-200">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span className="text-sm">12 words detected</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-teal-600/50 text-teal-200 hover:bg-teal-900/50"
              disabled={isRecovering}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecover}
              disabled={isRecovering || mnemonic.trim().split(/\s+/).length !== 12}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white disabled:opacity-50"
            >
              {isRecovering ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Recover Wallet
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
