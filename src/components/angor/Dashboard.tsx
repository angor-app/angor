import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { Dock } from '@/components/Dock';

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
    <div className="min-h-screen relative overflow-hidden pb-24">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0 dashboard-background">
        <div className="absolute inset-0 dashboard-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-8 max-w-6xl mx-auto">
        {/* Header with Logo and Login */}
        <div className="flex justify-between items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          
          <LoginArea className="max-w-60" />
        </div>

        {/* Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">
            {greeting()}, {userName}.
          </h1>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
          {/* CPU Card */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl shadow-lg hover:bg-[#1a3d4d]/60 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-teal-100/70 mb-1">CPU</div>
                  <div className="text-2xl font-bold text-white">38%</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-teal-100/60">Live Usage</div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Card */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl shadow-lg hover:bg-[#1a3d4d]/60 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-teal-100/70 mb-1">Storage</div>
                  <div className="text-2xl font-bold text-white">279 GB</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-teal-100/60">/ 2.02 TB</div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 w-[14%]" />
                </div>
                <div className="text-xs text-teal-100/60">1.74 TB left</div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Card */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl shadow-lg hover:bg-[#1a3d4d]/60 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <MemoryStick className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-teal-100/70 mb-1">Memory</div>
                  <div className="text-2xl font-bold text-white">3.99 GB</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-teal-100/60">/ 8.19 GB</div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 w-[49%]" />
                </div>
                <div className="text-xs text-teal-100/60">4.2 GB left</div>
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
