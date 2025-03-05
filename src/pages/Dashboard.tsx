
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserStats } from "@/components/dashboard/UserStats";
import { PredictionStats } from "@/components/dashboard/PredictionStats";
import { LeaguePopularity } from "@/components/dashboard/LeaguePopularity";
import { RevenueOverview } from "@/components/dashboard/RevenueOverview";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          toast({
            title: "Unauthorized",
            description: "You must be logged in to access this page.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // In a real app, you would check if the user is an admin
        // Here we're using a simple email check for demonstration
        // This should be replaced with proper role-based authorization
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // For demo purposes, treat all authenticated users as admins
        // In production, you should check an admin flag or role
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to verify your access rights.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null; // We navigate away in the useEffect, so this should never render
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardHeader />
      
      <Tabs defaultValue="overview" className="space-y-4 mt-8">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UserStats type="total" />
            <UserStats type="active" />
            <UserStats type="new" />
            <UserStats type="premium" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PredictionStats />
            <LeaguePopularity />
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New sign-ups over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <UserStats type="growth" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Retention</CardTitle>
              <CardDescription>User engagement and retention metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <UserStats type="retention" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Accuracy</CardTitle>
              <CardDescription>Overall prediction accuracy by league</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <PredictionStats type="accuracy" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Popular Matches</CardTitle>
              <CardDescription>Most predicted matches</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <PredictionStats type="popular" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <RevenueOverview />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
