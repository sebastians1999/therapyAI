import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Plus, 
  ArrowRight, 
  BookOpen, 
  Target, 
  Brain,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { journalApi, goalsApi } from '@/services/api';
import { JournalEntry, Goal } from '@/types';

export default function Dashboard() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = session?.user;

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesData, goalsData] = await Promise.all([
          journalApi.getEntries({ limit: 3 }),
          goalsApi.getGoals(),
        ]);
        setEntries(entriesData);
        setGoals(goalsData.filter(g => g.status === 'active'));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-foreground">
              {greeting()}, {user?.email?.split('@')[0] || 'there'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button asChild className="shadow-elegant">
            <Link to="/journal/new">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="gradient-card border-border/50 shadow-soft hover:shadow-elegant transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{entries.length}</p>
                  <p className="text-sm text-muted-foreground">Journal Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50 shadow-soft hover:shadow-elegant transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/20">
                  <Target className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{goals.length}</p>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Entries */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold text-foreground">Recent Entries</h2>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link to="/journal">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5">
                      <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                      <div className="h-3 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No journal entries yet</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to="/journal/new">Create your first entry</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <Link to={`/journal/${entry.id}`} key={entry.id}>
                    <Card 
                      className="hover:shadow-elegant transition-all duration-200 hover:border-primary/20 cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                              <span className="text-xs text-muted-foreground">
                                                {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                                              </span>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2">
                                              {entry.content}
                                            </p>
                                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Goals & AI Analysis */}
          <div className="space-y-6">
            {/* Active Goals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-semibold text-foreground">Goals</h2>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                  <Link to="/goals">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {goals.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-5 text-center">
                    <Target className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No active goals</p>
                    <Button asChild className="mt-3" variant="outline" size="sm">
                      <Link to="/goals/new">Add a goal</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 3).map((goal) => (
                    <Link to={`/goals/${goal.id}`} key={goal.id}>
                      <Card className="hover:shadow-soft transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-foreground line-clamp-2">
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {goal.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* AI Analysis CTA */}
            <Card className="bg-discover-patterns border-0 text-foreground overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">AI Insights</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    Discover Your Patterns
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get personalized insights from your journal entries.
                  </p>
                  <Button 
                    asChild
                    size="sm"
                  >
                    <Link to="/analysis">
                      <Brain className="h-4 w-4 mr-2" />
                      Run Analysis
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
