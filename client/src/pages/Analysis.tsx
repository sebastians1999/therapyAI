import { useState } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb,
  ChevronRight,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { inferenceApi } from '@/services/api';
import { cn } from '@/lib/utils';

type TimeRange = '1' | '7' | '14';

export default function Analysis() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1');

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inferenceApi.getMentalHealthCheckin(parseInt(selectedRange) as 1 | 7 | 14);
      setAnalysis(result.analysis);
      setEntryDate(result.date_range);
      setHasRunAnalysis(true);
    } catch (error: any) {
      console.error('Failed to run analysis:', error);
      // Check if error is about not enough entries
      if (error.message && error.message.includes('Not enough entries')) {
        setError('Not enough Entries');
      } else {
        setError(error.message || `Failed to generate analysis. Please make sure you have at least one journal entry in the last ${selectedRange} day(s).`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">AI Analysis</h1>
            <p className="text-muted-foreground mt-1">Mental health check-in for your journal entries</p>
          </div>
        </div>

        {/* Analysis Trigger */}
        <Card className="gradient-hero border-0 text-primary-foreground overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">AI-Powered Mental Health Check-In</span>
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  Analyze Your Journal Entries
                </h2>
                <p className="text-sm text-primary-foreground/80">
                  Get personalized, supportive feedback on your journal entries using AI analysis.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                  {(['1', '7', '14'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-md transition-all",
                        selectedRange === range
                          ? "bg-white/20 text-primary-foreground"
                          : "text-primary-foreground/70 hover:text-primary-foreground"
                      )}
                    >
                      {range}d
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={runAnalysis}
                  disabled={isLoading}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-mood-negative/30 bg-mood-negative/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-mood-negative mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-mood-negative mb-1">Error</h4>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {hasRunAnalysis && analysis && (
          <div className="space-y-6 animate-slide-up">
            {/* Header with Entry Date */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Mental Health Check-In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Analysis for entry from <span className="font-medium text-foreground">{entryDate}</span>
                </p>
                <div className="bg-muted/30 rounded-lg p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Note Alert */}
            {analysis.toLowerCase().includes('safety') || 
             analysis.toLowerCase().includes('self-harm') || 
             analysis.toLowerCase().includes('suicidal') ? (
              <Card className="border-mood-negative/30 bg-mood-negative/5">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-mood-negative" />
                    Safety Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-mood-negative font-medium mb-3">
                    Important safety concerns were identified in the analysis above.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please reach out to:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-mood-negative" />
                      <span><strong>National Suicide Prevention Lifeline:</strong> 988 (US)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-mood-negative" />
                      <span><strong>Crisis Text Line:</strong> Text HOME to 741741</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-mood-negative" />
                      <span><strong>International Association for Suicide Prevention:</strong> https://www.iasp.info/resources/Crisis_Centres/</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {!hasRunAnalysis && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                No analysis yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Select a time range above and click Run Analysis to receive personalized mental health insights.
              </p>
              <Button onClick={runAnalysis}>
                <Brain className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
