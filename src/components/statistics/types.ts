
export type TimeFilter = "7days" | "30days" | "90days" | "all";

export type PredictionData = {
  date: string;
  correct: number;
  incorrect: number;
  total: number;
  rate: number;
};
