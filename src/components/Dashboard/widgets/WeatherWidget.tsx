import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  humidity: number;
  windSpeed: number;
  location: string;
}

const WeatherWidget: React.FC<{ location?: string }> = ({ location = "Chantier" }) => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    condition: 'sunny',
    humidity: 65,
    windSpeed: 12,
    location
  });

  // Simulation de données météo changeantes
  useEffect(() => {
    const interval = setInterval(() => {
      const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'windy'];
      setWeather(prev => ({
        ...prev,
        temperature: Math.round(25 + Math.random() * 10),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.round(50 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 20)
      }));
    }, 30000); // Change toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'windy': return <Wind className="w-8 h-8 text-gray-600" />;
      default: return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getConditionText = () => {
    switch (weather.condition) {
      case 'sunny': return 'Ensoleillé';
      case 'cloudy': return 'Nuageux';
      case 'rainy': return 'Pluvieux';
      case 'windy': return 'Venteux';
      default: return 'Ensoleillé';
    }
  };

  const getWorkCondition = () => {
    if (weather.condition === 'rainy') return { text: 'Conditions difficiles', color: 'text-red-600' };
    if (weather.condition === 'windy' && weather.windSpeed > 15) return { text: 'Attention au vent', color: 'text-orange-600' };
    return { text: 'Bonnes conditions', color: 'text-green-600' };
  };

  const workCondition = getWorkCondition();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Météo Chantier</h3>
        {getWeatherIcon()}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{weather.temperature}°C</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{getConditionText()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-300">Humidité: {weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">Vent: {weather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="pt-3 border-t border-blue-200 dark:border-gray-600">
          <p className={`text-sm font-medium ${workCondition.color}`}>
            🏗️ {workCondition.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
