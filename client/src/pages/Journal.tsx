import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Calendar,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout/AppLayout';
import { journalApi } from '@/services/api';
import { JournalEntry } from '@/types';

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const data = await journalApi.getEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return entry.content.toLowerCase().includes(query);
  });

  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = format(new Date(entry.created_at), 'MMMM yyyy');
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">Journal</h1>
            <p className="text-muted-foreground mt-1">Your personal reflection space</p>
          </div>
          <Button asChild className="shadow-elegant">
            <Link to="/journal/new">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Entries List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5">
                  <div className="h-3 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No matching entries' : 'No journal entries yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search'
                  : 'Start documenting your thoughts and feelings'}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/journal/new">Create your first entry</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([month, monthEntries]) => (
              <div key={month} className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {month}
                </h2>
                <div className="space-y-3">
                  {monthEntries.map((entry, index) => (
                    <Link to={`/journal/${entry.id}`} key={entry.id}>
                      <Card 
                        className="hover:shadow-elegant transition-all duration-200 hover:border-primary/20 cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(entry.created_at), 'EEEE, MMMM d • h:mm a')}
                                </span>
                              </div>
                              <p className="text-foreground line-clamp-3">
                                {entry.content}
                              </p>
                                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
