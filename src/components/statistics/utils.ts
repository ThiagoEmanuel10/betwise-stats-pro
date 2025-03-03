
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

export const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

export const calculateWinRate = (wins: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

export const getWinLossColor = (value: number): string => {
  if (value >= 60) return "#4ade80"; // green for good performance
  if (value >= 40) return "#facc15"; // yellow for average
  return "#f87171"; // red for poor performance
};

export const formatScore = (homeGoals: number, awayGoals: number): string => {
  return `${homeGoals} - ${awayGoals}`;
};

export const determineWinner = (
  homeTeamId: string,
  awayTeamId: string,
  homeGoals: number,
  awayGoals: number
): "home" | "away" | "draw" => {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
};

export const sortByDate = <T extends { date: string }>(data: T[]): T[] => {
  return [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const getColorSchemeForChart = (
  colorScheme: string, 
  type: "primary" | "secondary" | "tertiary" = "primary"
) => {
  switch (colorScheme) {
    case "blue":
      return type === "primary" ? "#0ea5e9" : 
             type === "secondary" ? "#38bdf8" : "#7dd3fc";
    case "green":
      return type === "primary" ? "#22c55e" : 
             type === "secondary" ? "#4ade80" : "#86efac";
    case "purple":
      return type === "primary" ? "#8b5cf6" : 
             type === "secondary" ? "#a78bfa" : "#c4b5fd";
    default:
      // Default colors
      return type === "primary" ? "#3b82f6" : 
             type === "secondary" ? "#f87171" : "#facc15";
  }
};

export const getChartConfig = (preferences: {
  chartType: string;
  colorScheme: string;
  showLegend: boolean;
  showGrid: boolean;
}) => {
  return {
    type: preferences.chartType,
    colors: {
      primary: getColorSchemeForChart(preferences.colorScheme, "primary"),
      secondary: getColorSchemeForChart(preferences.colorScheme, "secondary"),
      tertiary: getColorSchemeForChart(preferences.colorScheme, "tertiary"),
    },
    legend: preferences.showLegend,
    grid: preferences.showGrid,
  };
};
