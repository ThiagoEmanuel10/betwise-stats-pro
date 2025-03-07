
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const date = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('navigation.dashboard')}</h1>
        <p className="text-muted-foreground">{date}</p>
      </div>
      <div className="mt-4 md:mt-0 space-x-3 flex items-center">
        <LanguageSelector />
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
        >
          {t('common.back')}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.print()}
        >
          {t('common.generateReport', 'Generate Report')}
        </Button>
        <Button onClick={() => navigate("/")}>
          {t('navigation.home')}
        </Button>
      </div>
    </div>
  );
};
