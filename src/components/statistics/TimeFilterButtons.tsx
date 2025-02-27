
import { Button } from "@/components/ui/button";
import { TimeFilter } from "./types";

interface TimeFilterButtonsProps {
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
}

export const TimeFilterButtons = ({ timeFilter, setTimeFilter }: TimeFilterButtonsProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={timeFilter === "7days" ? "default" : "outline"} 
        size="sm" 
        onClick={() => setTimeFilter("7days")}
      >
        7 Days
      </Button>
      <Button 
        variant={timeFilter === "30days" ? "default" : "outline"} 
        size="sm" 
        onClick={() => setTimeFilter("30days")}
      >
        30 Days
      </Button>
      <Button 
        variant={timeFilter === "90days" ? "default" : "outline"} 
        size="sm" 
        onClick={() => setTimeFilter("90days")}
      >
        3 Months
      </Button>
      <Button 
        variant={timeFilter === "all" ? "default" : "outline"} 
        size="sm" 
        onClick={() => setTimeFilter("all")}
      >
        All Time
      </Button>
    </div>
  );
};
