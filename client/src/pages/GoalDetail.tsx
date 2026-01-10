import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Trash2, Save, Calendar, CheckCircle2, PauseCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { goalsApi } from '@/services/api';
import { Goal } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  active: { label: 'Active', icon: PlayCircle, className: 'text-primary bg-primary/10' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-mood-positive bg-mood-positive/10' },
  paused: { label: 'Paused', icon: PauseCircle, className: 'text-muted-foreground bg-muted' },
};

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState<Goal['status']>('active');

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    if (!id) return;
    try {
      const data = await goalsApi.getGoal(id);
      if (data) {
        setGoal(data);
        setEditTitle(data.title);
        setEditDescription(data.description);
        setEditTargetDate(data.target_date || '');
        setEditProgress(data.progress);
        setEditStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !editTitle.trim()) return;
    
    setIsSaving(true);
    try {
      const updated = await goalsApi.updateGoal(id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        target_date: editTargetDate || undefined,
        progress: editProgress,
        status: editStatus,
      });
      setGoal(updated);
      setIsEditing(false);
      toast({
        title: "Goal updated",
        description: "Your changes have been saved.",
        variant: "success",
      });
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

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await goalsApi.deleteGoal(id);
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed.",
        variant: "success",
      });
      navigate('/goals');
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const cancelEdit = () => {
    if (goal) {
      setEditTitle(goal.title);
      setEditDescription(goal.description);
      setEditTargetDate(goal.target_date || '');
      setEditProgress(goal.progress);
      setEditStatus(goal.status);
    }
    setIsEditing(false);
  };

  const updateProgress = async (newProgress: number) => {
    if (!id || !goal) return;
    try {
      const updated = await goalsApi.updateGoal(id, { progress: newProgress });
      setGoal(updated);
      setEditProgress(newProgress);
      toast({
        title: "Progress updated",
        description: `Progress set to ${newProgress}%`,
        variant: "success",
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded w-2/3 mb-6" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!goal) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            Goal not found
          </h2>
          <p className="text-muted-foreground mb-4">
            This goal doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/goals')}>
            Back to Goals
          </Button>
        </div>
      </AppLayout>
    );
  }

  const StatusIcon = statusConfig[goal.status].icon;

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
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !editTitle.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your goal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Goal Card */}
        <Card className="shadow-elegant">
          <CardContent className="p-6 space-y-6">
            {isEditing ? (
              <>
                {/* Edit Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                {/* Edit Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Edit Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <div className="flex gap-2">
                    {(['active', 'paused', 'completed'] as const).map((status) => {
                      const Icon = statusConfig[status].icon;
                      return (
                        <button
                          key={status}
                          onClick={() => setEditStatus(status)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all",
                            editStatus === status
                              ? statusConfig[status].className + " border-current"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {statusConfig[status].label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Edit Target Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target Date</label>
                  <Input
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                  />
                </div>

              </>
            ) : (
              <>
                {/* View Mode */}
                <div>
                  <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
                    {goal.title}
                  </h1>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full",
                    statusConfig[goal.status].className
                  )}>
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig[goal.status].label}
                  </span>
                </div>

                <p className="text-muted-foreground">{goal.description}</p>

                {/* Meta info */}
                <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                  {goal.target_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Target: {format(new Date(goal.target_date), 'MMMM d, yyyy')}
                    </div>
                  )}
                  <p>Created {format(new Date(goal.created_at), 'MMMM d, yyyy')}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
