import React from 'react';

const ModernFooterCompact: React.FC = () => {
  return (
    <footer className="border-t border-gray-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-sm">
        <div className="text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} IntuitionConcept — SaaS BTP
        </div>
        <div className="flex items-center gap-4">
          <a href="/app/settings" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">Paramètres</a>
          <a href="/support" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">Support</a>
          <a href="/pricing" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">Tarification</a>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooterCompact;
