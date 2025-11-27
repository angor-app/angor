import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { Wallet, Users, Coins, TrendingUp, Plus } from 'lucide-react';

export function Dashboard() {
  const { user } = useCurrentUser();
  const author = useAuthor(user?.pubkey || '');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = author.data?.metadata?.name || author.data?.metadata?.display_name || 'Guest';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0 dashboard-background">
        <div className="absolute inset-0 dashboard-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-12 max-w-7xl mx-auto">
        {/* Header with Logo */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Angor</h1>
              <p className="text-xs text-teal-200/80">Decentralized Bitcoin Funding</p>
            </div>
          </div>
          
          <LoginArea className="max-w-60" />
        </div>

        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            {greeting()}, {userName}.
          </h2>
          <p className="text-teal-100/70 text-lg">
            Welcome to your decentralized funding platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-[#1a3d4d]/40 border-teal-800/30 backdrop-blur-md hover:bg-[#1a3d4d]/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs text-teal-200/70 font-medium">Wallet</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">0.00 BTC</p>
                <p className="text-xs text-teal-200/60">Available Balance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a3d4d]/40 border-teal-800/30 backdrop-blur-md hover:bg-[#1a3d4d]/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs text-teal-200/70 font-medium">Active</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-teal-200/60">Projects Funded</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a3d4d]/40 border-teal-800/30 backdrop-blur-md hover:bg-[#1a3d4d]/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs text-teal-200/70 font-medium">Network</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">Testnet</p>
                <p className="text-xs text-teal-200/60">Connected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-white mb-4 px-2">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              asChild
              variant="ghost"
              className="h-auto flex-col gap-3 p-6 bg-[#1a3d4d]/40 border border-teal-800/30 backdrop-blur-md hover:bg-[#1a3d4d]/60 hover:scale-105 transition-all duration-300"
            >
              <Link to="/create">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Create Project</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="h-auto flex-col gap-3 p-6 bg-[#1a3d4d]/40 border border-teal-800/30 backdrop-blur-md hover:bg-[#1a3d4d]/60 hover:scale-105 transition-all duration-300"
            >
              <Link to="/projects">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Browse Projects</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="h-auto flex-col gap-3 p-6 bg-[#1a3d4d]/40 border border-teal-800/30 backdrop-blur-md hover:bg-[#1a3d4d]/60 hover:scale-105 transition-all duration-300"
            >
              <Link to="/wallet">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-white">My Wallet</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="h-auto flex-col gap-3 p-6 bg-[#1a3d4d]/40 border border-teal-800/30 backdrop-blur-md hover:bg-[#1a3d4d]/60 hover:scale-105 transition-all duration-300"
            >
              <Link to="/investments">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Coins className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-white">My Investments</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-teal-800/30">
          <p className="text-sm text-teal-200/50">
            Powered by Bitcoin & Nostr • {' '}
            <a 
              href="https://soapbox.pub/mkstack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-300/70 hover:text-teal-200 transition-colors"
            >
              Vibed with MKStack
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
