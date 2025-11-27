import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { Dock } from '@/components/Dock';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';
import { Skeleton } from '@/components/ui/skeleton';

export function Dashboard() {
  const { user } = useCurrentUser();
  const author = useAuthor(user?.pubkey || '');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: btcData, isLoading: isBtcLoading } = useBitcoinPrice();

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
    <div className="min-h-screen relative overflow-hidden pb-24">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0 dashboard-background">
        <div className="absolute inset-0 dashboard-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-8 max-w-6xl mx-auto">
        {/* Header with Logo and Login */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-600/20 backdrop-blur-xl border border-teal-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Angor</h2>
              <p className="text-teal-300/70 text-sm">Bitcoin Funding Protocol</p>
            </div>
          </div>
          
          <LoginArea className="max-w-60" />
        </div>

        {/* Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">
            {greeting()}, {userName}.
          </h1>
        </div>

        {/* Bitcoin Real-Time Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
          {/* BTC Price Card */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl shadow-lg hover:bg-[#1a3d4d]/60 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-600/20">
                  <DollarSign className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-teal-100/70 mb-1">BTC/USDT</div>
                  {isBtcLoading ? (
                    <Skeleton className="h-7 w-24 bg-white/10" />
                  ) : (
                    <div className="text-2xl font-bold text-white">
                      ${btcData?.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-teal-100/60">Current Price</div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-400" />
                  <span className="text-xs text-teal-100/60">Live from Binance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24h Change Card */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl shadow-lg hover:bg-[#1a3d4d]/60 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${
                  btcData && btcData.priceChangePercent >= 0
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20'
                    : 'bg-gradient-to-br from-red-500/20 to-rose-600/20'
                }`}>
                  {isBtcLoading ? (
                    <Activity className="w-6 h-6 text-white" />
                  ) : btcData && btcData.priceChangePercent >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-teal-100/70 mb-1">24h Change</div>
                  {isBtcLoading ? (
                    <Skeleton className="h-7 w-20 bg-white/10" />
                  ) : (
                    <div className={`text-2xl font-bold ${
                      btcData && btcData.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {btcData?.priceChangePercent.toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {isBtcLoading ? (
                  <Skeleton className="h-4 w-32 bg-white/10" />
                ) : (
                  <div className={`text-xs ${
                    btcData && btcData.priceChangePercent >= 0 ? 'text-green-400/80' : 'text-red-400/80'
                  }`}>
                    ${btcData?.priceChange.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                )}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      btcData && btcData.priceChangePercent >= 0
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-[50%]'
                        : 'bg-gradient-to-r from-red-400 to-rose-500 w-[50%]'
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24h Volume Card */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl shadow-lg hover:bg-[#1a3d4d]/60 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-teal-100/70 mb-1">24h Volume</div>
                  {isBtcLoading ? (
                    <Skeleton className="h-7 w-28 bg-white/10" />
                  ) : (
                    <div className="text-2xl font-bold text-white">
                      ${((btcData?.quoteVolume24h || 0) / 1000000000).toFixed(2)}B
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {isBtcLoading ? (
                  <Skeleton className="h-4 w-32 bg-white/10" />
                ) : (
                  <>
                    <div className="text-xs text-teal-100/60">
                      {btcData?.volume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })} BTC
                    </div>
                    <div className="flex justify-between text-xs text-teal-100/60">
                      <span>H: ${btcData?.high24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                      <span>L: ${btcData?.low24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Ctrl+K"
              className="w-full px-6 py-3 bg-white/5 backdrop-blur-md border border-teal-700/30 rounded-2xl text-white placeholder:text-teal-100/50 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Dock */}
      <Dock />
    </div>
  );
}
