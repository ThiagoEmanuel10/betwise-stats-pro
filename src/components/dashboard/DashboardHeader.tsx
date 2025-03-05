
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Management Dashboard</h1>
        <p className="text-muted-foreground">{date}</p>
      </div>
      <div className="mt-4 md:mt-0 space-x-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.print()}
        >
          Generate Report
        </Button>
        <Button onClick={() => navigate("/")}>
          Go to App
        </Button>
      </div>
    </div>
  );
};
