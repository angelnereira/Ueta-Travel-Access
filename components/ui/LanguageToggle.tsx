'use client';

import { useLanguageStore } from '@/lib/stores/language-store';
import { t } from '@/lib/i18n';
import Tooltip from './Tooltip';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <Tooltip text={t('tooltip.language', language)}>
      <button
        onClick={toggleLanguage}
        className="px-3 py-1.5 rounded-lg font-medium text-sm
          bg-gray-100 dark:bg-gray-800
          text-gray-700 dark:text-gray-300
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition-colors"
        aria-label={t('tooltip.language', language)}
      >
        {language.toUpperCase()}
      </button>
    </Tooltip>
  );
}
