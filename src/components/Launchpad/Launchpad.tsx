import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, BarChart3, FolderKanban, Calendar, FileText, Wallet, Users, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LaunchpadProps {
  onOpenSection: (section: string) => void;
}

type Tile = { key?: string; href?: string; label: string; icon: any; color: string };

const tiles: Tile[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { key: 'projects', label: 'Projets', icon: FolderKanban, color: 'from-violet-500 to-fuchsia-500' },
  { key: 'planning', label: 'Planning', icon: Calendar, color: 'from-emerald-500 to-teal-500' },
  { key: 'documents', label: 'Documents', icon: FileText, color: 'from-amber-500 to-orange-500' },
  { key: 'finances', label: 'Finances', icon: Wallet, color: 'from-indigo-500 to-purple-500' },
  { key: 'team', label: 'Équipe', icon: Users, color: 'from-rose-500 to-pink-500' },
  { key: 'purchase-orders', label: 'Bons de commande', icon: FileText, color: 'from-sky-500 to-blue-500' },
  { key: 'settings', label: 'Paramètres', icon: SettingsIcon, color: 'from-gray-700 to-gray-900' },
  // Lien direct vers l'ancre sécurité du module Paramètres
  { href: '/app/settings#security', label: 'Sécurité (MFA)', icon: SettingsIcon, color: 'from-green-600 to-emerald-600' },
];

const Launchpad: React.FC<LaunchpadProps> = ({ onOpenSection }) => {
  return (
    <div className="p-6">
      <div className="glass-card p-6 mb-6 flex items-center gap-3">
        <LayoutGrid className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Accès rapide</h1>
          <p className="text-sm text-gray-600">Ouvrez rapidement un module de l'application</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tiles.map((t, idx) => (
          <motion.div
            key={t.key || t.href || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {t.href ? (
              <Link
                to={t.href}
                className="group block relative overflow-hidden rounded-2xl p-5 bg-white/70 backdrop-blur-sm border border-white/40 shadow hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white shadow`}>
                    {React.createElement(t.icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{t.label}</p>
                    <p className="text-xs text-gray-500">Aller à {t.label.toLowerCase()}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <button
                onClick={() => t.key && onOpenSection(t.key)}
                className="group relative overflow-hidden rounded-2xl p-5 bg-white/70 backdrop-blur-sm border border-white/40 shadow hover:-translate-y-1 hover:shadow-xl transition-all text-left w-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white shadow`}>
                    {React.createElement(t.icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{t.label}</p>
                    <p className="text-xs text-gray-500">Ouvrir {t.label.toLowerCase()}</p>
                  </div>
                </div>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 glass-card p-4 text-sm text-gray-600">
        <p>Astuce: utilisez Ctrl+K pour la « commande rapide » et tapez le nom d'un module.</p>
      </div>
    </div>
  );
};

export default Launchpad;
