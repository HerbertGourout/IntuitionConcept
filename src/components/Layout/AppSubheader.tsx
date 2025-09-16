import React from 'react';
import { ArrowLeft, Sparkles, Settings } from 'lucide-react';

interface AppSubheaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const AppSubheader: React.FC<AppSubheaderProps> = ({ title, subtitle, onBack }) => {
  return (
    <div className="sticky top-0 z-40">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-slate-900/50 border-b border-gray-200/60 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition" title="Retour">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{title}</h2>
            </div>
            {subtitle && (
              <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/app/settings"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              title="Paramètres"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSubheader;
