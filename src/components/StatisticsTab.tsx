
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TimeFilterButtons } from "./statistics/TimeFilterButtons";
import { useStatistics } from "./statistics/useStatistics";
import { AccuracyRateChart } from "./statistics/AccuracyRateChart";
import { PredictionsCountChart } from "./statistics/PredictionsCountChart";
import { CombinedChart } from "./statistics/CombinedChart";
import { LeaguePerformanceTab } from "./statistics/LeaguePerformanceTab";
import { HeadToHeadTab } from "./statistics/HeadToHeadTab";
import { ResultTrendsTab } from "./statistics/ResultTrendsTab";
import { HomeAwayAnalysisTab } from "./statistics/HomeAwayAnalysisTab";
import { TimeFilter } from "./statistics/types";

interface StatisticsTabProps {
  league: string;
}

export const StatisticsTab = ({ league }: StatisticsTabProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");
  const { data: predictionStats, isLoading } = useStatistics(league, timeFilter);

  if (isLoading) {
    return <div className="h-48 w-full animate-pulse bg-secondary/50 rounded-lg"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Prediction History</h3>
        <TimeFilterButtons timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
      </div>

      <Tabs defaultValue="accuracy">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="accuracy">Accuracy Rate</TabsTrigger>
          <TabsTrigger value="predictions">Predictions Count</TabsTrigger>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="league">League Stats</TabsTrigger>
          <TabsTrigger value="h2h">Head to Head</TabsTrigger>
          <TabsTrigger value="trends">Result Trends</TabsTrigger>
          <TabsTrigger value="homeaway">Home/Away Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="accuracy" className="h-[400px]">
          <AccuracyRateChart data={predictionStats || []} />
        </TabsContent>

        <TabsContent value="predictions" className="h-[400px]">
          <PredictionsCountChart data={predictionStats || []} />
        </TabsContent>

        <TabsContent value="combined" className="h-[400px]">
          <CombinedChart data={predictionStats || []} />
        </TabsContent>

        <TabsContent value="league" className="h-[400px]">
          <LeaguePerformanceTab leagueId={league} timeFilter={timeFilter} />
        </TabsContent>

        <TabsContent value="h2h" className="h-[400px]">
          <HeadToHeadTab leagueId={league} />
        </TabsContent>

        <TabsContent value="trends" className="h-[400px]">
          <ResultTrendsTab leagueId={league} timeFilter={timeFilter} />
        </TabsContent>

        <TabsContent value="homeaway" className="h-[400px]">
          <HomeAwayAnalysisTab leagueId={league} timeFilter={timeFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
