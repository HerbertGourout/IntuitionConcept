import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const RealTimeChartWidget: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([
    { label: 'Lun', value: 75, color: 'bg-blue-500' },
    { label: 'Mar', value: 85, color: 'bg-green-500' },
    { label: 'Mer', value: 65, color: 'bg-yellow-500' },
    { label: 'Jeu', value: 90, color: 'bg-purple-500' },
    { label: 'Ven', value: 80, color: 'bg-orange-500' },
    { label: 'Sam', value: 70, color: 'bg-red-500' },
    { label: 'Dim', value: 60, color: 'bg-indigo-500' }
  ]);

  const [isUpdating, setIsUpdating] = useState(false);

  // Simulation de données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setData(prevData => 
        prevData.map(item => ({
          ...item,
          value: Math.max(20, Math.min(100, item.value + (Math.random() - 0.5) * 20))
        }))
      );
      
      setTimeout(() => setIsUpdating(false), 500);
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...data.map(d => d.value));
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Productivité Hebdomadaire</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Progression des équipes</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <div className="flex items-end justify-between h-40 space-x-2">
          {data.map((item, index) => (
            <div key={item.label} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col justify-end h-32 mb-2">
                <div
                  className={`${item.color} rounded-t-md transition-all duration-1000 ease-out relative group cursor-pointer hover:opacity-80`}
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(item.value)}%
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(avgValue)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Moyenne</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(maxValue)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Maximum</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChartWidget;
