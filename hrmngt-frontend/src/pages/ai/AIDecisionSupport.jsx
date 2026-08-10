import { Brain } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useLanguage } from '../../context/LanguageContext';

export default function AIDecisionSupport() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('aiDecisionSupport.title')}</h1>
            <p className="text-[14px] text-gray-500 mt-1">{t('aiDecisionSupport.subtitle')}</p>
          </div>
        </div>
      </div>

      <Card className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <Brain className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{t('aiDecisionSupport.title')}</h2>
        <p className="text-sm text-gray-400 mt-1">{t('aiDecisionSupport.underDevelopment')}</p>
      </Card>
    </div>
  );
}
