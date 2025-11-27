// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import { useState } from 'react';
import { User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import LoginDialog from './LoginDialog';
import SignupDialog from './SignupDialog';
import { useLoggedInAccounts } from '@/hooks/useLoggedInAccounts';
import { AccountSwitcher } from './AccountSwitcher';
import { cn } from '@/lib/utils';

export interface LoginAreaProps {
  className?: string;
}

export function LoginArea({ className }: LoginAreaProps) {
  const { currentUser } = useLoggedInAccounts();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  const handleLogin = () => {
    setLoginDialogOpen(false);
    setSignupDialogOpen(false);
  };

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      {currentUser ? (
        <AccountSwitcher onAddAccountClick={() => setLoginDialogOpen(true)} />
      ) : (
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setLoginDialogOpen(true)}
            className='flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500/80 to-cyan-500/80 backdrop-blur-xl border border-teal-400/30 text-white font-semibold transition-all hover:from-teal-400/90 hover:to-cyan-400/90 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/30 animate-scale-in'
          >
            <User className='w-4 h-4' />
            <span className='truncate'>Log in</span>
          </Button>
          <Button
            onClick={() => setSignupDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold transition-all hover:bg-white/20 hover:border-white/30 hover:scale-105 hover:shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </Button>
        </div>
      )}

      <LoginDialog
        isOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        onLogin={handleLogin}
        onSignup={() => setSignupDialogOpen(true)}
      />

      <SignupDialog
        isOpen={signupDialogOpen}
        onClose={() => setSignupDialogOpen(false)}
      />
    </div>
  );
}