
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { PredictionData } from "./types";
import { formatDate } from "./utils";

interface PredictionsCountChartProps {
  data: PredictionData[];
}

export const PredictionsCountChart = ({ data }: PredictionsCountChartProps) => {
  const emptyStats = !data || data.length === 0;

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
