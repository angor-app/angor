import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, ArrowDownToLine, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dock } from '@/components/Dock';

const Wallet = () => {
  useSeoMeta({
    title: 'Wallet - Angor',
    description: 'Manage your Bitcoin wallet',
  });

  const walletAddress = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';

  const transactions = [
    {
      id: '1',
      type: 'received',
      amount: 0.5,
      date: '2024-01-15',
      confirmations: 6,
      txid: 'abc123...def456',
    },
    {
      id: '2',
      type: 'sent',
      amount: -0.2,
      date: '2024-01-14',
      confirmations: 12,
      txid: 'ghi789...jkl012',
    },
  ];

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
          
          <h1 className="text-4xl font-bold text-white mb-2">Bitcoin Wallet</h1>
          <p className="text-teal-100/70">Manage your Bitcoin funds</p>
        </div>

        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border-teal-700/40 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-teal-100/70 mb-2">Total Balance</p>
                <h2 className="text-5xl font-bold text-white mb-6">0.00 BTC</h2>
                <p className="text-teal-100/60 text-lg">≈ $0.00 USD</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-teal-700/40">
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Receive
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
              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg">
                <code className="flex-1 text-sm text-white font-mono break-all">
                  {walletAddress}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-teal-300 hover:text-teal-200 hover:bg-white/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-teal-100/50">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${tx.type === 'received' ? 'text-green-400' : 'text-orange-400'}`}>
                            {tx.type === 'received' ? 'Received' : 'Sent'}
                          </span>
                          <span className="text-xs text-teal-100/50">
                            {tx.confirmations} confirmations
                          </span>
                        </div>
                        <code className="text-xs text-teal-100/60 font-mono">
                          {tx.txid}
                        </code>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} BTC
                        </p>
                        <p className="text-xs text-teal-100/50">{tx.date}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-4 text-teal-300 hover:text-teal-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
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

export default Wallet;
