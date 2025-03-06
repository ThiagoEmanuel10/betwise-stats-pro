
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { PredictionData } from "./types";
import { formatDate } from "./utils";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface PredictionsCountChartProps {
  data: PredictionData[];
}

export const PredictionsCountChart = ({ data }: PredictionsCountChartProps) => {
  const emptyStats = !data || data.length === 0;

  // Track chart view
  useEffect(() => {
    if (!emptyStats) {
      trackEvent('view_prediction_chart', {
        data_points: data.length,
        time_period: data.length > 0 ? 
          `${new Date(data[0].date).toISOString().split('T')[0]} to ${new Date(data[data.length-1].date).toISOString().split('T')[0]}` : 
          'unknown'
      });
    }
  }, [data, emptyStats]);

  if (emptyStats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No prediction data available for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} />
        <YAxis />
        <Tooltip 
          labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
        />
        <Legend />
        <Bar dataKey="correct" name="Correct" fill="#4ade80" />
        <Bar dataKey="incorrect" name="Incorrect" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  );
};
