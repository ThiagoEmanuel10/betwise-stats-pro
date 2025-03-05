
import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "./LoadingSpinner";

export const RevenueOverview = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would query revenue data from the database
        // For this demo, we'll generate mock data
        
        const mockData = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);
          
          mockData.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 10000) + 5000,
            basic: Math.floor(Math.random() * 50) + 100,
            premium: Math.floor(Math.random() * 30) + 50,
            ultra: Math.floor(Math.random() * 20) + 20,
          });
        }
        
        setData(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const averageRevenue = totalRevenue / data.length;
  const lastMonthRevenue = data[data.length - 1].revenue;
  const previousMonthRevenue = data[data.length - 2].revenue;
  const percentageChange = ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Revenue (12 mo)</p>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Monthly Average</p>
          <p className="text-2xl font-bold">${Math.round(averageRevenue).toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Last Month</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold">${lastMonthRevenue.toLocaleString()}</p>
            <span className={`ml-2 ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "basic") return [value, "Basic"];
                  if (name === "premium") return [value, "Premium"];
                  if (name === "ultra") return [value, "Ultra"];
                  return [value, name];
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              />
              <Bar dataKey="basic" name="Basic" stackId="a" fill="#82ca9d" />
              <Bar dataKey="premium" name="Premium" stackId="a" fill="#8884d8" />
              <Bar dataKey="ultra" name="Ultra" stackId="a" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
};
