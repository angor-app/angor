import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock, Target, ArrowRight } from 'lucide-react';
import { useState } from 'react';

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
  const progressClass = `w-[${progressPercentage}%]`;

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 overflow-hidden group">
      <div className="h-48 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/back.jpeg')] opacity-10 bg-cover bg-center" />
        <div className="absolute top-4 right-4">
          <Badge 
            variant={project.status === 'active' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {project.status}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {project.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {project.raisedAmount.toFixed(2)} / {project.targetAmount.toFixed(2)} BTC
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-teal-500 to-cyan-600 transition-all duration-500 ${progressClass}`} />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{project.investorCount} investors</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{project.daysLeft > 0 ? `${project.daysLeft} days left` : 'Ended'}</span>
          </div>
        </div>

        <Button className="w-full group/btn" variant="default">
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Projects</h1>
          <p className="text-muted-foreground text-lg">
            Discover innovative Bitcoin projects seeking funding
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Projects
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Active
          </Button>
          <Button
            variant={filter === 'funded' ? 'default' : 'outline'}
            onClick={() => setFilter('funded')}
          >
            <Target className="w-4 h-4 mr-2" />
            Funded
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-4">
                <p className="text-muted-foreground">
                  No projects found matching your filter.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Projects;
