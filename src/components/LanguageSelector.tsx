
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSelectorProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LanguageSelector({ variant = 'outline', size = 'default' }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const languages = [
    { code: 'en', name: t('languages.en') },
    { code: 'pt', name: t('languages.pt') },
    { code: 'es', name: t('languages.es') }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Globe className="h-4 w-4 mr-2" />
          {size !== 'icon' && languages.find(lang => lang.code === currentLanguage)?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center justify-between"
          >
            {language.name}
            {currentLanguage === language.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
