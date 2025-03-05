
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Users, UserPlus, UserCheck, Crown } from "lucide-react";

type UserStatsProps = {
  type: "total" | "active" | "new" | "premium" | "growth" | "retention";
};

export const UserStats = ({ type }: UserStatsProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [increase, setIncrease] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would query different data based on the type
        // For this demo, we'll generate mock data
        
        if (type === "total" || type === "active" || type === "new" || type === "premium") {
          // For card stats, we just need totals
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });
          
          setCount(count || 0);
          setIncrease(Math.floor(Math.random() * 10) + 5); // Mock increase percentage
        } else {
          // For charts, we need time series data
          const mockData = [];
          const now = new Date();
          
          for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            
            mockData.push({
              date: date.toISOString().split('T')[0],
              value: type === "growth" 
                ? Math.floor(Math.random() * 50) + 10 // New users
                : Math.floor(Math.random() * 20) + 70, // Retention percentage
              total: Math.floor(Math.random() * 1000) + 500,
            });
          }
          
          setData(mockData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${type} user stats:`, error);
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  if (type === "growth") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} users`, 'New Sign-ups']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          />
          <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === "retention") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Retention Rate']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          />
          <Line type="monotone" dataKey="value" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const getIconByType = () => {
    switch (type) {
      case "total":
        return <Users className="h-6 w-6" />;
      case "active":
        return <UserCheck className="h-6 w-6" />;
      case "new":
        return <UserPlus className="h-6 w-6" />;
      case "premium":
        return <Crown className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getTitleByType = () => {
    switch (type) {
      case "total":
        return "Total Users";
      case "active":
        return "Active Users";
      case "new":
        return "New Users";
      case "premium":
        return "Premium Users";
      default:
        return "Users";
    }
  };

  const getDescriptionByType = () => {
    switch (type) {
      case "total":
        return "All registered users";
      case "active":
        return "Users active in last 7 days";
      case "new":
        return "New users this month";
      case "premium":
        return "Paying subscribers";
      default:
        return "";
    }
  };

  // For the small stat cards
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {getTitleByType()}
        </CardTitle>
        <div className="text-primary">
          {getIconByType()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : count.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">
          {getDescriptionByType()}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center text-sm text-green-600">
          <ArrowUpRight className="mr-1 h-4 w-4" />
          {increase}% from last month
        </div>
      </CardFooter>
    </Card>
  );
};
