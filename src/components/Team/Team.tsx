import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Award, 
  Crown, 
  Shield, 
  Eye, 
  HardHat, 
  User,
  Edit,
  Trash2,
  X,
  Mail,
  Phone,
  Building2,
  Briefcase
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { TeamMember, Role, TeamStats } from '../../types/team';
import TeamService from '../../services/teamService';
import CurrencyService from '../../services/currencyService';

const Team: React.FC = () => {
  const { currentProject } = useProjectContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'worker',
    speciality: 'macon',
    department: 'gros_oeuvre',
    salary: '',
    skills: [] as string[],
    certifications: [] as string[]
  });
  
  // État pour la monnaie
  const [currency, setCurrency] = useState({ symbol: 'FCFA', position: 'after' as 'before' | 'after' });
  
  // Charger la monnaie par défaut
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const defaultCurrency = await CurrencyService.getDefaultCurrency();
        setCurrency({ symbol: defaultCurrency.symbol, position: defaultCurrency.position });
      } catch (error) {
        console.warn('Erreur lors du chargement de la monnaie:', error);
      }
    };
    loadCurrency();
  }, []);
  
  // Fonction pour formater le salaire avec la monnaie
  const formatSalary = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    if (numAmount === 0) return 'Non renseigné';
    
    const formatted = numAmount.toLocaleString('fr-FR');
    return currency.position === 'before' 
      ? `${currency.symbol} ${formatted}`
      : `${formatted} ${currency.symbol}`;
  };

  // État des membres d'équipe depuis Firebase
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger/écouter les membres du projet courant
  useEffect(() => {
    if (!currentProject?.id) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = TeamService.subscribeToProjectMembers(currentProject.id, (members) => {
      setTeamMembers(members);
      setLoading(false);
      setError(null);
    });
    return () => unsubscribe();
  }, [currentProject?.id]);

  const roles: Role[] = [
    {
      key: 'admin',
      name: 'Administrateur',
      description: 'Accès complet au système',
      permissions: ['all'],
      color: 'bg-red-500',
      icon: Crown,
      level: 1
    },
    {
      key: 'project_manager',
      name: 'Chef de Projet',
      description: 'Gestion des projets et équipes',
      permissions: ['project_management', 'team_management'],
      color: 'bg-blue-500',
      icon: Shield,
      level: 2
    },
    {
      key: 'supervisor',
      name: 'Superviseur',
      description: 'Supervision des travaux',
      permissions: ['supervision', 'quality_control'],
      color: 'bg-green-500',
      icon: Eye,
      level: 3
    },
    {
      key: 'worker',
      name: 'Ouvrier',
      description: 'Exécution des travaux',
      permissions: ['task_execution'],
      color: 'bg-yellow-500',
      icon: HardHat,
      level: 4
    },
    {
      key: 'client',
      name: 'Client',
      description: 'Consultation des projets',
      permissions: ['view_projects'],
      color: 'bg-purple-500',
      icon: User,
      level: 5
    }
  ];

  // Filtrage des membres
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.speciality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || member.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchTerm, selectedRole, selectedStatus]);

  // Fonctions utilitaires
  const getRoleInfo = (roleKey: string): Role => {
    return roles.find(role => role.key === roleKey) || roles[0];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'on_leave': return 'En congé';
      default: return 'Inconnu';
    }
  };

  // Calcul des statistiques de l'équipe
  const teamStats: TeamStats = useMemo(() => {
    const totalMembers = teamMembers.length;
    const activeMembers = teamMembers.filter(m => m.status === 'active').length;
    const onLeaveMembers = teamMembers.filter(m => m.status === 'on_leave').length;
    const averageWorkload = totalMembers > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.workload || 0), 0) / totalMembers)
      : 0;
    const topPerformers = teamMembers.filter(m => (m.performance || 0) >= 90).length;
    
    return {
      totalMembers,
      activeMembers,
      onLeaveMembers,
      averageWorkload,
      topPerformers
    };
  }, [teamMembers]);

  // Gestionnaires d'événements
  const handleAddMember = () => {
    openMemberModal();
  };

  const handleEditMember = (member: TeamMember) => {
    openMemberModal(member);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await TeamService.deleteMember(memberId);
      // La mise à jour se fera automatiquement via l'abonnement temps réel
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      setError('Erreur lors de la suppression du membre');
    }
  };

  const handleSaveMember = async () => {
    if (!formData.name || !formData.phone) {
      alert('Veuillez remplir au moins le nom et le téléphone');
      return;
    }

    try {
      const memberData = {
        name: formData.name,
        email: formData.email || '', // Email optionnel
        phone: formData.phone,
        role: formData.role as any,
        speciality: formData.speciality,
        status: 'active' as const,
        joinDate: selectedMember ? selectedMember.joinDate : new Date().toISOString().split('T')[0],
        projectsCount: selectedMember ? selectedMember.projectsCount : 0,
        department: formData.department,
        salary: formData.salary ? parseInt(formData.salary) : 0,
        workload: selectedMember ? selectedMember.workload : 0,
        skills: formData.skills,
        certifications: formData.certifications,
        lastActivity: new Date().toISOString().split('T')[0],
        performance: selectedMember ? selectedMember.performance : 80
      };

      if (selectedMember) {
        await TeamService.updateMember(selectedMember.id, memberData);
      } else {
        if (!currentProject?.id) throw new Error('Aucun projet sélectionné');
        await TeamService.addMemberToProject(currentProject.id, memberData);
      }

      // Fermer la modal et réinitialiser le formulaire
      setIsModalOpen(false);
      setSelectedMember(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'worker',
        speciality: '',
        department: 'Production',
        salary: '',
        skills: [],
        certifications: []
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du membre:', error);
      setError('Erreur lors de la sauvegarde du membre');
    }
  };

  const openMemberModal = (member?: TeamMember) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        role: member.role,
        speciality: member.speciality,
        department: member.department || 'Production',
        salary: member.salary ? member.salary.toString() : '',
        skills: member.skills || [],
        certifications: member.certifications || []
      });
    } else {
      setSelectedMember(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'worker',
        speciality: '',
        department: 'Production',
        salary: '',
        skills: [],
        certifications: []
      });
    }
    setIsModalOpen(true);
  };

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="glass-card">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Équipe
                </h1>
                <p className="text-gray-600 mt-1">
                  Chargement des membres de l'équipe...
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Affichage des erreurs */}
      {error && (
        <div className="glass-card border-red-200 bg-red-50/50">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header avec design moderne */}
      <div className="card-gradient p-6 rounded-xl animate-slideInUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="heading-2 text-shimmer">
                Équipe
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez votre équipe de {teamStats.totalMembers} membres
              </p>
            </div>
          </div>
          <button
            onClick={handleAddMember}
            className="btn-primary btn-glow animate-float"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau Membre
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              </div>
            </div>
          </div>
          <div className="card-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-xl font-bold text-green-600">{teamStats.activeMembers}</p>
              </div>
            </div>
          </div>
          <div className="card-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">En congé</p>
                <p className="text-xl font-bold text-yellow-600">{teamStats.onLeaveMembers}</p>
              </div>
            </div>
          </div>
          <div className="card-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Charge moy.</p>
                <p className="text-xl font-bold text-purple-600">{teamStats.averageWorkload}%</p>
              </div>
            </div>
          </div>
          <div className="card-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Top perf.</p>
                <p className="text-xl font-bold text-orange-600">{teamStats.topPerformers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card-glass p-6 rounded-xl animate-slideInUp" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="h-5 w-5 text-glow" />
          <h3 className="heading-4 text-shimmer">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input form-input-gradient w-full pl-10"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-select form-input-gradient"
          >
            <option value="all">Tous les rôles</option>
            {roles.map(role => (
              <option key={role.key} value={role.key}>{role.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select form-input-gradient"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="on_leave">En congé</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-secondary btn-morph ${
                viewMode === 'grid' 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : ''
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-secondary btn-morph ${
                viewMode === 'list' 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : ''
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="card-glass rounded-xl animate-slideInUp" style={{animationDelay: '0.2s'}}>
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-glow" />
            <h3 className="heading-4 text-shimmer">
              Membres de l'équipe ({filteredMembers.length})
            </h3>
          </div>
        </div>

        <div className="p-6">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Aucun membre trouvé</p>
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'worker',
                    speciality: 'macon',
                    department: 'gros_oeuvre',
                    salary: '',
                    skills: [],
                    certifications: []
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-200"
              >
                <UserPlus className="h-5 w-5" />
                <span>Ajouter le premier membre</span>
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                : 'grid-cols-1'
            }`}>
              {filteredMembers.map((member) => {
                const role = getRoleInfo(member.role);
                const Icon = role.icon;
                return (
                  <div key={member.id} className="glass-card p-4 rounded-xl border border-white/20 bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center text-white`}>
                        <Icon />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{member.name}</div>
                        <div className="text-xs text-gray-500 truncate">{role.name}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-2xl p-6 rounded-xl mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {selectedMember ? 'Modifier le membre' : 'Ajouter un membre'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ex: jean.dupont@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ex: 06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  {roles.map(role => (
                    <option key={role.key} value={role.key}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialité
                </label>
                <select
                  value={formData.speciality}
                  onChange={(e) => setFormData(prev => ({ ...prev, speciality: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="macon">Maçon</option>
                  <option value="charpentier">Charpentier</option>
                  <option value="couvreur">Couvreur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Département
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="gros_oeuvre">Gros œuvre</option>
                  <option value="second_oeuvre">Second œuvre</option>
                  <option value="finitions">Finitions</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveMember}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              >
                {selectedMember ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
