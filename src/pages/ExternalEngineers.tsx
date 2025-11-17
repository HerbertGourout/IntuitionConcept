import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, User, Star, Briefcase, Phone, Mail, Award } from 'lucide-react';
import ExternalEngineerService, { ExternalEngineer } from '../services/externalEngineerService';
import PageContainer from '../components/Layout/PageContainer';
import SectionHeader from '../components/UI/SectionHeader';
import { GlassCard } from '../components/UI/VisualEffects';

const ExternalEngineers: React.FC = () => {
  const [engineers, setEngineers] = useState<ExternalEngineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ExternalEngineer>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    specialties: [],
    rating: 0,
    projectsCompleted: 0,
    avgDelay: 0,
    hourlyRate: 0,
    certifications: [],
    status: 'active'
  });

  useEffect(() => {
    loadEngineers();
  }, []);

  const loadEngineers = async () => {
    try {
      setLoading(true);
      const data = await ExternalEngineerService.getAllEngineers();
      setEngineers(data);
    } catch (error) {
      console.error('Erreur chargement ingénieurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ExternalEngineerService.addEngineer(formData as Omit<ExternalEngineer, 'id' | 'createdAt'>);
      setShowForm(false);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        specialties: [],
        rating: 0,
        projectsCompleted: 0,
        avgDelay: 0,
        hourlyRate: 0,
        certifications: [],
        status: 'active'
      });
      loadEngineers();
    } catch (error) {
      console.error('Erreur ajout ingénieur:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-blue-50 via-white to-green-50">
        <SectionHeader
          icon={<User className="w-8 h-8 text-blue-600" />}
          title="Ingénieurs Externes"
          subtitle="Gérez votre réseau d'ingénieurs partenaires"
          actions={
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-glass bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Ajouter un ingénieur
              </button>
              <button
                onClick={() => window.history.back()}
                className="btn-glass bg-gray-100 hover:bg-gray-200 px-4 py-2 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
            </div>
          }
        />
      </GlassCard>

      {/* Add Engineer Form */}
      {showForm && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Nouvel Ingénieur</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ing. Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bureau d'Études XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jean@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+225 07 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux horaire (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="4.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:scale-105 transition-all"
              >
                Ajouter
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Engineers List */}
      {loading ? (
        <GlassCard className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des ingénieurs...</p>
        </GlassCard>
      ) : engineers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun ingénieur enregistré
          </h3>
          <p className="text-gray-600 mb-4">
            Ajoutez des ingénieurs externes pour collaborer sur vos projets
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineers.map((engineer) => (
            <GlassCard key={engineer.id} className="p-6 hover:shadow-lg transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {engineer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{engineer.name}</h3>
                    <p className="text-sm text-gray-600">{engineer.company}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  engineer.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {engineer.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                {renderStars(engineer.rating)}
                <span className="text-sm text-gray-600">({engineer.rating}/5)</span>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{engineer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{engineer.phone}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Projets</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{engineer.projectsCompleted}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">Taux/h</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {(engineer.hourlyRate / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>

              {/* Specialties */}
              {engineer.specialties && engineer.specialties.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Spécialités:</p>
                  <div className="flex flex-wrap gap-1">
                    {engineer.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {engineer.certifications && engineer.certifications.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Certifications:</p>
                  <div className="flex flex-wrap gap-1">
                    {engineer.certifications.slice(0, 2).map((cert, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && engineers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{engineers.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {engineers.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Projets totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  {engineers.reduce((sum, e) => sum + e.projectsCompleted, 0)}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(engineers.reduce((sum, e) => sum + e.rating, 0) / engineers.length).toFixed(1)}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </PageContainer>
  );
};

export default ExternalEngineers;
