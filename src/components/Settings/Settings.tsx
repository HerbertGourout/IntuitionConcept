import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Select, Switch, Button, Divider, Row, Col, Upload, message } from 'antd';
import { 
  SettingOutlined, 
  BellOutlined, 
  SecurityScanOutlined,
  DatabaseOutlined,
  UploadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Option } = Select;

interface AppSettings {
  general: {
    companyName: string;
    companyLogo?: string;
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
    projectUpdates: boolean;
    budgetAlerts: boolean;
    maintenanceAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: 'basic' | 'medium' | 'strong';
    loginAttempts: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number;
    cloudBackup: boolean;
  };
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Données de configuration par défaut
  const [settings] = useState<AppSettings>({
    general: {
      companyName: 'Construction BTP Congo',
      language: 'fr',
      timezone: 'Africa/Brazzaville',
      currency: 'FCFA',
      dateFormat: 'DD/MM/YYYY',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      projectUpdates: true,
      budgetAlerts: true,
      maintenanceAlerts: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'medium',
      loginAttempts: 5,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30,
      cloudBackup: true,
    },
  });

  const handleSave = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      console.log('Sauvegarde des paramètres:', values);
      // Ici, vous ajouteriez la logique de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      message.success('Paramètres sauvegardés avec succès');
    } catch {
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'logo',
    listType: 'picture',
    maxCount: 1,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Vous ne pouvez télécharger que des images!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('L\'image doit faire moins de 2MB!');
      }
      return isImage && isLt2M;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} téléchargé avec succès`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} échec du téléchargement.`);
      }
    },
  };

  const generalTab = (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={settings.general}
        onFinish={handleSave}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="companyName"
              label="Nom de l'entreprise"
              rules={[{ required: true, message: 'Le nom de l\'entreprise est requis' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Logo de l'entreprise">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Télécharger le logo</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="language"
              label="Langue"
              rules={[{ required: true, message: 'La langue est requise' }]}
            >
              <Select>
                <Option value="fr">Français</Option>
                <Option value="en">English</Option>
                <Option value="pt">Português</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timezone"
              label="Fuseau horaire"
              rules={[{ required: true, message: 'Le fuseau horaire est requis' }]}
            >
              <Select>
                <Option value="Africa/Brazzaville">Brazzaville (WAT)</Option>
                <Option value="Africa/Kinshasa">Kinshasa (WAT)</Option>
                <Option value="Europe/Paris">Paris (CET)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Devise"
              rules={[{ required: true, message: 'La devise est requise' }]}
            >
              <Select>
                <Option value="FCFA">FCFA</Option>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateFormat"
              label="Format de date"
              rules={[{ required: true, message: 'Le format de date est requis' }]}
            >
              <Select>
                <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Sauvegarder
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const notificationsTab = (
    <Card>
      <Form
        layout="vertical"
        initialValues={settings.notifications}
        onFinish={handleSave}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Notifications générales</h3>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="emailNotifications" valuePropName="checked">
                  <div className="flex items-center justify-between">
                    <span>Notifications par email</span>
                    <Switch />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="pushNotifications" valuePropName="checked">
                  <div className="flex items-center justify-between">
                    <span>Notifications push</span>
                    <Switch />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          <div>
            <h3 className="text-lg font-medium mb-4">Notifications spécifiques</h3>
            <div className="space-y-3">
              <Form.Item name="taskReminders" valuePropName="checked">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Rappels de tâches</span>
                    <p className="text-sm text-gray-500">Recevoir des rappels pour les tâches à échéance</p>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="projectUpdates" valuePropName="checked">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Mises à jour de projets</span>
                    <p className="text-sm text-gray-500">Notifications lors des changements de statut</p>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="budgetAlerts" valuePropName="checked">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Alertes budgétaires</span>
                    <p className="text-sm text-gray-500">Alertes en cas de dépassement de budget</p>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="maintenanceAlerts" valuePropName="checked">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Alertes de maintenance</span>
                    <p className="text-sm text-gray-500">Rappels pour la maintenance des équipements</p>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </div>
          </div>
        </div>

        <Form.Item className="mt-6">
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Sauvegarder
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const securityTab = (
    <Card>
      <Form
        layout="vertical"
        initialValues={settings.security}
        onFinish={handleSave}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Authentification</h3>
            <Form.Item name="twoFactorAuth" valuePropName="checked">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Authentification à deux facteurs</span>
                  <p className="text-sm text-gray-500">Sécurité renforcée avec code SMS/Email</p>
                </div>
                <Switch />
              </div>
            </Form.Item>
          </div>

          <Divider />

          <div>
            <h3 className="text-lg font-medium mb-4">Sessions et mots de passe</h3>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="sessionTimeout"
                  label="Délai d'expiration de session (minutes)"
                  rules={[{ required: true, message: 'Le délai est requis' }]}
                >
                  <Select>
                    <Option value={15}>15 minutes</Option>
                    <Option value={30}>30 minutes</Option>
                    <Option value={60}>1 heure</Option>
                    <Option value={120}>2 heures</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="loginAttempts"
                  label="Tentatives de connexion autorisées"
                  rules={[{ required: true, message: 'Le nombre de tentatives est requis' }]}
                >
                  <Select>
                    <Option value={3}>3 tentatives</Option>
                    <Option value={5}>5 tentatives</Option>
                    <Option value={10}>10 tentatives</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="passwordPolicy"
              label="Politique de mot de passe"
              rules={[{ required: true, message: 'La politique est requise' }]}
            >
              <Select>
                <Option value="basic">Basique (8 caractères minimum)</Option>
                <Option value="medium">Moyenne (8 caractères + majuscules/chiffres)</Option>
                <Option value="strong">Forte (12 caractères + caractères spéciaux)</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Sauvegarder
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const backupTab = (
    <Card>
      <Form
        layout="vertical"
        initialValues={settings.backup}
        onFinish={handleSave}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Sauvegarde automatique</h3>
            <Form.Item name="autoBackup" valuePropName="checked">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Activer la sauvegarde automatique</span>
                  <p className="text-sm text-gray-500">Sauvegarde régulière de vos données</p>
                </div>
                <Switch />
              </div>
            </Form.Item>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="backupFrequency"
                label="Fréquence de sauvegarde"
                rules={[{ required: true, message: 'La fréquence est requise' }]}
              >
                <Select>
                  <Option value="daily">Quotidienne</Option>
                  <Option value="weekly">Hebdomadaire</Option>
                  <Option value="monthly">Mensuelle</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="retentionPeriod"
                label="Période de rétention (jours)"
                rules={[{ required: true, message: 'La période est requise' }]}
              >
                <Select>
                  <Option value={7}>7 jours</Option>
                  <Option value={30}>30 jours</Option>
                  <Option value={90}>90 jours</Option>
                  <Option value={365}>1 an</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="cloudBackup" valuePropName="checked">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Sauvegarde cloud</span>
                <p className="text-sm text-gray-500">Stockage sécurisé dans le cloud</p>
              </div>
              <Switch />
            </div>
          </Form.Item>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Actions manuelles</h4>
            <div className="space-x-2">
              <Button type="default">
                Créer une sauvegarde maintenant
              </Button>
              <Button type="default">
                Restaurer depuis une sauvegarde
              </Button>
            </div>
          </div>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Sauvegarder
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const items = [
    {
      key: 'general',
      label: 'Général',
      children: generalTab,
      icon: <SettingOutlined />,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: notificationsTab,
      icon: <BellOutlined />,
    },
    {
      key: 'security',
      label: 'Sécurité',
      children: securityTab,
      icon: <SecurityScanOutlined />,
    },
    {
      key: 'backup',
      label: 'Sauvegarde',
      children: backupTab,
      icon: <DatabaseOutlined />,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Paramètres de l'application</h1>
        <p className="text-gray-600">Configurez les paramètres généraux, notifications et sécurité</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        type="card"
      />
    </div>
  );
};

export default Settings;
