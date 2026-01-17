import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  onSelect: (suggestion: string) => void;
}

const suggestions = [
  "What is CS 111?",
  "Prerequisites for CS 112",
  "Compare CS 111 and CS 112",
  "CS courses in Newark",
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
