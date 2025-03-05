
import { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { LoadingSpinner } from "./LoadingSpinner";

export const LeaguePopularity = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would query league popularity from the database
        // For this demo, we'll generate mock data
        
        const mockData = [
          { name: 'Premier League', value: 45 },
          { name: 'La Liga', value: 20 },
          { name: 'Bundesliga', value: 15 },
          { name: 'Serie A', value: 10 },
          { name: 'Ligue 1', value: 7 },
          { name: 'Champions League', value: 3 }
        ];
        
        setData(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching league popularity:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">League Popularity</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
