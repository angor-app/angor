import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Dock } from '@/components/Dock';

interface ProjectCardData {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  investorCount: number;
  daysLeft: number;
  status: 'active' | 'funded' | 'completed';
  imageUrl?: string;
}

const mockProjects: ProjectCardData[] = [
  {
    id: '1',
    name: 'Bitcoin Education Platform',
    description: 'A comprehensive educational platform for learning Bitcoin and Lightning Network fundamentals.',
    targetAmount: 5.0,
    raisedAmount: 3.2,
    investorCount: 24,
    daysLeft: 45,
    status: 'active',
  },
  {
    id: '2',
    name: 'Open Source Lightning Wallet',
    description: 'Building a privacy-focused Lightning wallet with advanced channel management features.',
    targetAmount: 10.0,
    raisedAmount: 7.8,
    investorCount: 52,
    daysLeft: 30,
    status: 'active',
  },
  {
    id: '3',
    name: 'Decentralized Marketplace',
    description: 'P2P marketplace powered by Bitcoin payments and Nostr for product listings.',
    targetAmount: 8.0,
    raisedAmount: 8.0,
    investorCount: 41,
    daysLeft: 0,
    status: 'funded',
  },
];

function ProjectCard({ project }: { project: ProjectCardData }) {
  const progressPercentage = Math.min((project.raisedAmount / project.targetAmount) * 100, 100);

  return (
    <Card className="bg-[#0a1f2e]/60 border-teal-700/30 backdrop-blur-xl hover:bg-[#0a1f2e]/80 hover:border-teal-500/40 transition-all duration-500 overflow-hidden group hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1">
      {/* Hero Image Section */}
      <div className="h-52 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/back.jpeg')] opacity-20 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f2e] via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge 
            className={`
              capitalize backdrop-blur-md border font-semibold
              ${project.status === 'active' 
                ? 'bg-teal-500/20 text-teal-200 border-teal-400/40' 
                : 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
              }
            `}
          >
            {project.status}
          </Badge>
        </div>

        {/* Progress indicator on image */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-700"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
          {project.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-teal-100/60">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Funding Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-teal-200/60 font-medium">Funding Progress</span>
            <span className="font-bold text-white">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 transition-all duration-700 shadow-lg shadow-teal-500/50"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-teal-200/50">
              {project.raisedAmount.toFixed(2)} BTC
            </span>
            <span className="text-teal-200/50">
              {project.targetAmount.toFixed(2)} BTC
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <Users className="w-4 h-4 text-teal-400" />
            <div className="text-left">
              <div className="text-xs text-teal-200/50">Investors</div>
              <div className="text-sm font-bold text-white">{project.investorCount}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-xs text-teal-200/50">Time Left</div>
              <div className="text-sm font-bold text-white">
                {project.daysLeft > 0 ? `${project.daysLeft}d` : 'Ended'}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button className="w-full group/btn bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold shadow-lg hover:shadow-teal-500/30 transition-all duration-300">
          View Details
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

const Projects = () => {
  useSeoMeta({
    title: 'Browse Projects - Angor',
    description: 'Explore and invest in decentralized Bitcoin-funded projects on Angor.',
  });

  const [filter, setFilter] = useState<'all' | 'active' | 'funded'>('all');

  const filteredProjects = filter === 'all' 
    ? mockProjects 
    : mockProjects.filter(p => p.status === filter);

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      <div className="fixed inset-0 z-0 dashboard-background">
        <div className="absolute inset-0 dashboard-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5 mb-6 backdrop-blur-sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Browse Projects
            </h1>
            <p className="text-teal-100/60 text-xl max-w-2xl">
              Discover and invest in innovative Bitcoin-powered projects
            </p>
          </div>
        </div>

        {/* Glass morphism filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Button
            variant="ghost"
            onClick={() => setFilter('all')}
            className={`
              backdrop-blur-xl transition-all duration-300 font-semibold
              ${filter === 'all' 
                ? 'bg-gradient-to-r from-teal-500/30 to-cyan-500/30 text-white border-teal-400/50 shadow-lg shadow-teal-500/20' 
                : 'bg-white/5 text-teal-100/70 hover:bg-white/10 hover:text-white border-white/10'
              }
              border
            `}
          >
            All Projects
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
              {mockProjects.length}
            </Badge>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setFilter('active')}
            className={`
              backdrop-blur-xl transition-all duration-300 font-semibold
              ${filter === 'active' 
                ? 'bg-gradient-to-r from-teal-500/30 to-cyan-500/30 text-white border-teal-400/50 shadow-lg shadow-teal-500/20' 
                : 'bg-white/5 text-teal-100/70 hover:bg-white/10 hover:text-white border-white/10'
              }
              border
            `}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Active
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
              {mockProjects.filter(p => p.status === 'active').length}
            </Badge>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setFilter('funded')}
            className={`
              backdrop-blur-xl transition-all duration-300 font-semibold
              ${filter === 'funded' 
                ? 'bg-gradient-to-r from-teal-500/30 to-cyan-500/30 text-white border-teal-400/50 shadow-lg shadow-teal-500/20' 
                : 'bg-white/5 text-teal-100/70 hover:bg-white/10 hover:text-white border-white/10'
              }
              border
            `}
          >
            <Target className="w-4 h-4 mr-2" />
            Funded
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
              {mockProjects.filter(p => p.status === 'funded').length}
            </Badge>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="bg-[#0a1f2e]/40 border-teal-700/20 backdrop-blur-xl border-dashed border-2">
            <CardContent className="py-16 px-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <Target className="w-16 h-16 mx-auto text-teal-400/40" />
                <h3 className="text-xl font-semibold text-white">No Projects Found</h3>
                <p className="text-teal-100/50">
                  No projects match your current filter. Try selecting a different category.
                </p>
                <Button 
                  onClick={() => setFilter('all')}
                  variant="outline"
                  className="mt-4 bg-white/5 border-teal-500/30 text-teal-200 hover:bg-white/10 hover:border-teal-500/50"
                >
                  Show All Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dock />
    </div>
  );
};

export default Projects;
