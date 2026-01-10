import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Target, Calendar, ArrowRight, CheckCircle2, PauseCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { AppLayout } from '@/components/layout/AppLayout';
import { goalsApi } from '@/services/api';
import { Goal } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: { label: 'Active', icon: Clock, className: 'text-primary bg-primary/10' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-mood-positive bg-mood-positive/10' },
  paused: { label: 'Paused', icon: PauseCircle, className: 'text-muted-foreground bg-muted' },
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalsApi.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(g => g.status === filter);

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">Goals</h1>
            <p className="text-muted-foreground mt-1">Track your mental wellness journey</p>
          </div>
          <Button asChild className="shadow-elegant">
            <Link to="/goals/new">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Goals</p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-primary">{stats.active}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-mood-positive">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'active', 'completed', 'paused'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-sm rounded-full whitespace-nowrap transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5">
                  <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-3 bg-muted rounded w-2/3 mb-4" />
                  <div className="h-2 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGoals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? 'Start setting goals to track your progress'
                  : 'Try changing the filter or add a new goal'}
              </p>
              {filter === 'all' && (
                <Button asChild>
                  <Link to="/goals/new">Create your first goal</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((goal, index) => {
              const StatusIcon = statusConfig[goal.status].icon;
              return (
                <Link to={`/goals/${goal.id}`} key={goal.id}>
                  <Card 
                    className="hover:shadow-elegant transition-all duration-200 hover:border-primary/20 cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{goal.title}</h3>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full",
                              statusConfig[goal.status].className
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig[goal.status].label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {goal.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                        {goal.target_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          <span>No target date</span>
                        )}
                        <div className="flex items-center gap-1">
                          View details
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
