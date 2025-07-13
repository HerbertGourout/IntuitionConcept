import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Tabs, Row, Col, Statistic, Descriptions } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EnvironmentOutlined,
  HomeOutlined,
  CompassOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;

interface Location {
  id: string;
  name: string;
  type: 'site' | 'office' | 'warehouse' | 'depot';
  address: string;
  city: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  projectsCount: number;
  equipmentCount: number;
  description?: string;
  contact?: {
    name: string;
    phone: string;
  };
}

const Locations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [form] = Form.useForm();

  // Données de localisation : initialement vide ou à remplir par l'utilisateur
  const locations: Location[] = [];

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'site':
        return { label: 'Chantier', color: 'blue', icon: <EnvironmentOutlined /> };
      case 'office':
        return { label: 'Bureau', color: 'green', icon: <HomeOutlined /> };
      case 'warehouse':
        return { label: 'Entrepôt', color: 'orange', icon: <HomeOutlined /> };
      case 'depot':
        return { label: 'Dépôt', color: 'purple', icon: <CompassOutlined /> };
      default:
        return { label: type, color: 'default', icon: <EnvironmentOutlined /> };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Actif', color: 'green' };
      case 'inactive':
        return { label: 'Inactif', color: 'red' };
      case 'maintenance':
        return { label: 'Maintenance', color: 'orange' };
      default:
        return { label: status, color: 'default' };
    }
  };

  const columns: ColumnsType<Location> = [
    {
      title: 'Localisation',
      key: 'location',
      render: (_, record) => {
        const typeInfo = getTypeInfo(record.type);
        return (
          <div className="flex items-center space-x-3">
            <div className="text-blue-500 text-lg">
              {typeInfo.icon}
            </div>
            <div>
              <div className="font-medium">{record.name}</div>
              <div className="text-sm text-gray-500">{record.city}, {record.region}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeInfo = getTypeInfo(type);
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
    },
    {
      title: 'Adresse',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <div className="max-w-xs truncate" title={address}>
          {address}
        </div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = getStatusInfo(status);
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: 'Projets',
      dataIndex: 'projectsCount',
      key: 'projectsCount',
      render: (count: number) => (
        <span className="font-medium">{count}</span>
      ),
    },
    {
      title: 'Équipements',
      dataIndex: 'equipmentCount',
      key: 'equipmentCount',
      render: (count: number) => (
        <span className="font-medium">{count}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingLocation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    form.setFieldsValue({
      ...location,
      contactName: location.contact?.name,
      contactPhone: location.contact?.phone,
      lat: location.coordinates?.lat,
      lng: location.coordinates?.lng,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Supprimer la localisation',
      content: 'Êtes-vous sûr de vouloir supprimer cette localisation ?',
      okText: 'Supprimer',
      cancelText: 'Annuler',
      okType: 'danger',
      onOk: () => {
        console.log('Suppression de la localisation:', id);
        // Ici, vous ajouteriez la logique de suppression
      },
    });
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    const locationData = {
      ...values,
      coordinates: values.lat && values.lng ? {
        lat: parseFloat(values.lat as string),
        lng: parseFloat(values.lng as string)
      } : undefined,
      contact: values.contactName || values.contactPhone ? {
        name: values.contactName,
        phone: values.contactPhone
      } : undefined,
    };
    
    console.log('Sauvegarde de la localisation:', locationData);
    // Ici, vous ajouteriez la logique de sauvegarde
    setIsModalVisible(false);
    form.resetFields();
  };

  const locationsTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des localisations</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Ajouter une localisation
        </Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total localisations"
              value={locations.length}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sites actifs"
              value={locations.filter(l => l.status === 'active').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Projets totaux"
              value={locations.reduce((acc, l) => acc + l.projectsCount, 0)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Équipements totaux"
              value={locations.reduce((acc, l) => acc + l.equipmentCount, 0)}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={locations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4 bg-gray-50">
                <Descriptions title="Détails" column={2}>
                  <Descriptions.Item label="Description">
                    {record.description || 'Aucune description'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact">
                    {record.contact ? `${record.contact.name} - ${record.contact.phone}` : 'Aucun contact'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Coordonnées">
                    {record.coordinates ? 
                      `${record.coordinates.lat}, ${record.coordinates.lng}` : 
                      'Non renseignées'
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="Adresse complète">
                    {`${record.address}, ${record.city}, ${record.region}`}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );

  const mapTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Carte des localisations</h2>
      </div>

      <Card>
        <div className="text-center text-gray-500 py-16">
          <EnvironmentOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <h3 className="text-lg font-medium mb-2">Carte interactive à venir</h3>
          <p>Intégration avec Google Maps ou OpenStreetMap prévue</p>
          <p className="text-sm mt-2">
            Fonctionnalités prévues :
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Visualisation des sites sur carte</li>
            <li>• Calcul d'itinéraires</li>
            <li>• Géolocalisation des équipements</li>
            <li>• Zones de couverture</li>
          </ul>
        </div>
      </Card>
    </div>
  );

  const items = [
    {
      key: 'locations',
      label: 'Localisations',
      children: locationsTab,
      icon: <EnvironmentOutlined />,
    },
    {
      key: 'map',
      label: 'Carte',
      children: mapTab,
      icon: <EnvironmentOutlined />,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des localisations</h1>
        <p className="text-gray-600">Gérez vos sites, bureaux, entrepôts et dépôts</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        type="card"
      />

      <Modal
        title={editingLocation ? 'Modifier la localisation' : 'Ajouter une localisation'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nom de la localisation"
                rules={[{ required: true, message: 'Le nom est requis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Le type est requis' }]}
              >
                <Select>
                  <Option value="site">Chantier</Option>
                  <Option value="office">Bureau</Option>
                  <Option value="warehouse">Entrepôt</Option>
                  <Option value="depot">Dépôt</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Adresse"
            rules={[{ required: true, message: 'L\'adresse est requise' }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Ville"
                rules={[{ required: true, message: 'La ville est requise' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="region"
                label="Région"
                rules={[{ required: true, message: 'La région est requise' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Statut"
                rules={[{ required: true, message: 'Le statut est requis' }]}
              >
                <Select>
                  <Option value="active">Actif</Option>
                  <Option value="inactive">Inactif</Option>
                  <Option value="maintenance">Maintenance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lat"
                label="Latitude"
              >
                <Input type="number" step="any" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lng"
                label="Longitude"
              >
                <Input type="number" step="any" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactName"
                label="Nom du contact"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="Téléphone du contact"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalVisible(false)}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit">
              {editingLocation ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Locations;
