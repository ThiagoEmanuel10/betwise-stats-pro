
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { PredictionData } from "./types";
import { formatDate } from "./utils";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface PredictionsCountChartProps {
  data: PredictionData[];
}

export const PredictionsCountChart = ({ data }: PredictionsCountChartProps) => {
  const emptyStats = !data || data.length === 0;
  const [animatedData, setAnimatedData] = useState<PredictionData[]>([]);

  // Animação de entrada para os dados
  useEffect(() => {
    if (!emptyStats) {
      // Começa com dados zerados para animação
      const initialData = data.map(item => ({
        ...item,
        correct: 0,
        incorrect: 0
      }));
      
      setAnimatedData(initialData);
      
      // Anima até os valores reais em 1 segundo
      const timeout = setTimeout(() => {
        setAnimatedData(data);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [data, emptyStats]);

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
      <Card className="card-transition">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No prediction data available for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-transition">
      <CardContent className="p-4 fade-in">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={animatedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                wrapperClassName="glass"
                contentStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '8px 12px'
                }}
                cursor={{fill: 'rgba(0, 0, 0, 0.04)'}}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '10px'
                }}
              />
              <Bar 
                dataKey="correct" 
                name="Correct" 
                fill="#4ade80" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Bar 
                dataKey="incorrect" 
                name="Incorrect" 
                fill="#f87171" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
