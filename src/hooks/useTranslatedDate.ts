
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS, pt, es } from 'date-fns/locale';

/**
 * A hook for formatting dates according to the current locale
 */
export const useTranslatedDate = () => {
  const { i18n } = useTranslation();

  const getLocale = () => {
    switch (i18n.language) {
      case 'pt':
        return pt;
      case 'es':
        return es;
      case 'en':
      default:
        return enUS;
    }
  };

  const formatDate = (date: Date | string | number, formatString = 'PPP') => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, formatString, { locale: getLocale() });
  };

  const formatRelativeTime = (date: Date | string | number) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return formatDistanceToNow(dateObj, { locale: getLocale(), addSuffix: true });
  };

  return {
    formatDate,
    formatRelativeTime
  };
};
