
import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";

type PredictionStatsProps = {
  type?: "accuracy" | "popular";
};

export const PredictionStats = ({ type }: PredictionStatsProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would query prediction stats from the database
        // For this demo, we'll generate mock data
        
        if (type === "accuracy") {
          // Mock data for prediction accuracy by league
          const leagues = [
            { name: "Premier League", id: "39" },
            { name: "La Liga", id: "140" },
            { name: "Bundesliga", id: "78" },
            { name: "Serie A", id: "135" },
            { name: "Ligue 1", id: "61" },
            { name: "Champions League", id: "2" }
          ];
          
          const mockData = leagues.map(league => ({
            name: league.name,
            correct: Math.floor(Math.random() * 200) + 300,
            incorrect: Math.floor(Math.random() * 150) + 150,
            rate: Math.floor(Math.random() * 30) + 60
          }));
          
          setData(mockData);
        } else if (type === "popular") {
          // Mock data for popular matches
          const mockData = [
            { name: "Man Utd vs Liverpool", value: Math.floor(Math.random() * 500) + 1000 },
            { name: "Barcelona vs Real Madrid", value: Math.floor(Math.random() * 500) + 1000 },
            { name: "Arsenal vs Tottenham", value: Math.floor(Math.random() * 300) + 800 },
            { name: "Bayern vs Dortmund", value: Math.floor(Math.random() * 300) + 800 },
            { name: "PSG vs Marseille", value: Math.floor(Math.random() * 200) + 700 },
            { name: "Inter vs Juventus", value: Math.floor(Math.random() * 200) + 700 }
          ];
          
          setData(mockData);
        } else {
          // For the overview card, get summary stats
          const { data: predictions, error } = await supabase
            .from("match_predictions")
            .select("is_correct");
          
          if (error) throw error;
          
          const totalPredictions = predictions?.length || 0;
          const correctPredictions = predictions?.filter(p => p.is_correct).length || 0;
          
          // Get prediction counts by date for chart
          const now = new Date();
          const mockData = [];
          
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            mockData.push({
              date: dateStr,
              total: Math.floor(Math.random() * 200) + 100,
              correct: Math.floor(Math.random() * 100) + 50,
              incorrect: Math.floor(Math.random() * 50) + 20
            });
          }
          
          setData(mockData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prediction stats:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (type === "accuracy") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <Tooltip formatter={(value, name) => {
            if (name === "rate") return [`${value}%`, "Accuracy Rate"];
            return [value, name === "correct" ? "Correct" : "Incorrect"];
          }} />
          <Legend />
          <Bar yAxisId="left" dataKey="correct" name="Correct" fill="#4ade80" />
          <Bar yAxisId="left" dataKey="incorrect" name="Incorrect" fill="#f87171" />
          <Bar yAxisId="right" dataKey="rate" name="Accuracy Rate (%)" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "popular") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} predictions`, 'Count']} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Default overview chart
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Predictions</p>
          <p className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Correct</p>
          <p className="text-2xl font-bold text-green-500">{data.reduce((sum, item) => sum + item.correct, 0).toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Incorrect</p>
          <p className="text-2xl font-bold text-red-500">{data.reduce((sum, item) => sum + item.incorrect, 0).toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Accuracy Rate</p>
          <p className="text-2xl font-bold">
            {Math.round(data.reduce((sum, item) => sum + item.correct, 0) / data.reduce((sum, item) => sum + item.total, 0) * 100)}%
          </p>
        </div>
      </div>
      
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            />
            <Legend />
            <Bar dataKey="correct" name="Correct" fill="#4ade80" />
            <Bar dataKey="incorrect" name="Incorrect" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
