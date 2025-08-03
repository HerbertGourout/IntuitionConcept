import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, TrendingUp, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  isOnSite: boolean;
  hoursToday: number;
  tasksCompleted: number;
  efficiency: number;
  skills: string[];
  lastActivity: string;
}

interface TeamData {
  totalMembers: number;
  onSiteMembers: number;
  totalHoursToday: number;
  averageEfficiency: number;
  tasksCompletedToday: number;
  safetyIncidents: number;
  topPerformers: TeamMember[];
  skillsAvailable: string[];
  attendanceRate: number;
}

const TeamProductivityWidget: React.FC = () => {
  const { currentProject } = useProjects();
  const [teamData, setTeamData] = useState<TeamData>({
    totalMembers: 0,
    onSiteMembers: 0,
    totalHoursToday: 0,
    averageEfficiency: 0,
    tasksCompletedToday: 0,
    safetyIncidents: 0,
    topPerformers: [],
    skillsAvailable: [],
    attendanceRate: 0
  });

  useEffect(() => {
    if (!currentProject) return;

    // Récupérer les membres de l'équipe depuis les tâches assignées
    const assignedMembers = new Set<string>();
    const allTasks = (currentProject.phases || []).flatMap(phase => phase.tasks || []);
    
    allTasks.forEach(task => {
      (task.assignedTo || []).forEach(member => assignedMembers.add(member));
    });

    const totalMembers = assignedMembers.size;
    
    // Données réelles basées sur les membres assignés aux tâches
    const membersList: TeamMember[] = Array.from(assignedMembers).map((memberName, index) => {
      // Calculer les vraies statistiques pour chaque membre
      const memberTasks = allTasks.filter(task => 
        (task.assignedTo || []).includes(memberName)
      );
      const completedTasks = memberTasks.filter(task => task.status === 'done').length;
      const inProgressTasks = memberTasks.filter(task => task.status === 'in_progress').length;
      
      return {
        id: `member-${index}`,
        name: memberName,
        role: 'Membre d\'équipe', // Rôle générique car pas de données spécifiques
        isOnSite: inProgressTasks > 0, // Considéré sur site s'il a des tâches en cours
        hoursToday: inProgressTasks * 2, // Estimation: 2h par tâche en cours
        tasksCompleted: completedTasks,
        efficiency: memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0,
        skills: [], // Pas de données de compétences disponibles
        lastActivity: new Date().toISOString() // Activité récente si des tâches assignées
      };
    });

    const onSiteMembers = membersList.filter(m => m.isOnSite).length;
    const totalHoursToday = membersList.reduce((sum, m) => sum + m.hoursToday, 0);
    const averageEfficiency = membersList.length > 0 
      ? Math.round(membersList.reduce((sum, m) => sum + m.efficiency, 0) / membersList.length)
      : 0;
    const tasksCompletedToday = membersList.reduce((sum, m) => sum + m.tasksCompleted, 0);
    
    // Top performers (3 meilleurs)
    const topPerformers = membersList
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);

    // Compétences disponibles
    const skillsAvailable = [...new Set(membersList.flatMap(m => m.skills))];
    
    const attendanceRate = totalMembers > 0 ? Math.round((onSiteMembers / totalMembers) * 100) : 0;
    const safetyIncidents = 0; // Pas de système de suivi des incidents implémenté

    setTeamData({
      totalMembers,
      onSiteMembers,
      totalHoursToday,
      averageEfficiency,
      tasksCompletedToday,
      safetyIncidents,
      topPerformers,
      skillsAvailable,
      attendanceRate
    });
  }, [currentProject]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 dark:text-green-400';
    if (efficiency >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRoleIcon = (role: string) => {
    return <Users className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Équipe & Productivité</h3>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {teamData.onSiteMembers}/{teamData.totalMembers} sur site
          </span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Heures aujourd'hui</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {teamData.totalHoursToday}h
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tâches terminées</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {teamData.tasksCompletedToday}
          </div>
        </div>
      </div>

      {/* Efficacité moyenne */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Efficacité moyenne</span>
          <span className={`font-medium ${getEfficiencyColor(teamData.averageEfficiency)}`}>
            {teamData.averageEfficiency}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              teamData.averageEfficiency >= 90 ? 'bg-green-500' : 
              teamData.averageEfficiency >= 75 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${teamData.averageEfficiency}%` }}
          ></div>
        </div>
      </div>

      {/* Taux de présence */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Taux de présence</span>
          <span className={`font-medium ${
            teamData.attendanceRate > 80 ? 'text-green-600' : 
            teamData.attendanceRate > 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {teamData.attendanceRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              teamData.attendanceRate > 80 ? 'bg-green-500' : 
              teamData.attendanceRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${teamData.attendanceRate}%` }}
          ></div>
        </div>
      </div>

      {/* Top performers */}
      {teamData.topPerformers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            Top performers
          </h4>
          <div className="space-y-2">
            {teamData.topPerformers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between py-2 px-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    'bg-orange-400 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {member.role}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${getEfficiencyColor(member.efficiency)}`}>
                    {member.efficiency}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {member.tasksCompleted} tâches
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compétences disponibles */}
      {teamData.skillsAvailable.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Compétences disponibles</h4>
          <div className="flex flex-wrap gap-2">
            {teamData.skillsAvailable.slice(0, 4).map((skill) => (
              <span key={skill} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Incidents de sécurité */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {teamData.safetyIncidents === 0 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">Incidents sécurité</span>
          </div>
          <span className={`text-sm font-bold ${
            teamData.safetyIncidents === 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {teamData.safetyIncidents}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamProductivityWidget;
