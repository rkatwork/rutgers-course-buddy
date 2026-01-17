import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface CampusSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const campuses = [
  { value: "all", label: "All Campuses" },
  { value: "New Brunswick", label: "New Brunswick" },
  { value: "Newark", label: "Newark" },
  { value: "Camden", label: "Camden" },
];

export const CampusSelector = ({ value, onChange }: CampusSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] bg-card border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Select campus" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {campuses.map((campus) => (
          <SelectItem key={campus.value} value={campus.value}>
            {campus.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
