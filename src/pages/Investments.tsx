import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dock } from '@/components/Dock';

interface Investment {
  id: string;
  projectName: string;
  amount: number;
  invested: number;
  status: 'active' | 'completed' | 'recovering';
  investmentDate: string;
  nextRelease?: string;
  stagesCompleted: number;
  totalStages: number;
}

const mockInvestments: Investment[] = [
  {
    id: '1',
    projectName: 'Bitcoin Education Platform',
    amount: 1.5,
    invested: 0.8,
    status: 'active',
    investmentDate: '2024-01-10',
    nextRelease: '2024-03-15',
    stagesCompleted: 2,
    totalStages: 5,
  },
  {
    id: '2',
    projectName: 'Open Source Lightning Wallet',
    amount: 2.0,
    invested: 2.0,
    status: 'completed',
    investmentDate: '2023-11-05',
    stagesCompleted: 4,
    totalStages: 4,
  },
];

const Investments = () => {
  useSeoMeta({
    title: 'My Investments - Angor',
    description: 'Track your Bitcoin project investments',
  });

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
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
          
          <h1 className="text-4xl font-bold text-white mb-2">My Investments</h1>
          <p className="text-teal-100/70">Track your project funding</p>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
              <CardContent className="p-6">
                <p className="text-teal-100/70 text-sm mb-2">Total Invested</p>
                <p className="text-3xl font-bold text-white">3.50 BTC</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
              <CardContent className="p-6">
                <p className="text-teal-100/70 text-sm mb-2">Active Projects</p>
                <p className="text-3xl font-bold text-white">1</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
              <CardContent className="p-6">
                <p className="text-teal-100/70 text-sm mb-2">Recoverable</p>
                <p className="text-3xl font-bold text-white">0.70 BTC</p>
              </CardContent>
            </Card>
          </div>

          {/* Investments List */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Your Investments</CardTitle>
            </CardHeader>
            <CardContent>
              {mockInvestments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-teal-100/50 mb-4">No investments yet</p>
                  <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                    <Link to="/projects">Browse Projects</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {investment.projectName}
                          </h3>
                          <Badge
                            variant={investment.status === 'active' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {investment.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-teal-300 hover:text-teal-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-teal-100/60 mb-1">Your Investment</p>
                          <p className="text-lg font-bold text-white">{investment.amount} BTC</p>
                        </div>
                        <div>
                          <p className="text-xs text-teal-100/60 mb-1">Funds Released</p>
                          <p className="text-lg font-bold text-green-400">{investment.invested} BTC</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-teal-100/60 mb-2">
                          <span>Stage Progress</span>
                          <span>{investment.stagesCompleted} / {investment.totalStages}</span>
                        </div>
                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`absolute h-full bg-gradient-to-r from-teal-400 to-cyan-500 transition-all ${
                              investment.stagesCompleted === investment.totalStages ? 'w-full' :
                              investment.stagesCompleted / investment.totalStages > 0.5 ? 'w-3/5' : 'w-2/5'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-teal-100/60">
                          <TrendingUp className="w-4 h-4" />
                          <span>Invested on {investment.investmentDate}</span>
                        </div>
                        {investment.nextRelease && (
                          <div className="flex items-center gap-1 text-teal-100/60">
                            <Calendar className="w-4 h-4" />
                            <span>Next: {investment.nextRelease}</span>
                          </div>
                        )}
                      </div>

                      {investment.status === 'active' && (
                        <div className="mt-4 pt-4 border-t border-teal-700/30">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-white/5 border-teal-700/30 text-white hover:bg-white/10"
                          >
                            Recover Remaining Funds
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dock />
    </div>
  );
};

export default Investments;
