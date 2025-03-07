
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "./LoadingSpinner";

export const DataInsightsDashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [comparativeData, setComparativeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("lastMonth");
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Em um app real, você buscaria dados reais do backend
        // Para este exemplo, usaremos dados simulados
        
        // Simular atraso na rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados para gráfico de linha/barras
        const mockData = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);
          
          mockData.push({
            date: date.toISOString().split('T')[0],
            userActivity: Math.floor(Math.random() * 500) + 1000,
            predictions: Math.floor(Math.random() * 800) + 2000,
            correctRate: Math.floor(Math.random() * 25) + 60,
            revenue: Math.floor(Math.random() * 5000) + 8000
          });
        }
        
        // Dados simulados para gráfico de pizza
        const mockPieData = [
          { name: "Premier League", value: 45 },
          { name: "La Liga", value: 20 },
          { name: "Serie A", value: 15 },
          { name: "Bundesliga", value: 10 },
          { name: "Ligue 1", value: 5 },
          { name: "Outros", value: 5 }
        ];
        
        // Dados simulados para comparação de ligas
        const mockComparativeData = [
          {
            name: "Premier League",
            homeWins: 48,
            awayWins: 32,
            draws: 20
          },
          {
            name: "La Liga",
            homeWins: 52,
            awayWins: 28,
            draws: 20
          },
          {
            name: "Serie A",
            homeWins: 45,
            awayWins: 30,
            draws: 25
          },
          {
            name: "Bundesliga",
            homeWins: 46,
            awayWins: 38,
            draws: 16
          },
          {
            name: "Ligue 1",
            homeWins: 50,
            awayWins: 25,
            draws: 25
          },
        ];
        
        setData(mockData);
        setPieData(mockPieData);
        setComparativeData(mockComparativeData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data insights:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Insights de Dados</h3>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7Days">Últimos 7 dias</SelectItem>
            <SelectItem value="lastMonth">Último mês</SelectItem>
            <SelectItem value="last3Months">Últimos 3 meses</SelectItem>
            <SelectItem value="lastYear">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atividade de Usuários</CardTitle>
            <CardDescription>Média diária de logins</CardDescription>
          </CardHeader>
          <CardContent className="h-28">
            <div className="text-2xl font-bold mb-1">
              {Math.round(data.reduce((sum, item) => sum + item.userActivity, 0) / data.length).toLocaleString()}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.slice(-7)}>
                <Line type="monotone" dataKey="userActivity" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Predições</CardTitle>
            <CardDescription>Total mensal</CardDescription>
          </CardHeader>
          <CardContent className="h-28">
            <div className="text-2xl font-bold mb-1">
              {Math.round(data.reduce((sum, item) => sum + item.predictions, 0) / data.length).toLocaleString()}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.slice(-7)}>
                <Line type="monotone" dataKey="predictions" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <CardDescription>Média geral</CardDescription>
          </CardHeader>
          <CardContent className="h-28">
            <div className="text-2xl font-bold mb-1">
              {Math.round(data.reduce((sum, item) => sum + item.correctRate, 0) / data.length)}%
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.slice(-7)}>
                <Line type="monotone" dataKey="correctRate" stroke="#ff8042" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="leagues">Ligas</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="h-[300px]">
          <Card>
            <CardHeader>
              <CardTitle>Tendências ao Longo do Tempo</CardTitle>
              <CardDescription>Atividade, predições e receita</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === "userActivity") return [`${value.toLocaleString()}`, "Atividade de Usuários"];
                      if (name === "predictions") return [`${value.toLocaleString()}`, "Predições"];
                      if (name === "correctRate") return [`${value}%`, "Taxa de Acerto"];
                      if (name === "revenue") return [`R$ ${value.toLocaleString()}`, "Receita"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="userActivity" name="Atividade de Usuários" stroke="#8884d8" />
                  <Line yAxisId="left" type="monotone" dataKey="predictions" name="Predições" stroke="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="correctRate" name="Taxa de Acerto (%)" stroke="#ff8042" />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Receita (R$)" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leagues" className="h-[300px]">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Predições por Liga</CardTitle>
              <CardDescription>Percentual de predições por liga</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="h-[300px]">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Resultados entre Ligas</CardTitle>
              <CardDescription>Vitórias em casa, fora e empates</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="homeWins" name="Vitórias em Casa (%)" fill="#82ca9d" />
                  <Bar dataKey="awayWins" name="Vitórias Fora (%)" fill="#8884d8" />
                  <Bar dataKey="draws" name="Empates (%)" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
