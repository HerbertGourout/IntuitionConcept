import React, { useState, useEffect } from 'react';
import { MapPin, Clock, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';
import { db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { TeamService } from '../../../services/teamService';
import ProgressBar from '../../UI/ProgressBar';

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

  // Fallback: convertir un identifiant en nom lisible (email → Nom Prénom)
  const prettifyIdentifier = (value: string): string => {
    if (!value) return value;
    if (value.includes('@')) {
      const local = value.split('@')[0];
      const parts = local.split(/[._-]+/).filter(Boolean);
      if (parts.length > 0) {
        return parts
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');
      }
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  useEffect(() => {
    if (!currentProject) return;

    const run = async () => {
      // Récupérer les membres de l'équipe depuis les tâches assignées
      const assignedMembers = new Set<string>();
      const allTasks = (currentProject.phases || []).flatMap(phase => phase.tasks || []);
      allTasks.forEach(task => {
        (task.assignedTo || []).forEach(member => assignedMembers.add(member));
      });

      const totalMembers = assignedMembers.size;

      // Tenter de résoudre les noms via la collection 'users' (doc.id = uid)
      const ids = Array.from(assignedMembers);
      const nameById = new Map<string, { name: string; role?: string }>();
      const nameByEmail = new Map<string, { name: string; role?: string }>(); // key = email lower
      const teamNameById = new Map<string, { name: string; role?: string; email?: string }>();
      const teamNameByEmail = new Map<string, { name: string; role?: string }>(); // key = email lower
      const teamNameByDisplay = new Map<string, { name: string; role?: string }>(); // key = display lower

      // Helper de chunk pour 'in' (limite 10)
      const chunk = <T,>(arr: T[], size: number) => {
        const res: T[][] = [];
        for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
        return res;
      };

      try {
        // 1) Charger les membres internes (teamMembers) pour mapping id/email/nom
        const teamMembers = await TeamService.getAllMembers();
        teamMembers.forEach(tm => {
          const display = (tm.name && tm.name.trim()) ? tm.name : (tm.email || tm.id);
          teamNameById.set(tm.id, { name: display, role: tm.role, email: tm.email });
          if (tm.email) teamNameByEmail.set(tm.email.toLowerCase(), { name: display, role: tm.role });
          if (tm.name) teamNameByDisplay.set(tm.name.toLowerCase(), { name: display, role: tm.role });
        });

        // 2) Résoudre via users par UID (doc id)
        const usersRef = collection(db, 'users');
        for (const batch of chunk(ids, 10)) {
          const qUsers = query(usersRef, where('__name__', 'in', batch));
          const snap = await getDocs(qUsers);
          snap.forEach(d => {
            const data = d.data() as { displayName?: string; email?: string; role?: string };
            const display = (data.displayName && data.displayName.trim())
              ? data.displayName
              : (data.email || d.id);
            nameById.set(d.id, { name: display, role: data.role });
            if (data.email) nameByEmail.set(data.email.toLowerCase(), { name: display, role: data.role });
          });
        }

        // 3) Résoudre via users par email (pour les assignations stockées en email)
        const emailCandidates = ids.filter(v => v.includes('@')).map(v => v.toLowerCase());
        for (const batch of chunk(emailCandidates, 10)) {
          const qByEmail = query(usersRef, where('email', 'in', batch));
          const snap = await getDocs(qByEmail);
          snap.forEach(d => {
            const data = d.data() as { displayName?: string; email?: string; role?: string };
            const display = (data.displayName && data.displayName.trim())
              ? data.displayName
              : (data.email || d.id);
            if (data.email) nameByEmail.set(data.email.toLowerCase(), { name: display, role: data.role });
          });
        }
      } catch {
        // Fallbacks ci-dessous si des infos manquent
      }

      // Données réelles basées sur les membres assignés aux tâches
      const membersList: TeamMember[] = ids.map((memberId) => {
        // Calculer les vraies statistiques pour chaque membre
        const memberTasks = allTasks.filter(task => (task.assignedTo || []).includes(memberId));
        const completedTasks = memberTasks.filter(task => task.status === 'done').length;
        const inProgressTasks = memberTasks.filter(task => task.status === 'in_progress').length;

        // Stratégie de résolution multi-sources
        let displayName = memberId;
        let role: string | undefined;

        const directUser = nameById.get(memberId);
        if (directUser) {
          displayName = directUser.name;
          role = directUser.role;
        } else {
          const lower = memberId.toLowerCase();
          // Si c'est un email
          if (memberId.includes('@')) {
            const byEmail = nameByEmail.get(lower) || teamNameByEmail.get(lower);
            if (byEmail) {
              displayName = byEmail.name;
              role = byEmail.role;
            }
          }
          // Essayer teamMembers par id
          if (displayName === memberId) {
            const tById = teamNameById.get(memberId);
            if (tById) {
              displayName = tById.name;
              role = tById.role;
            }
          }
          // Essayer teamMembers par nom exact
          if (displayName === memberId) {
            const tByName = teamNameByDisplay.get(lower);
            if (tByName) {
              displayName = tByName.name;
              role = tByName.role;
            }
          }
          // Dernier fallback: si c'est un email, le rendre lisible
          if (displayName === memberId && memberId.includes('@')) {
            displayName = prettifyIdentifier(memberId);
          }
        }

        return {
          id: memberId,
          name: displayName,
          role: role || "Membre d'équipe",
          isOnSite: inProgressTasks > 0,
          hoursToday: inProgressTasks * 2,
          tasksCompleted: completedTasks,
          efficiency: memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0,
          skills: [],
          lastActivity: new Date().toISOString()
        };
      });

      // Debug: identifier resolution summary
      const unresolved = membersList.filter(m => m.name === m.id).map(m => m.id);
      if (unresolved.length > 0) {
        console.warn('[TeamProductivity] Identifiants non résolus (affichés tels quels):', unresolved.slice(0, 10), unresolved.length > 10 ? `(+${unresolved.length - 10} autres)` : '');
      }
      const sample = membersList.slice(0, 5).map(m => ({ id: m.id, name: m.name }));
      console.log('[TeamProductivity] échantillon mapping id→name:', sample);

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
      const safetyIncidents = 0;

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
    };

    run();
  }, [currentProject]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 dark:text-green-400';
    if (efficiency >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // (icône de rôle non utilisée pour l'instant)

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
        {(() => {
          const tone: 'green' | 'orange' | 'red' = teamData.averageEfficiency >= 90 ? 'green' : teamData.averageEfficiency >= 75 ? 'orange' : 'red';
          return <ProgressBar value={teamData.averageEfficiency} tone={tone} />;
        })()}
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
        {(() => {
          const tone: 'green' | 'orange' | 'red' = teamData.attendanceRate > 80 ? 'green' : teamData.attendanceRate > 60 ? 'orange' : 'red';
          return <ProgressBar value={teamData.attendanceRate} tone={tone} />;
        })()}
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
