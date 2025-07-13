import React, { useState, useContext, useEffect } from 'react';
import { X } from 'lucide-react';
import ProjectContext from '../../contexts/ProjectContext';
import type { Project } from '../../contexts/projectTypes';


// Type partiel pour les propriétés du projet nécessaires à l'édition
type ProjectForEdit = Pick<Project, 'id' | 'name' | 'description' | 'location' | 'startDate' | 'endDate' | 'status' | 'budget' | 'manager' | 'client'> & {
    // Propriétés optionnelles
    status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
    manager?: string;
    client?: string;
    description?: string;
    location?: string;
};

interface EditProjectModalProps {
    project: ProjectForEdit;
    isOpen: boolean;
    onClose: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, isOpen, onClose }) => {
    const projectContext = useContext(ProjectContext);


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        status: '',
        budget: 0,
        manager: '',
        client: '',
    });

    // Initialiser le formulaire avec les données du projet
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                location: project.location || '',
                startDate: project.startDate || '',
                endDate: project.endDate || '',
                status: project.status || 'planning',
                budget: project.budget || 0,
                manager: project.manager || '',
                client: project.client || '',
            });
        }
    }, [project]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'budget' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectContext) return;

        projectContext.updateProject(
            project.id,
            {
                name: formData.name,
                description: formData.description,
                location: formData.location,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status as 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled',
                budget: formData.budget,
                manager: formData.manager,
                client: formData.client,
            },
            "Modification des informations du projet",
            'Développeur'
        );

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Modifier le projet</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nom du projet *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                Localisation
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                Date de début
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Statut
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="planning">Planification</option>
                                <option value="in_progress">En cours</option>
                                <option value="on_hold">En attente</option>
                                <option value="completed">Terminé</option>
                                <option value="cancelled">Annulé</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                                Budget (FCFA)
                            </label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProjectModal;
