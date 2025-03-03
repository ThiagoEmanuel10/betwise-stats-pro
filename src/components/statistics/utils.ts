
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

