
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartType, ColorScheme, DataVisualizationPreferences } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface VisualizationSettingsProps {
  preferences: DataVisualizationPreferences;
  onPreferencesChange: (preferences: DataVisualizationPreferences) => void;
}

export const VisualizationSettings = ({ 
  preferences, 
  onPreferencesChange 
}: VisualizationSettingsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleChartTypeChange = (value: string) => {
    onPreferencesChange({
      ...preferences,
      chartType: value as ChartType
    });
  };

  const handleColorSchemeChange = (value: string) => {
    onPreferencesChange({
      ...preferences,
      colorScheme: value as ColorScheme
    });
  };

  const handleToggleChange = (key: keyof DataVisualizationPreferences, value: boolean) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { error } = await supabase
        .from("profiles")
        .update({
          data_visualization_preferences: preferences
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        description: "Configurações de visualização salvas com sucesso",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar as configurações de visualização",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chart-type">Tipo de gráfico</Label>
          <Tabs 
            id="chart-type" 
            defaultValue={preferences.chartType} 
            onValueChange={handleChartTypeChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="line">Linha</TabsTrigger>
              <TabsTrigger value="bar">Barra</TabsTrigger>
              <TabsTrigger value="area">Área</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-scheme">Esquema de cores</Label>
          <Tabs 
            id="color-scheme" 
            defaultValue={preferences.colorScheme} 
            onValueChange={handleColorSchemeChange} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="default">Padrão</TabsTrigger>
              <TabsTrigger value="blue">Azul</TabsTrigger>
              <TabsTrigger value="green">Verde</TabsTrigger>
              <TabsTrigger value="purple">Roxo</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="show-legend" className="flex-grow">Mostrar legenda</Label>
          <Switch 
            id="show-legend" 
            checked={preferences.showLegend} 
            onCheckedChange={(checked) => handleToggleChange("showLegend", checked)} 
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="show-grid" className="flex-grow">Mostrar grade</Label>
          <Switch 
            id="show-grid" 
            checked={preferences.showGrid} 
            onCheckedChange={(checked) => handleToggleChange("showGrid", checked)} 
          />
        </div>

        <button 
          onClick={savePreferences} 
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          {loading ? "Salvando..." : "Salvar configurações"}
        </button>
      </CardContent>
    </Card>
  );
};
