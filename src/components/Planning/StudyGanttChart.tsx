import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface StudyTask {
  id: string;
  quoteId: string;
  quoteTitle: string;
  engineerName: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

const StudyGanttChart: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  useEffect(() => {
    loadStudies();
  }, []);

  const loadStudies = async () => {
    try {
      const q = query(
        collection(db, 'structuredQuotes'),
        where('structuralStudy.status', 'in', ['pending', 'in_progress'])
      );

      const snapshot = await getDocs(q);
      const studyTasks: StudyTask[] = [];

      snapshot.forEach(doc => {
        const quote = doc.data();
        const study = quote.structuralStudy;

        if (study && study.startDate) {
          studyTasks.push({
            id: doc.id,
            quoteId: doc.id,
            quoteTitle: quote.title || 'Sans titre',
            engineerName: study.engineerName || 'Non assigné',
            startDate: new Date(study.startDate),
            endDate: study.completionDate 
              ? new Date(study.completionDate)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: study.status,
            progress: study.status === 'completed' ? 100 : 
                     study.status === 'in_progress' ? 50 : 0
          });
        }
      });

      setTasks(studyTasks);
    } catch (error) {
      console.error('Erreur chargement études:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskColor = (status: StudyTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysInView = () => {
    return viewMode === 'week' ? 7 : 30;
  };

  const getDateRange = () => {
    const today = new Date();
    const days = getDaysInView();
    const dates: Date[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const calculateTaskPosition = (task: StudyTask, dateRange: Date[]) => {
    const startDay = dateRange.findIndex(d => 
      d.toDateString() === task.startDate.toDateString()
    );
    const endDay = dateRange.findIndex(d => 
      d.toDateString() === task.endDate.toDateString()
    );

    if (startDay === -1 || endDay === -1) return null;

    return {
      left: `${(startDay / dateRange.length) * 100}%`,
      width: `${((endDay - startDay + 1) / dateRange.length) * 100}%`
    };
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const dateRange = getDateRange();

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Planning des Études</h3>
            <p className="text-sm text-gray-600">{tasks.length} études en cours</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'week'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto">
        {/* Timeline header */}
        <div className="flex border-b border-gray-300 mb-4 pb-2">
          <div className="w-48 flex-shrink-0 font-semibold text-gray-700">
            Projet
          </div>
          <div className="flex-1 flex">
            {dateRange.map((date, index) => (
              <div
                key={index}
                className="flex-1 text-center text-xs text-gray-600"
              >
                <div className="font-semibold">
                  {date.toLocaleDateString('fr-FR', { day: 'numeric' })}
                </div>
                <div className="text-gray-500">
                  {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune étude en cours</p>
            </div>
          ) : (
            tasks.map(task => {
              const position = calculateTaskPosition(task, dateRange);

              return (
                <div key={task.id} className="flex items-center group">
                  {/* Task info */}
                  <div className="w-48 flex-shrink-0 pr-4">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {task.quoteTitle}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="truncate">{task.engineerName}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative h-10">
                    {/* Grid background */}
                    <div className="absolute inset-0 flex">
                      {dateRange.map((_, index) => (
                        <div
                          key={index}
                          className="flex-1 border-r border-gray-200"
                        />
                      ))}
                    </div>

                    {/* Task bar */}
                    {position && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-6 rounded-lg shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                        style={{
                          left: position.left,
                          width: position.width
                        }}
                      >
                        <div className={`h-full rounded-lg ${getTaskColor(task.status)} opacity-80 group-hover:opacity-100 transition-opacity`}>
                          <div
                            className="h-full bg-white/30 rounded-lg"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                          {task.progress}%
                        </div>
                      </div>
                    )}

                    {/* Overdue indicator */}
                    {task.endDate < new Date() && task.status !== 'completed' && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-gray-700">Prévue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-gray-700">En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-700">Complétée</span>
        </div>
      </div>
    </div>
  );
};

export default StudyGanttChart;
