import React from 'react';
import { Button, Space, Divider } from 'antd';
import { Send, Trash2, Edit, Copy } from 'lucide-react';
import { useSecureAction } from '../../hooks/useSecureAction';
import { useAuth } from '../../contexts/AuthContext';

interface SecureQuoteActionsProps {
  quoteId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
  onDuplicate?: () => void;
}

const SecureQuoteActions: React.FC<SecureQuoteActionsProps> = ({
  quoteId,
  onEdit,
  onDelete,
  onSend,
  onDuplicate
}) => {
  const { user } = useAuth();

  // Action sécurisée pour éditer un devis
  const { execute: executeEdit, canExecute: canEdit } = useSecureAction(
    async () => {
      console.log(`Édition du devis ${quoteId}`);
      onEdit?.();
    },
    'edit_quote',
    {
      requiredPermissions: ['quotes.edit'],
      resource: 'quote',
      resourceId: quoteId,
      logAction: true
    }
  );

  // Action sécurisée pour supprimer un devis (nécessite auth récente)
  const { execute: executeDelete, canExecute: canDelete } = useSecureAction(
    async () => {
      console.log(`Suppression du devis ${quoteId}`);
      onDelete?.();
    },
    'delete_quote',
    {
      requiredPermissions: ['quotes.delete'],
      requireRecentAuth: true,
      maxAuthAge: 15 * 60 * 1000, // 15 minutes
      resource: 'quote',
      resourceId: quoteId,
      logAction: true
    }
  );

  // Action sécurisée pour envoyer un devis
  const { execute: executeSend, canExecute: canSend } = useSecureAction(
    async () => {
      console.log(`Envoi du devis ${quoteId}`);
      onSend?.();
    },
    'send_quote',
    {
      requiredPermissions: ['quotes.send'],
      resource: 'quote',
      resourceId: quoteId,
      logAction: true
    }
  );

  // Action sécurisée pour dupliquer un devis
  const { execute: executeDuplicate, canExecute: canDuplicate } = useSecureAction(
    async () => {
      console.log(`Duplication du devis ${quoteId}`);
      onDuplicate?.();
    },
    'duplicate_quote',
    {
      requiredPermissions: ['quotes.create'],
      resource: 'quote',
      resourceId: quoteId,
      logAction: true
    }
  );

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Actions sécurisées sur le devis
        </h3>
        <p className="text-sm text-blue-600 mb-3">
          Votre rôle: <strong>{user.role}</strong>
        </p>
        
        <Space wrap>
          <Button
            type="default"
            icon={<Edit className="w-4 h-4" />}
            onClick={executeEdit}
            disabled={!canEdit}
            title={!canEdit ? "Permission 'quotes.edit' requise" : "Éditer le devis"}
          >
            Éditer
          </Button>

          <Button
            type="primary"
            icon={<Send className="w-4 h-4" />}
            onClick={executeSend}
            disabled={!canSend}
            title={!canSend ? "Permission 'quotes.send' requise" : "Envoyer le devis"}
          >
            Envoyer
          </Button>

          <Button
            type="default"
            icon={<Copy className="w-4 h-4" />}
            onClick={executeDuplicate}
            disabled={!canDuplicate}
            title={!canDuplicate ? "Permission 'quotes.create' requise" : "Dupliquer le devis"}
          >
            Dupliquer
          </Button>

          <Button
            type="primary"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={executeDelete}
            disabled={!canDelete}
            title={!canDelete ? "Permission 'quotes.delete' et auth récente requises" : "Supprimer le devis (auth récente requise)"}
          >
            Supprimer
          </Button>
        </Space>
      </div>

      <Divider />

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Permissions actuelles:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className={`p-2 rounded ${canEdit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Édition: {canEdit ? '✓ Autorisée' : '✗ Refusée'}
          </div>
          <div className={`p-2 rounded ${canSend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Envoi: {canSend ? '✓ Autorisée' : '✗ Refusée'}
          </div>
          <div className={`p-2 rounded ${canDuplicate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Duplication: {canDuplicate ? '✓ Autorisée' : '✗ Refusée'}
          </div>
          <div className={`p-2 rounded ${canDelete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Suppression: {canDelete ? '✓ Autorisée' : '✗ Refusée'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureQuoteActions;
