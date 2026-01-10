import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Trash2, Save, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { journalApi } from '@/services/api';
import type { JournalEntry as JournalEntryType } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function JournalEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [entry, setEntry] = useState<JournalEntryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit state
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    if (!id) return;
    try {
      const data = await journalApi.getEntry(id);
      if (data) {
        setEntry(data);
        setEditContent(data.content);
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !editContent.trim()) return;
    
    setIsSaving(true);
    try {
      const updated = await journalApi.updateEntry(id, {
        content: editContent.trim(),
      });
      setEntry(updated);
      setIsEditing(false);
      toast({
        title: "Entry updated",
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
      await journalApi.deleteEntry(id);
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
        variant: "success",
      });
      navigate('/journal');
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
    if (entry) {
      setEditContent(entry.content);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-4" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!entry) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto text-center py-12">
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            Entry not found
          </h2>
          <p className="text-muted-foreground mb-4">
            This journal entry doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/journal')}>
            Back to Journal
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/journal')}
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
                  disabled={isSaving || !editContent.trim()}
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
                      <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your journal entry.
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

        {/* Entry Card */}
        <Card className="shadow-elegant">
          <CardContent className="p-6 space-y-6">
            {/* Date */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {format(new Date(entry.created_at), 'EEEE, MMMM d, yyyy • h:mm a')}
              </span>
            </div>

            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[300px] resize-none text-base leading-relaxed"
              />
            ) : (
              <>
                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>
                </div>

              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
