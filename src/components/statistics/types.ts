
export type TimeFilter = "7days" | "30days" | "90days" | "all";

export type PredictionData = {
  date: string;
  correct: number;
  incorrect: number;
  total: number;
  rate: number;
};

export type TeamPerformance = {
  teamId: string;
  teamName: string;
  homeWins: number;
  homeLosses: number;
  homeDraws: number;
  awayWins: number;
  awayLosses: number;
  awayDraws: number;
  totalGoalsScored: number;
  totalGoalsConceded: number;
};

export type HeadToHeadRecord = {
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  lastMatches: Array<{
    date: string;
    score: string;
    winner: "team1" | "team2" | "draw";
  }>;
};

export type ResultTrend = {
  date: string;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalMatches: number;
};

export type ChartType = "line" | "bar" | "area";

export type ColorScheme = "default" | "blue" | "green" | "purple";

export type DataVisualizationPreferences = {
  chartType: ChartType;
  colorScheme: ColorScheme;
  showLegend: boolean;
  showGrid: boolean;
};
