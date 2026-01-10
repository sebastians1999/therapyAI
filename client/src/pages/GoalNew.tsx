import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { AppLayout } from '@/components/layout/AppLayout';
import { goalsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function GoalNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your goal.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await goalsApi.createGoal({
        title: title.trim(),
        description: description.trim(),
        target_date: targetDate || undefined,
        progress: 0,
        status: 'active',
      });
      toast({
        title: "Goal created",
        description: "Your new goal has been saved successfully.",
        variant: "success",
      });
      navigate('/goals');
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/goals')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !title.trim()}
            className="shadow-elegant"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Goal'}
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">New Goal</h1>
          <p className="text-muted-foreground mt-1">Define what you want to achieve</p>
        </div>

        {/* Form */}
        <Card className="shadow-elegant">
          <CardContent className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Goal Title *
              </label>
              <Input
                placeholder="e.g., Daily Meditation Practice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                placeholder="Describe your goal and why it's important to you..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Target Date <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
