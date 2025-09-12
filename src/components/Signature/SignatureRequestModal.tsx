import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Upload, Space } from 'antd';
import type { UploadProps } from 'antd';
import { FileTextOutlined, UserOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { signatureService, SignatureField } from '../../services/signatureService';

interface SignatureRequestModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  documentId?: string;
  documentType?: 'quote' | 'contract' | 'invoice' | 'purchase_order';
  documentTitle?: string;
  documentUrl?: string;
}

// Form values type for this modal
interface SignatureFormValues {
  documentTitle: string;
  signerEmail: string;
  signerName: string;
  companyName?: string;
  documentUrl?: string;
  notes?: string;
}

const SignatureRequestModal: React.FC<SignatureRequestModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  documentId,
  documentType = 'quote',
  documentTitle,
  documentUrl
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: SignatureFormValues) => {
    try {
      setLoading(true);

      // Résoudre l'URL finale du document (prop prioritaire, sinon valeur du formulaire)
      const finalDocumentUrl: string | undefined = documentUrl ?? values.documentUrl;
      if (!finalDocumentUrl) {
        message.error("Veuillez fournir une URL de document à signer");
        setLoading(false);
        return;
      }

      // Créer la demande de signature
      const finalDocumentId: string = documentId ?? `doc_${Date.now()}`;
      const requestId = await signatureService.createSignatureRequest({
        documentId: finalDocumentId,
        documentType,
        documentTitle: values.documentTitle,
        signerEmail: values.signerEmail,
        signerName: values.signerName,
        companyName: values.companyName,
        documentUrl: finalDocumentUrl,
        metadata: {
          requestedBy: 'current_user', // À remplacer par l'utilisateur connecté
          notes: values.notes
        }
      });

      // Ajouter des champs de signature par défaut
      const defaultFields: SignatureField[] = [
        {
          id: 'signature_1',
          type: 'signature',
          x: 100,
          y: 700,
          width: 200,
          height: 50,
          page: 1,
          required: true,
          signerEmail: values.signerEmail
        },
        {
          id: 'date_1',
          type: 'date',
          x: 350,
          y: 700,
          width: 100,
          height: 30,
          page: 1,
          required: true,
          signerEmail: values.signerEmail
        }
      ];

      // Envoyer la demande
      await signatureService.sendSignatureRequest(requestId, defaultFields);

      message.success('Demande de signature envoyée avec succès !');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Erreur envoi signature:', error);
      message.error('Erreur lors de l\'envoi de la demande de signature');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.doc,.docx',
    beforeUpload: () => false, // Empêche l'upload automatique
    onChange: (info) => {
      const fileName = info.file?.name;
      if (fileName) {
        // Simuler l'URL du document uploadé
        const mockUrl = `https://storage.firebase.com/documents/${fileName}`;
        form.setFieldsValue({ documentUrl: mockUrl });
      }
    }
  };

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          Demande de Signature Électronique
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          documentTitle,
          documentType,
          documentUrl
        }}
      >
        <Form.Item
          name="documentTitle"
          label="Titre du document"
          rules={[{ required: true, message: 'Veuillez saisir le titre du document' }]}
        >
          <Input 
            prefix={<FileTextOutlined />}
            placeholder="Ex: Devis construction villa - Projet ABC"
          />
        </Form.Item>

        <Form.Item
          name="documentType"
          label="Type de document"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="quote">Devis</Select.Option>
            <Select.Option value="contract">Contrat</Select.Option>
            <Select.Option value="invoice">Facture</Select.Option>
            <Select.Option value="purchase_order">Bon de commande</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="signerName"
          label="Nom du signataire"
          rules={[{ required: true, message: 'Veuillez saisir le nom du signataire' }]}
        >
          <Input 
            prefix={<UserOutlined />}
            placeholder="Ex: Jean Dupont"
          />
        </Form.Item>

        <Form.Item
          name="signerEmail"
          label="Email du signataire"
          rules={[
            { required: true, message: 'Veuillez saisir l\'email du signataire' },
            { type: 'email', message: 'Format d\'email invalide' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />}
            placeholder="jean.dupont@example.com"
          />
        </Form.Item>

        <Form.Item
          name="companyName"
          label="Entreprise (optionnel)"
        >
          <Input placeholder="Ex: SARL Construction ABC" />
        </Form.Item>

        {!documentUrl && (
          <Form.Item
            name="documentUrl"
            label="Document à signer"
            rules={[{ required: true, message: 'Veuillez uploader le document' }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>
                  Sélectionner le document
                </Button>
              </Upload>
              <Input 
                placeholder="URL du document sera générée automatiquement"
                disabled
              />
            </Space>
          </Form.Item>
        )}

        <Form.Item
          name="notes"
          label="Notes (optionnel)"
        >
          <Input.TextArea 
            rows={3}
            placeholder="Message personnalisé pour le signataire..."
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
            >
              Envoyer la demande de signature
            </Button>
            <Button onClick={onCancel} size="large">
              Annuler
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        backgroundColor: '#f6ffed', 
        border: '1px solid #b7eb8f',
        borderRadius: 6 
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#52c41a' }}>
          📧 Le signataire recevra un email avec un lien sécurisé pour signer le document électroniquement.
          La signature sera juridiquement valide et traçable.
        </p>
      </div>
    </Modal>
  );
};

export default SignatureRequestModal;
