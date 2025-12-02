import React, { useState } from 'react';
import { Box, Upload, X } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';

const Rendu3D: React.FC = () => {
  const [planImageBase64, setPlanImageBase64] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPlanImageBase64(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileRemove = () => {
    setPlanImageBase64(null);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rendu 3D</h1>
            <p className="text-gray-600 dark:text-gray-400">Générez des visualisations 3D à partir de vos plans</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {!planImageBase64 ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Téléchargez un plan architectural
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Formats acceptés: PNG, JPG, PDF
              </p>
              <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                <Upload className="w-5 h-5 mr-2" />
                Sélectionner un fichier
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Plan chargé
                </h3>
                <button
                  onClick={handleFileRemove}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                <img
                  src={planImageBase64}
                  alt="Plan architectural"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>La génération 3D sera disponible prochainement.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Rendu3D;
