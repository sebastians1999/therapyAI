import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { journalApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function JournalNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Entry required",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await journalApi.createEntry({
        content: content.trim(),
      });
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
        variant: "success",
      });
      navigate('/journal');
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
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !content.trim()}
            className="shadow-elegant"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>

        {/* Entry Form */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                What's on your mind?
              </label>
              <Textarea
                placeholder="Write freely about your thoughts, feelings, experiences..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-none text-base leading-relaxed"
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length} characters
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
