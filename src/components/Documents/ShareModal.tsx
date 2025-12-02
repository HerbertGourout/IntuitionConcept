import React, { useState } from 'react';
import { Share2, Copy, Mail, Link, Calendar, Lock, Globe, Check } from 'lucide-react';
import Modal from '../UI/Modal';
import { Document } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, document }) => {
  // All hooks must be called before any conditional returns
  const [shareSettings, setShareSettings] = useState({
    accessLevel: 'view', // view, comment, edit
    expiration: '7', // days
    requireAuth: true,
    allowDownload: true,
    notifyByEmail: false
  });
  const [shareLink, setShareLink] = useState('');
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailList, setEmailList] = useState('');

  // Si document est null ou undefined, on n'affiche rien (ou on peut afficher un fallback)
  if (!document) return null;

  const accessLevels = [
    { value: 'view', label: 'Lecture seule', icon: '👁️', description: 'Peut voir le document' },
    { value: 'comment', label: 'Commentaire', icon: '💬', description: 'Peut voir et commenter' },
    { value: 'edit', label: 'Modification', icon: '✏️', description: 'Peut voir, commenter et modifier' }
  ];

  const expirationOptions = [
    { value: '1', label: '1 jour' },
    { value: '7', label: '7 jours' },
    { value: '30', label: '30 jours' },
    { value: '90', label: '90 jours' },
    { value: 'never', label: 'Jamais' }
  ];

  const generateShareLink = () => {
    // Simulate link generation
    const baseUrl = window.location.origin;
    const linkId = Math.random().toString(36).substr(2, 12);
    const generatedLink = `${baseUrl}/shared/${linkId}`;
    
    setShareLink(generatedLink);
    setLinkGenerated(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const sendByEmail = () => {
    const subject = `Partage de document: ${document.name}`;
    const body = `Bonjour,\n\nJe partaglement`;
    const mailtoLink = `mailto:${emailList}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const getExpirationDate = () => {
    if (shareSettings.expiration === 'never') return 'Jamais';
    
    const days = parseInt(shareSettings.expiration);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate.toLocaleDateString('fr-FR');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Partager le Document" 
      size="lg"
    >
      <div className="space-y-6">
        {/* Document Info */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{document.name}</h3>
              <p className="text-sm text-gray-600">
                {(document.size / (1024 * 1024)).toFixed(1)} MB • Version {document.version}
              </p>
            </div>
          </div>
        </div>

        {/* Access Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Niveau d'accès
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {accessLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setShareSettings(prev => ({ ...prev, accessLevel: level.value }))}
                className={`p-4 border rounded-lg text-left transition-all ${
                  shareSettings.accessLevel === level.value
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500 ring-opacity-20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{level.icon}</span>
                  <span className="font-medium text-gray-900">{level.label}</span>
                </div>
                <p className="text-sm text-gray-600">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Share Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration du lien
            </label>
            <select
              value={shareSettings.expiration}
              onChange={(e) => setShareSettings(prev => ({ ...prev, expiration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {expirationOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Authentification requise
              </label>
              <button
                onClick={() => setShareSettings(prev => ({ ...prev, requireAuth: !prev.requireAuth }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  shareSettings.requireAuth ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    shareSettings.requireAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Autoriser le téléchargement
              </label>
              <button
                onClick={() => setShareSettings(prev => ({ ...prev, allowDownload: !prev.allowDownload }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  shareSettings.allowDownload ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    shareSettings.allowDownload ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Share Link Generation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Lien de partage
            </label>
            {!linkGenerated && (
              <button
                onClick={generateShareLink}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                <Link className="w-4 h-4" />
                Générer le lien
              </button>
            )}
          </div>

          {linkGenerated ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Link Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-1 text-blue-700">
                    {shareSettings.requireAuth ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p>
                      <strong>Accès:</strong> {shareSettings.requireAuth ? 'Authentification requise' : 'Public'}
                    </p>
                    <p>
                      <strong>Expire le:</strong> {getExpirationDate()}
                    </p>
                    <p>
                      <strong>Permissions:</strong> {accessLevels.find(l => l.value === shareSettings.accessLevel)?.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Link className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Cliquez sur "Générer le lien" pour créer un lien de partage</p>
            </div>
          )}
        </div>

        {/* Email Sharing */}
        {linkGenerated && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partager par email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="email1@example.com, email2@example.com..."
              />
              <button
                onClick={sendByEmail}
                disabled={!emailList.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
          {linkGenerated && (
            <button
              onClick={() => {
                // Save share settings to backend
                console.log('Saving share settings:', shareSettings);
                onClose();
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Enregistrer les paramètres
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;