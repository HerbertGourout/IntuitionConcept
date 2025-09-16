import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { FolderOpen, Euro, AlertTriangle, Clock, AlertCircle, Users, Calendar, Target, Zap } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';
import ProgressBar from '../UI/ProgressBar';

// Import des widgets essentiels
import ProjectsOverviewWidget from './widgets/ProjectsOverviewWidget';
import TeamProductivityWidget from './widgets/TeamProductivityWidget';
import BudgetAlertsWidget from './widgets/BudgetAlertsWidget';
import ActivityTimelineWidget from './widgets/ActivityTimelineWidget';
import RealTimeChartWidget from './widgets/RealTimeChartWidget';
import CircularProgressWidget from './widgets/CircularProgressWidget';

// Import des widgets avancés
import EquipmentMaintenanceWidget from './widgets/EquipmentMaintenanceWidget';
import EquipmentScannerWidget from './widgets/EquipmentScannerWidget';
import WeatherWidget from './widgets/WeatherWidget';
import OfflineStatusWidget from './widgets/OfflineStatusWidget';

// Import des widgets IA
import HybridAIMonitoringWidget from './HybridAIMonitoringWidget';
import VocalCopilot from '../AI/VocalCopilot';
import HybridAITestPanel from '../AI/HybridAITestPanel';
import AnomalyDetectionDashboard from '../AI/AnomalyDetectionDashboard';

// Import des widgets d'automatisation
import { AutomationDashboard } from '../Automation/AutomationDashboard';
import { WorkflowManager } from '../Automation/WorkflowManager';

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentProject, projects } = useProjects();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const defaultPrefs: {
    showProjectsOverview: boolean;
    showTeamProductivity: boolean;
    showBudgetAlerts: boolean;
    showActivityTimeline: boolean;
    showRealTimeChart: boolean;
    showCircularProgress: boolean;
    density: 'normal' | 'compact';
    firstRowOrder: Array<'projectsOverview' | 'teamProductivity' | 'budgetAlerts'>;
    sizeProjectsOverview: 'small' | 'medium' | 'large';
    sizeTeamProductivity: 'small' | 'medium' | 'large';
    sizeBudgetAlerts: 'small' | 'medium' | 'large';
    secondRowOrder: Array<'activityTimeline' | 'realTimeChart'>;
    sizeActivityTimeline: 'small' | 'medium' | 'large';
    sizeRealTimeChart: 'small' | 'medium' | 'large';
    thirdRowOrder: Array<'circularProgress' | 'quickActions'>;
    sizeCircularProgress: 'small' | 'medium' | 'large';
    sizeQuickActions: 'small' | 'medium' | 'large';
  } = {
    showProjectsOverview: true,
    showTeamProductivity: true,
    showBudgetAlerts: true,
    showActivityTimeline: true,
    showRealTimeChart: true,
    showCircularProgress: true,
    density: 'compact',
    firstRowOrder: ['projectsOverview', 'teamProductivity', 'budgetAlerts'],
    sizeProjectsOverview: 'medium',
    sizeTeamProductivity: 'small',
    sizeBudgetAlerts: 'small',
    secondRowOrder: ['activityTimeline', 'realTimeChart'],
    sizeActivityTimeline: 'medium',
    sizeRealTimeChart: 'medium',
    thirdRowOrder: ['circularProgress', 'quickActions'],
    sizeCircularProgress: 'medium',
    sizeQuickActions: 'large',
  };
  const [prefs, setPrefs] = useState<typeof defaultPrefs>(defaultPrefs);

  const moveFirstRow = (key: 'projectsOverview' | 'teamProductivity' | 'budgetAlerts', direction: 'up' | 'down') => {
    setPrefs((p) => {
      const order = [...p.firstRowOrder];
      const idx = order.indexOf(key);
      if (idx === -1) return p;
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= order.length) return p;
      [order[idx], order[swapWith]] = [order[swapWith], order[idx]];
      return { ...p, firstRowOrder: order };
    });
  };

  // Drag & Drop pour la deuxième rangée
  const [dragSecondKey, setDragSecondKey] = useState<null | 'activityTimeline' | 'realTimeChart'>(null);
  const [dragOverSecond, setDragOverSecond] = useState<null | 'activityTimeline' | 'realTimeChart'>(null);
  const onSecondDragStart = (key: 'activityTimeline' | 'realTimeChart') => (e: React.DragEvent) => {
    setDragSecondKey(key);
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onSecondDrop = (overKey: 'activityTimeline' | 'realTimeChart') => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceKey = (e.dataTransfer.getData('text/plain') as typeof dragSecondKey) || dragSecondKey;
    if (!sourceKey || sourceKey === overKey) return;
    setPrefs(p => {
      const order = [...p.secondRowOrder];
      const from = order.indexOf(sourceKey);
      const to = order.indexOf(overKey);
      if (from === -1 || to === -1) return p;
      order.splice(to, 0, order.splice(from, 1)[0]);
      return { ...p, secondRowOrder: order };
    });
    setDragSecondKey(null);
    setDragOverSecond(null);
  };

  // Drag & Drop pour la troisième rangée
  const [dragThirdKey, setDragThirdKey] = useState<null | 'circularProgress' | 'quickActions'>(null);
  const [dragOverThird, setDragOverThird] = useState<null | 'circularProgress' | 'quickActions'>(null);
  const onThirdDragStart = (key: 'circularProgress' | 'quickActions') => (e: React.DragEvent) => {
    setDragThirdKey(key);
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onThirdDrop = (overKey: 'circularProgress' | 'quickActions') => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceKey = (e.dataTransfer.getData('text/plain') as typeof dragThirdKey) || dragThirdKey;
    if (!sourceKey || sourceKey === overKey) return;
    setPrefs(p => {
      const order = [...p.thirdRowOrder];
      const from = order.indexOf(sourceKey);
      const to = order.indexOf(overKey);
      if (from === -1 || to === -1) return p;
      order.splice(to, 0, order.splice(from, 1)[0]);
      return { ...p, thirdRowOrder: order };
    });
    setDragThirdKey(null);
    setDragOverThird(null);
  };

  // Drag & Drop (HTML5) pour la première rangée
  const [dragKey, setDragKey] = useState<null | 'projectsOverview' | 'teamProductivity' | 'budgetAlerts'>(null);
  const [dragOverFirst, setDragOverFirst] = useState<null | 'projectsOverview' | 'teamProductivity' | 'budgetAlerts'>(null);
  const onDragStart = (key: 'projectsOverview' | 'teamProductivity' | 'budgetAlerts') => (e: React.DragEvent) => {
    setDragKey(key);
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (overKey: 'projectsOverview' | 'teamProductivity' | 'budgetAlerts') => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceKey = (e.dataTransfer.getData('text/plain') as typeof dragKey) || dragKey;
    if (!sourceKey || sourceKey === overKey) return;
    setPrefs(p => {
      const order = [...p.firstRowOrder];
      const from = order.indexOf(sourceKey);
      const to = order.indexOf(overKey);
      if (from === -1 || to === -1) return p;
      order.splice(to, 0, order.splice(from, 1)[0]);
      return { ...p, firstRowOrder: order };
    });
    setDragKey(null);
    setDragOverFirst(null);
  };

  const spanClassFor = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'large':
        return 'xl:col-span-3 lg:col-span-2';
      case 'medium':
        return 'xl:col-span-2 lg:col-span-2';
      default:
        return 'xl:col-span-1 lg:col-span-1';
    }
  };

  // Charger les préférences depuis Firestore lorsque l'utilisateur est disponible
  useEffect(() => {
    const fetchPrefs = async () => {
      if (!user) return;
      try {
        const ref = doc(db, 'userPreferences', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as { dashboardWidgetPrefs?: typeof prefs };
          if (data.dashboardWidgetPrefs) {
            setPrefs(prev => ({ ...prev, ...data.dashboardWidgetPrefs }));
          }
        }
      } catch (e) {
        console.warn('Impossible de charger les préférences Firestore:', e);
      }
    };
    fetchPrefs();
  }, [user]);

  // Sauvegarder dans Firestore quand prefs changent et utilisateur connecté (debounce)
  const saveDebounce = useRef<number | null>(null);
  useEffect(() => {
    if (!user) return;
    if (saveDebounce.current) {
      clearTimeout(saveDebounce.current);
    }
    saveDebounce.current = window.setTimeout(async () => {
      try {
        const ref = doc(db, 'userPreferences', user.uid);
        await setDoc(ref, { dashboardWidgetPrefs: prefs }, { merge: true });
      } catch (e) {
        console.warn('Impossible de sauvegarder les préférences Firestore:', e);
      }
    }, 500);
    return () => {
      if (saveDebounce.current) clearTimeout(saveDebounce.current);
    };
  }, [user, prefs]);
  
  // Debug logs pour vérifier les changements de projet
  console.log('🔍 Dashboard - Projet actuel:', currentProject?.name || 'Aucun');
  console.log('🔍 Dashboard - ID du projet:', currentProject?.id || 'Aucun');
  console.log('🔍 Dashboard - Nombre de projets disponibles:', projects.length);
  
  // Vérifie que le projet sélectionné existe vraiment dans la liste
  const validProject = projects.find(p => p.id === currentProject?.id);
  // Convertir le projet actuel au format attendu par les composants enfants
  const currentProjectData = useMemo(() => {
    if (!validProject) return null;
    
    // Calculer le pourcentage d'avancement global basé sur les tâches
    const allTasks = (validProject.phases || []).flatMap(phase => (phase.tasks || []));
    const completedTasks = allTasks.filter(task => task && task.status === 'done').length;
    const progress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
    
    return {
      ...validProject,
      progress,
      completedTasks
    };
  }, [validProject]);

  // Calcul des statistiques basées sur le projet sélectionné
  const stats = useMemo(() => {
    if (!currentProjectData) {
      return {
        activeTasks: 0,
        availableEquipment: 0,
        equipmentInUse: 0,
        equipmentMaintenance: 0,
        totalEquipment: 0,
        teamMembers: 0,
        teamEfficiency: 0,
        budget: 0,
        budgetSpent: 0,
        budgetRemaining: 0,
        budgetPercentage: 0,
        delayedTasks: 0
      };
    }

    // Calculer le nombre de tâches actives
    const activeTasks = (currentProjectData.phases || []).flatMap(phase => 
      (phase.tasks || []).filter(task => task && task.status === 'in_progress')
    ).length;
    
    const delayedTasks = (currentProjectData.phases || []).flatMap(phase => 
      (phase.tasks || []).filter(task => 
        task && task.status !== 'done' && 
        task.dueDate && new Date(task.dueDate) < new Date()
      )
    ).length;
    
    const budget = currentProjectData.budget || 0;
    // Calcul dynamique du budget utilisé
    const budgetSpent = (currentProjectData.phases || []).reduce(
      (sum, phase) => sum + (phase.tasks || []).reduce((tSum, t) => tSum + (t.spent || 0), 0),
      0
    );
    const budgetRemaining = Math.max(0, budget - budgetSpent);
    const budgetPercentage = budget > 0 ? Math.round((budgetSpent / budget) * 100) : 0;
    
    // Statistiques d'équipement réelles
    const equipment = currentProjectData.equipment || [];
    const availableEquipment = equipment.filter(eq => eq.status === 'available').length;
    const equipmentInUse = equipment.filter(eq => eq.status === 'in-use').length;
    const equipmentMaintenance = equipment.filter(eq => eq.status === 'maintenance').length;
    const totalEquipment = equipment.length;
    
    // Calcul de l'efficacité de l'équipe basée sur les tâches terminées vs en retard
    const allTasksWithDates = (currentProjectData.phases || []).flatMap(phase => 
      (phase.tasks || []).filter(task => task && task.dueDate)
    );
    const completedTasksCount = allTasksWithDates.filter(task => task.status === 'done').length;
    const teamEfficiency = allTasksWithDates.length > 0 
      ? Math.round((completedTasksCount / allTasksWithDates.length) * 100)
      : 85; // Valeur par défaut si pas de données
    
    const teamMembers = currentProjectData.team?.length || 0;

    return {
      activeTasks,
      availableEquipment,
      equipmentInUse,
      equipmentMaintenance,
      totalEquipment,
      teamMembers,
      teamEfficiency,
      budget,
      budgetSpent,
      budgetRemaining,
      budgetPercentage,
      delayedTasks
    };
  }, [currentProjectData]);

  // Vérifier si nous avons des données de projet
  if (!currentProjectData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-orange-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun projet sélectionné
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sélectionnez un projet dans le menu latéral pour accéder au tableau de bord interactif.
            </p>
            <div className="flex justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Créer un nouveau projet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* Header Hero Section */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <SectionHeader
            icon={<FolderOpen className="w-8 h-8 text-blue-600" />}
            title={currentProjectData.name}
            subtitle={currentProjectData.description || ''}
            actions={(
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomizer(s => !s)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition"
                  aria-expanded={showCustomizer}
                >
                  {showCustomizer ? 'Fermer' : 'Personnaliser'}
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* Panneau de personnalisation */}
      {showCustomizer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCustomizer(false)} />
          <div className="relative mx-auto my-8 w-[95%] max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personnaliser le tableau de bord</h3>
            <div className="space-x-2">
              <button
                onClick={() => setPrefs({ ...defaultPrefs })}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Réinitialiser les préférences par défaut"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowCustomizer(false)}
                className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4" checked={prefs.showProjectsOverview} onChange={(e) => setPrefs(p => ({ ...p, showProjectsOverview: e.target.checked }))} />
              <span className="text-gray-800 dark:text-gray-200">Vue d'ensemble projets</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4" checked={prefs.showTeamProductivity} onChange={(e) => setPrefs(p => ({ ...p, showTeamProductivity: e.target.checked }))} />
              <span className="text-gray-800 dark:text-gray-200">Productivité équipe</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4" checked={prefs.showBudgetAlerts} onChange={(e) => setPrefs(p => ({ ...p, showBudgetAlerts: e.target.checked }))} />
              <span className="text-gray-800 dark:text-gray-200">Alertes budget</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4" checked={prefs.showActivityTimeline} onChange={(e) => setPrefs(p => ({ ...p, showActivityTimeline: e.target.checked }))} />
              <span className="text-gray-800 dark:text-gray-200">Timeline activités</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4" checked={prefs.showRealTimeChart} onChange={(e) => setPrefs(p => ({ ...p, showRealTimeChart: e.target.checked }))} />
              <span className="text-gray-800 dark:text-gray-200">Graphiques temps réel</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4" checked={prefs.showCircularProgress} onChange={(e) => setPrefs(p => ({ ...p, showCircularProgress: e.target.checked }))} />
              <span className="text-gray-800 dark:text-gray-200">Progression circulaire</span>
            </label>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Densité</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPrefs(p => ({ ...p, density: 'normal' }))}
                className={`px-3 py-1 rounded border text-sm ${prefs.density === 'normal' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'}`}
              >
                Normale
              </button>
              <button
                onClick={() => setPrefs(p => ({ ...p, density: 'compact' }))}
                className={`px-3 py-1 rounded border text-sm ${prefs.density === 'compact' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'}`}
              >
                Compacte
              </button>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordre de la première rangée</label>
            <div className="space-y-2">
              {prefs.firstRowOrder.map((k, i) => (
                <div key={k} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {k === 'projectsOverview' && "Vue d'ensemble projets"}
                    {k === 'teamProductivity' && 'Productivité équipe'}
                    {k === 'budgetAlerts' && 'Alertes budget'}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => moveFirstRow(k, 'up')}
                      disabled={i === 0}
                      className={`px-2 py-1 text-xs rounded border ${i === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} `}
                    >
                      Haut
                    </button>
                    <button
                      onClick={() => moveFirstRow(k, 'down')}
                      disabled={i === prefs.firstRowOrder.length - 1}
                      className={`px-2 py-1 text-xs rounded border ${i === prefs.firstRowOrder.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} `}
                    >
                      Bas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Tailles 1ère rangée */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Taille - Vue d'ensemble</label>
              <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={prefs.sizeProjectsOverview} onChange={(e) => setPrefs(p => ({ ...p, sizeProjectsOverview: e.target.value as typeof p.sizeProjectsOverview }))}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Taille - Productivité équipe</label>
              <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={prefs.sizeTeamProductivity} onChange={(e) => setPrefs(p => ({ ...p, sizeTeamProductivity: e.target.value as typeof p.sizeTeamProductivity }))}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Taille - Alertes budget</label>
              <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={prefs.sizeBudgetAlerts} onChange={(e) => setPrefs(p => ({ ...p, sizeBudgetAlerts: e.target.value as typeof p.sizeBudgetAlerts }))}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>

          {/* Ordre 2ème rangée */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordre de la deuxième rangée</label>
            <div className="space-y-2">
              {prefs.secondRowOrder.map((k, i) => (
                <div key={k} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {k === 'activityTimeline' && "Timeline d'activité"}
                    {k === 'realTimeChart' && 'Métriques temps réel'}
                  </span>
                  <div className="space-x-2">
                    <button onClick={() => setPrefs(p => { const o=[...p.secondRowOrder]; if(i>0){[o[i-1],o[i]]=[o[i],o[i-1]];} return { ...p, secondRowOrder: o }; })} disabled={i===0} className={`px-2 py-1 text-xs rounded border ${i===0?'opacity-50 cursor-not-allowed':'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Haut</button>
                    <button onClick={() => setPrefs(p => { const o=[...p.secondRowOrder]; if(i<o.length-1){[o[i+1],o[i]]=[o[i],o[i+1]];} return { ...p, secondRowOrder: o }; })} disabled={i===prefs.secondRowOrder.length-1} className={`px-2 py-1 text-xs rounded border ${i===prefs.secondRowOrder.length-1?'opacity-50 cursor-not-allowed':'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Bas</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Tailles 2ème rangée */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Taille - Timeline</label>
              <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={prefs.sizeActivityTimeline} onChange={(e) => setPrefs(p => ({ ...p, sizeActivityTimeline: e.target.value as typeof p.sizeActivityTimeline }))}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Taille - Métriques temps réel</label>
              <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={prefs.sizeRealTimeChart} onChange={(e) => setPrefs(p => ({ ...p, sizeRealTimeChart: e.target.value as typeof p.sizeRealTimeChart }))}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>

          {/* Ordre 3ème rangée */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordre de la troisième rangée</label>
            <div className="space-y-2">
              {prefs.thirdRowOrder.map((k, i) => (
                <div key={k} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {k === 'circularProgress' && 'Progression circulaire'}
                    {k === 'quickActions' && 'Actions rapides'}
                  </span>
                  <div className="space-x-2">
                    <button onClick={() => setPrefs(p => { const o=[...p.thirdRowOrder]; if(i>0){[o[i-1],o[i]]=[o[i],o[i-1]];} return { ...p, thirdRowOrder: o }; })} disabled={i===0} className={`px-2 py-1 text-xs rounded border ${i===0?'opacity-50 cursor-not-allowed':'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Haut</button>
                    <button onClick={() => setPrefs(p => { const o=[...p.thirdRowOrder]; if(i<o.length-1){[o[i+1],o[i]]=[o[i],o[i+1]];} return { ...p, thirdRowOrder: o }; })} disabled={i===prefs.thirdRowOrder.length-1} className={`px-2 py-1 text-xs rounded border ${i===prefs.thirdRowOrder.length-1?'opacity-50 cursor-not-allowed':'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Bas</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Tailles 3ème rangée */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Taille - Progression</label>
              <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={prefs.sizeCircularProgress} onChange={(e) => setPrefs(p => ({ ...p, sizeCircularProgress: e.target.value as typeof p.sizeCircularProgress }))}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Taille - Actions rapides</label>
              <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={prefs.sizeQuickActions} onChange={(e) => setPrefs(p => ({ ...p, sizeQuickActions: e.target.value as typeof p.sizeQuickActions }))}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #4C6A92, #2F4858)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tâches Actives</p>
              <p className="text-3xl font-bold">{stats.activeTasks}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #7AA273, #4F7A57)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Budget Utilisé</p>
              <p className="text-3xl font-bold">{formatAmount(stats.budgetSpent)}</p>
            </div>
            <Euro className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #D6A354, #B07B3A)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Progression</p>
              <p className="text-3xl font-bold">{currentProjectData.progress}%</p>
            </div>
            <Target className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        
        <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #6E5A7E, #4C3A5C)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Équipe Active</p>
              <p className="text-3xl font-bold">{stats.teamMembers || 12}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avancement Global</h3>
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <ProgressBar value={currentProjectData.progress} tone="orange" />
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {currentProjectData.completedTasks} / {(currentProjectData.phases || []).flatMap(p => p.tasks || []).length} tâches
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Consommé</h3>
            <Euro className="w-5 h-5 text-green-500" />
          </div>
          <ProgressBar value={Math.min(stats.budgetPercentage, 100)} tone={stats.budgetPercentage > 80 ? 'red' : 'green'} />
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {formatAmount(stats.budgetSpent)} / {formatAmount(stats.budget)}
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Efficacité Équipe</h3>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <ProgressBar value={stats.teamEfficiency} tone="purple" />
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {stats.teamMembers} membres actifs
          </p>
        </div>
      </div>

      {/* Widgets Grid Section */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Vue d'ensemble avancée</h3>
            <p className="text-gray-600 dark:text-gray-400">Widgets intelligents pour un suivi complet de votre projet</p>
          </div>
          <button
            onClick={() => setShowAdvanced(s => !s)}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-expanded={showAdvanced}
            aria-controls="advanced-widgets"
          >
            {showAdvanced ? 'Afficher moins' : 'Afficher plus'}
          </button>
        </div>
        
        {showAdvanced && (
        <>
        <div id="advanced-widgets" className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 ${prefs.density === 'compact' ? 'gap-3 mb-6' : 'gap-6 mb-8'}`}>
          {prefs.firstRowOrder.map((key) => {
            if (key === 'projectsOverview' && prefs.showProjectsOverview) {
              return (
                <div key={`wrap-${key}`} className="contents">
                {dragOverFirst === 'projectsOverview' && dragKey && dragKey !== 'projectsOverview' && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl h-10 xl:col-span-3 lg:col-span-2" />
                )}
                <div
                  draggable
                  onDragStart={onDragStart('projectsOverview')}
                  onDragOver={onDragOver}
                  onDrop={onDrop('projectsOverview')}
                  onDragEnter={() => setDragOverFirst('projectsOverview')}
                  onDragLeave={() => setDragOverFirst(null)}
                  className={`${spanClassFor(prefs.sizeProjectsOverview)} card-base card-gradient-border hover:card-interactive animate-slide-in-up ${prefs.density === 'compact' ? 'p-4' : 'p-6'} ${dragOverFirst === 'projectsOverview' ? 'ring-2 ring-blue-400' : ''}`}
                  title="Glisser pour réorganiser"
                >
                  <h4 className="heading-4 heading-gradient mb-4">Vue d'ensemble Projets</h4>
                  <ProjectsOverviewWidget className="h-full" />
                </div>
                </div>
              );
            }
            if (key === 'teamProductivity' && prefs.showTeamProductivity) {
              return (
                <div key={`wrap-${key}`} className="contents">
                {dragOverFirst === 'teamProductivity' && dragKey && dragKey !== 'teamProductivity' && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl h-10 xl:col-span-1 lg:col-span-1" />
                )}
                <div
                  draggable
                  onDragStart={onDragStart('teamProductivity')}
                  onDragOver={onDragOver}
                  onDrop={onDrop('teamProductivity')}
                  onDragEnter={() => setDragOverFirst('teamProductivity')}
                  onDragLeave={() => setDragOverFirst(null)}
                  className={`${spanClassFor(prefs.sizeTeamProductivity)} ${dragOverFirst === 'teamProductivity' ? 'ring-2 ring-blue-400 rounded-2xl' : ''}`}
                  title="Glisser pour réorganiser"
                >
                  <TeamProductivityWidget />
                </div>
                </div>
              );
            }
            if (key === 'budgetAlerts' && prefs.showBudgetAlerts) {
              return (
                <div key={`wrap-${key}`} className="contents">
                {dragOverFirst === 'budgetAlerts' && dragKey && dragKey !== 'budgetAlerts' && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl h-10 xl:col-span-2 lg:col-span-2" />
                )}
                <div
                  draggable
                  onDragStart={onDragStart('budgetAlerts')}
                  onDragOver={onDragOver}
                  onDrop={onDrop('budgetAlerts')}
                  onDragEnter={() => setDragOverFirst('budgetAlerts')}
                  onDragLeave={() => setDragOverFirst(null)}
                  className={`${spanClassFor(prefs.sizeBudgetAlerts)} card-base card-gradient-secondary hover:card-interactive animate-slide-in-up animate-delay-200 ${prefs.density === 'compact' ? 'p-4' : 'p-6'} ${dragOverFirst === 'budgetAlerts' ? 'ring-2 ring-blue-400' : ''}`}
                  data-alerts
                  title="Glisser pour réorganiser"
                >
                  <BudgetAlertsWidget 
                    projectId={currentProjectData.id}
                    projectName={currentProjectData.name}
                    budget={currentProjectData.budget || 0}
                    totalActualExpenses={0}
                    totalPlannedExpenses={0}
                  />
                </div>
                </div>
              );
            }
            return null;
          })}
        </div>
        {/* Deuxième ligne de widgets (ordre & DnD) */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 ${prefs.density === 'compact' ? 'gap-3 mb-6' : 'gap-6 mb-8'}`}>
          {prefs.secondRowOrder.map((key) => {
            if (key === 'activityTimeline' && prefs.showActivityTimeline) {
              return (
                <div key={`wrap-${key}`} className="contents">
                {dragOverSecond === 'activityTimeline' && dragSecondKey && dragSecondKey !== 'activityTimeline' && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl h-10 xl:col-span-2 lg:col-span-2" />
                )}
                <div
                  draggable
                  onDragStart={onSecondDragStart('activityTimeline')}
                  onDragOver={onDragOver}
                  onDrop={onSecondDrop('activityTimeline')}
                  onDragEnter={() => setDragOverSecond('activityTimeline')}
                  onDragLeave={() => setDragOverSecond(null)}
                  className={`${spanClassFor(prefs.sizeActivityTimeline)} bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${prefs.density === 'compact' ? 'p-4' : 'p-6'} border border-gray-200 dark:border-gray-700 ${dragOverSecond === 'activityTimeline' ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline d'activité</h4>
                  <ActivityTimelineWidget className="h-full" />
                </div>
                </div>
              );
            }
            if (key === 'realTimeChart' && prefs.showRealTimeChart) {
              return (
                <div key={`wrap-${key}`} className="contents">
                {dragOverSecond === 'realTimeChart' && dragSecondKey && dragSecondKey !== 'realTimeChart' && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl h-10 xl:col-span-2 lg:col-span-2" />
                )}
                <div
                  draggable
                  onDragStart={onSecondDragStart('realTimeChart')}
                  onDragOver={onDragOver}
                  onDrop={onSecondDrop('realTimeChart')}
                  onDragEnter={() => setDragOverSecond('realTimeChart')}
                  onDragLeave={() => setDragOverSecond(null)}
                  className={`${spanClassFor(prefs.sizeRealTimeChart)} bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${prefs.density === 'compact' ? 'p-4' : 'p-6'} border border-gray-200 dark:border-gray-700 ${dragOverSecond === 'realTimeChart' ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Métriques temps réel</h4>
                  <RealTimeChartWidget className="h-full" />
                </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* AI Monitoring Section */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 ${prefs.density === 'compact' ? 'gap-3 mb-6' : 'gap-6 mb-8'}`}>
          <div className="xl:col-span-2 lg:col-span-1">
            <HybridAIMonitoringWidget />
          </div>
          {user?.role === 'admin' && (
            <div className="xl:col-span-1 lg:col-span-1">
              <HybridAITestPanel />
            </div>
          )}
        </div>

        {/* Troisième ligne de widgets */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 ${prefs.density === 'compact' ? 'gap-3 mb-6' : 'gap-6 mb-8'}`}>
          {prefs.thirdRowOrder.map((key) => {
            if (key === 'circularProgress' && prefs.showCircularProgress) {
              return (
                <div key={`wrap-${key}`} className="contents">
                {dragOverThird === 'circularProgress' && dragThirdKey && dragThirdKey !== 'circularProgress' && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl h-10 xl:col-span-2 lg:col-span-2" />
                )}
                <div
                  draggable
                  onDragStart={onThirdDragStart('circularProgress')}
                  onDragOver={onDragOver}
                  onDrop={onThirdDrop('circularProgress')}
                  onDragEnter={() => setDragOverThird('circularProgress')}
                  onDragLeave={() => setDragOverThird(null)}
                  className={`${spanClassFor(prefs.sizeCircularProgress)} bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${prefs.density === 'compact' ? 'p-4' : 'p-6'} border border-gray-200 dark:border-gray-700 ${dragOverThird === 'circularProgress' ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <h4 className="heading-4 heading-gradient mb-4">Productivité Équipe</h4>
                  <CircularProgressWidget 
                    percentage={currentProjectData?.progress || 0}
                    title="Avancement Projet"
                    value={`${currentProjectData?.progress || 0}%`}
                    color="#C2693A"
                    subtitle={`${currentProjectData?.completedTasks || 0}/${(currentProjectData?.phases || []).flatMap(p => p.tasks || []).length} tâches`}
                  />
                </div>
                </div>
              );
            }
            if (key === 'quickActions') {
              return (
                <div key={`wrap-${key}`} className="contents">
                {dragOverThird === 'quickActions' && dragThirdKey && dragThirdKey !== 'quickActions' && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl h-10 xl:col-span-2 lg:col-span-2" />
                )}
                <div
                  draggable
                  onDragStart={onThirdDragStart('quickActions')}
                  onDragOver={onDragOver}
                  onDrop={onThirdDrop('quickActions')}
                  onDragEnter={() => setDragOverThird('quickActions')}
                  onDragLeave={() => setDragOverThird(null)}
                  className={`${spanClassFor(prefs.sizeQuickActions)} bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${prefs.density === 'compact' ? 'p-4' : 'p-6'} border border-gray-200 dark:border-gray-700 ${dragOverThird === 'quickActions' ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <h4 className="heading-4 heading-gradient mb-4">Actions Rapides</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                      onClick={() => onNavigate?.('projects')}
                      className="btn-base btn-gradient-accent btn-sm group hover-lift"
                    >
                      <FolderOpen className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Nouveau Projet</p>
                    </button>
                  
                  <button 
                    onClick={() => onNavigate?.('planning')}
                    className="btn-base btn-secondary btn-sm group hover-lift"
                  >
                    <Calendar className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Planning</p>
                  </button>
                  
                  <button 
                    onClick={() => {
                      const alertsSection = document.querySelector('[data-alerts]');
                      if (alertsSection) {
                        alertsSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        if (stats.delayedTasks > 0) {
                          alert(`Attention: ${stats.delayedTasks} tâche(s) en retard nécessitent votre attention.`);
                        } else {
                          alert('Aucune alerte pour le moment. Tout va bien!');
                        }
                      }
                    }}
                    className="group relative p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <AlertTriangle className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Alertes</p>
                    {stats.delayedTasks > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {stats.delayedTasks}
                      </span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => onNavigate?.('finances')}
                    className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <Euro className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Finances</p>
                  </button>
                  </div>
                </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Section Automatisations n8n */}
        <div className={`${prefs.density === 'compact' ? 'mb-6' : 'mb-8'}`}>
          <SectionHeader 
            title="Automatisations & Workflows" 
            subtitle="Gestion des workflows n8n et automatisations BTP"
            icon={<Zap className="w-6 h-6" />}
          />
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <AutomationDashboard />
          </div>
        </div>

        {/* Section IA Avancée */}
        {showAdvanced && (
          <div className={`${prefs.density === 'compact' ? 'mb-6' : 'mb-8'}`}>
            <SectionHeader 
              title="Intelligence Artificielle" 
              subtitle="Copilot vocal et détection d'anomalies"
              icon={<AlertTriangle className="w-6 h-6" />}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Copilot Vocal</h4>
                <VocalCopilot />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Détection d'Anomalies</h4>
                <AnomalyDetectionDashboard />
              </div>
            </div>
          </div>
        )}

        {/* Widgets avancés - Quatrième ligne */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 ${prefs.density === 'compact' ? 'gap-3 mb-6' : 'gap-6 mb-8'}`}>
          {/* Widget Maintenance Équipements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Maintenance</h4>
            <EquipmentMaintenanceWidget />
          </div>

          {/* Widget Scanner Équipements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Scanner</h4>
            <EquipmentScannerWidget />
          </div>

          {/* Widget Météo */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Météo</h4>
            <WeatherWidget />
          </div>

          {/* Widget Statut Hors-ligne */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Connexion</h4>
            <OfflineStatusWidget />
          </div>
        </div>
        </>
        )}
      </div>
    </PageContainer>
  );
};

export default Dashboard;