import React from 'react';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  project: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const RecentActivity: React.FC = () => {
  // Pas de données de démonstration - utiliser les vraies données du contexte
  const activities: Activity[] = [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Aucune activité récente</p>
          <p className="text-gray-400 text-xs mt-1">Les activités de vos projets apparaîtront ici</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${activity.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600">{activity.project}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="w-full mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium">
            Voir toute l'activité
          </button>
        </>
      )}
    </div>
  );
};

export default RecentActivity;