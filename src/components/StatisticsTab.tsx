interface StatisticsTabProps {
  league: string;
}

export const StatisticsTab = ({ league }: StatisticsTabProps) => {
  return (
    <div>
      Statistics for {league}
    </div>
  );
};
