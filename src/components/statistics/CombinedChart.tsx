
import { ResponsiveContainer, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { PredictionData } from "./types";
import { formatDate } from "./utils";

interface CombinedChartProps {
  data: PredictionData[];
}

export const CombinedChart = ({ data }: CombinedChartProps) => {
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
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === "Accuracy Rate (%)") {
              return [`${Number(value).toFixed(0)}%`, name];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
        />
        <Legend />
        <Bar dataKey="total" name="Total Predictions" fill="#94a3b8" yAxisId="left" />
        <Line 
          type="monotone" 
          dataKey="rate" 
          name="Accuracy Rate (%)" 
          stroke="#8884d8" 
          yAxisId="right"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
