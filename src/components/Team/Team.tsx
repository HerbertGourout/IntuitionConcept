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
  Phone
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { TeamMember, Role, TeamStats } from '../../types/team';
import TeamService from '../../services/teamService';

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
    speciality: '',
    department: 'Production',
    salary: '',
    skills: [] as string[],
    certifications: [] as string[]
  });

  // État des membres d'équipe depuis Firebase
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les membres depuis Firebase
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setLoading(true);
        const members = await TeamService.getAllMembers();
        setTeamMembers(members);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
        setError('Erreur lors du chargement des membres');
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();

    // S'abonner aux mises à jour temps réel
    const unsubscribe = TeamService.subscribeToMembers((members) => {
      setTeamMembers(members);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
        await TeamService.addMember(memberData);
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
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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
                Gestion des membres de l'équipe et des rôles
              </p>
            </div>
          </div>
          <button
            onClick={handleAddMember}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nouveau membre</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Membres</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{teamStats.activeMembers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Congé</p>
              <p className="text-2xl font-bold text-yellow-600">{teamStats.onLeaveMembers}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Performers</p>
              <p className="text-2xl font-bold text-purple-600">{teamStats.topPerformers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Tous les rôles</option>
            {roles.map(role => (
              <option key={role.key} value={role.key}>{role.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="on_leave">En congé</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">
              Membres de l'équipe ({filteredMembers.length})
            </h3>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Aucun membre trouvé</p>
            <button
              onClick={handleAddMember}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="h-5 w-5" />
              <span>Ajouter le premier membre</span>
            </button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const roleInfo = getRoleInfo(member.role);
              const IconComponent = roleInfo.icon;
              
              return (
                <div key={member.id} className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <IconComponent className="h-3 w-3 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.speciality}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {getStatusText(member.status)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} text-white`}>
                              {roleInfo.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Projets</p>
                            <p className="text-lg font-semibold text-blue-600">{member.projectsCount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Performance</p>
                            <p className="text-lg font-semibold text-green-600">{member.performance || 0}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{member.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de gestion des membres */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedMember ? 'Modifier le membre' : 'Nouveau membre'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Formulaire d'ajout/modification de membre */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Jean Dupont"
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
                      placeholder="jean.dupont@example.com (optionnel)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="+237 6XX XX XX XX"
                      required
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
                      <option value="">Sélectionner une spécialité</option>
                      <option value="Maçonnerie">🧱 Maçonnerie</option>
                      <option value="Électricité">⚡ Électricité</option>
                      <option value="Plomberie">🔧 Plomberie</option>
                      <option value="Charpenterie">🪵 Charpenterie</option>
                      <option value="Couverture">🏠 Couverture</option>
                      <option value="Peinture">🎨 Peinture</option>
                      <option value="Carrelage">🏺 Carrelage</option>
                      <option value="Terrassement">🚜 Terrassement</option>
                      <option value="Béton armé">🏗️ Béton armé</option>
                      <option value="Isolation">🧊 Isolation</option>
                      <option value="Menuiserie">🚪 Menuiserie</option>
                      <option value="Climatisation">❄️ Climatisation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Département
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Production, Management, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salaire (FCFA/an)
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="2500000 (optionnel)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compétences (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.skills.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                      className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Maçonnerie, Béton, Finitions"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.certifications.join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="CAP Maçon, CACES, etc."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveMember}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg font-medium"
                >
                  💾 Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
