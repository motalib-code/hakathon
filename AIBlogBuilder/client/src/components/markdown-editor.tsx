import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Eye, Save, Send, Brain } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onSubmit?: () => void;
  aiSentiment?: string;
  className?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  onSave, 
  onSubmit, 
  aiSentiment,
  className = "" 
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("write");

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }, [value, onChange]);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-accent text-accent-foreground";
      case "negative":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}>
      <div className="border-b border-border p-4 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write" data-testid="tab-write">Write</TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          {aiSentiment && (
            <div className="flex items-center space-x-1 text-xs">
              <Brain className="w-3 h-3" />
              <Badge className={getSentimentColor(aiSentiment)} data-testid="badge-sentiment">
                {aiSentiment}
              </Badge>
            </div>
          )}
          
          {onSave && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSave}
              data-testid="button-save-draft"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
          
          {onSubmit && (
            <Button 
              size="sm" 
              onClick={onSubmit}
              data-testid="button-submit"
            >
              <Send className="w-4 h-4 mr-1" />
              Submit
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="write" className="p-6 m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your blog post... Use markdown for formatting!"
            className="min-h-[400px] resize-none border-none shadow-none focus-visible:ring-0 text-sm font-mono"
            data-testid="textarea-content"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-6 m-0">
          <div className="min-h-[400px] prose prose-sm max-w-none dark:prose-invert" data-testid="div-preview">
            {value.trim() ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground text-sm">Preview will appear here as you write...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
