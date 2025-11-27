import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Target, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dock } from '@/components/Dock';
import { useState } from 'react';

interface Stage {
  id: string;
  releaseDate: string;
  amount: string;
}

const CreateProject = () => {
  useSeoMeta({
    title: 'Create Project - Angor',
    description: 'Create a new Bitcoin-funded project on Angor',
  });

  const [stages, setStages] = useState<Stage[]>([
    { id: '1', releaseDate: '', amount: '' },
  ]);

  const addStage = () => {
    setStages([...stages, { id: Date.now().toString(), releaseDate: '', amount: '' }]);
  };

  const removeStage = (id: string) => {
    if (stages.length > 1) {
      setStages(stages.filter(s => s.id !== id));
    }
  };

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
          
          <h1 className="text-4xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-teal-100/70">Launch your Bitcoin-funded project</p>
        </div>

        <div className="space-y-6">
          {/* Project Details */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Project Details</CardTitle>
              <CardDescription className="text-teal-100/60">
                Basic information about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Bitcoin Education Platform"
                  className="bg-white/5 border-teal-700/30 text-white placeholder:text-teal-100/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, its goals, and how funds will be used..."
                  className="bg-white/5 border-teal-700/30 text-white placeholder:text-teal-100/40 min-h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    className="bg-white/5 border-teal-700/30 text-white placeholder:text-teal-100/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target" className="text-white flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Target Amount (BTC)
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.001"
                    placeholder="5.0"
                    className="bg-white/5 border-teal-700/30 text-white placeholder:text-teal-100/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Stages */}
          <Card className="bg-[#1a3d4d]/50 border-teal-700/40 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Funding Stages</CardTitle>
                  <CardDescription className="text-teal-100/60">
                    Define when and how much will be released
                  </CardDescription>
                </div>
                <Button
                  onClick={addStage}
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex gap-4 items-end">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Stage {index + 1} - Release Date
                      </Label>
                      <Input
                        type="date"
                        value={stage.releaseDate}
                        onChange={(e) => {
                          const newStages = [...stages];
                          newStages[index].releaseDate = e.target.value;
                          setStages(newStages);
                        }}
                        className="bg-white/5 border-teal-700/30 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Amount (BTC)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={stage.amount}
                        onChange={(e) => {
                          const newStages = [...stages];
                          newStages[index].amount = e.target.value;
                          setStages(newStages);
                        }}
                        placeholder="1.0"
                        className="bg-white/5 border-teal-700/30 text-white placeholder:text-teal-100/40"
                      />
                    </div>
                  </div>

                  {stages.length > 1 && (
                    <Button
                      onClick={() => removeStage(stage.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              asChild
              variant="outline"
              className="flex-1 bg-white/5 border-teal-700/30 text-white hover:bg-white/10"
            >
              <Link to="/">Cancel</Link>
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
            >
              Create Project
            </Button>
          </div>
        </div>
      </div>

      <Dock />
    </div>
  );
};

export default CreateProject;
