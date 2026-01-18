import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  onSelect: (suggestion: string) => void;
}

const suggestions = [
  "What's my major's requirements?",
  "How do I graduate on time?",
  "What courses should I take first?",
  "What are the best CS electives?",
  "Prerequisites for CS 112",
  "Compare intro courses",
];

export const SuggestionChips = ({ onSelect }: SuggestionChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          className="text-xs rounded-full border-border hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};
