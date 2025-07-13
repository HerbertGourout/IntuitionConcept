import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Avatar, Tag, Space, Tabs, Row, Col, Statistic } from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CrownOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'project_manager' | 'supervisor' | 'worker' | 'client';
  speciality: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  projectsCount: number;
  avatar?: string;
}

interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

const Team: React.FC = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form] = Form.useForm();

  // Données de démonstration
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@construction.com',
      phone: '+33 6 12 34 56 78',
      role: 'admin',
      speciality: 'Direction générale',
      status: 'active',
      joinDate: '2023-01-15',
      projectsCount: 5,
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@construction.com',
      phone: '+33 6 23 45 67 89',
      role: 'project_manager',
      speciality: 'Gestion de projet',
      status: 'active',
      joinDate: '2023-03-20',
      projectsCount: 3,
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@construction.com',
      phone: '+33 6 34 56 78 90',
      role: 'supervisor',
      speciality: 'Supervision chantier',
      status: 'active',
      joinDate: '2023-06-10',
      projectsCount: 2,
    },
    {
      id: '4',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@construction.com',
      phone: '+33 6 45 67 89 01',
      role: 'worker',
      speciality: 'Maçonnerie',
      status: 'on_leave',
      joinDate: '2023-08-05',
      projectsCount: 1,
    },
  ];

  const roles: Role[] = [
    {
      key: 'admin',
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: ['all'],
      color: 'red',
    },
    {
      key: 'project_manager',
      name: 'Chef de projet',
      description: 'Gestion complète des projets assignés',
      permissions: ['projects', 'tasks', 'team', 'documents', 'finances'],
      color: 'blue',
    },
    {
      key: 'supervisor',
      name: 'Superviseur',
      description: 'Supervision des équipes sur le terrain',
      permissions: ['tasks', 'equipment', 'documents'],
      color: 'green',
    },
    {
      key: 'worker',
      name: 'Ouvrier',
      description: 'Exécution des tâches assignées',
      permissions: ['tasks', 'documents'],
      color: 'orange',
    },
    {
      key: 'client',
      name: 'Client',
      description: 'Consultation des projets',
      permissions: ['view_projects', 'documents'],
      color: 'purple',
    },
  ];

  const getRoleInfo = (roleKey: string) => {
    return roles.find(role => role.key === roleKey) || roles[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'on_leave': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'on_leave': return 'En congé';
      default: return status;
    }
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: 'Membre',
      key: 'member',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">{record.speciality}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div className="flex items-center space-x-1 text-sm">
            <MailOutlined />
            <span>{record.email}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <PhoneOutlined />
            <span>{record.phone}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleInfo = getRoleInfo(role);
        return <Tag color={roleInfo.color}>{roleInfo.name}</Tag>;
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
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
    setEditingMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    form.setFieldsValue(member);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Supprimer le membre',
      content: 'Êtes-vous sûr de vouloir supprimer ce membre de l\'équipe ?',
      okText: 'Supprimer',
      cancelText: 'Annuler',
      okType: 'danger',
      onOk: () => {
        console.log('Suppression du membre:', id);
        // Ici, vous ajouteriez la logique de suppression
      },
    });
  };

  const handleSubmit = (values: Omit<TeamMember, 'id' | 'projectsCount'>) => {
    console.log('Sauvegarde du membre:', values);
    // Ici, vous ajouteriez la logique de sauvegarde
    setIsModalVisible(false);
    form.resetFields();
  };

  const membersTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion de l'équipe</h2>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAdd}
        >
          Ajouter un membre
        </Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total membres"
              value={teamMembers.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Membres actifs"
              value={teamMembers.filter(m => m.status === 'active').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="En congé"
              value={teamMembers.filter(m => m.status === 'on_leave').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Projets moyens"
              value={Math.round(teamMembers.reduce((acc, m) => acc + m.projectsCount, 0) / teamMembers.length)}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={teamMembers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );

  const rolesTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rôles et permissions</h2>
      </div>

      <Row gutter={16}>
        {roles.map(role => (
          <Col span={12} key={role.key} className="mb-4">
            <Card
              title={
                <div className="flex items-center space-x-2">
                  <Tag color={role.color}>{role.name}</Tag>
                  {role.key === 'admin' && <CrownOutlined className="text-yellow-500" />}
                </div>
              }
            >
              <p className="text-gray-600 mb-3">{role.description}</p>
              <div>
                <strong>Permissions:</strong>
                <div className="mt-2">
                  {role.permissions.map(permission => (
                    <Tag key={permission} className="mb-1">
                      {permission === 'all' ? 'Toutes les permissions' : permission}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <strong>Membres:</strong> {teamMembers.filter(m => m.role === role.key).length}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const items = [
    {
      key: 'members',
      label: 'Membres',
      children: membersTab,
      icon: <TeamOutlined />,
    },
    {
      key: 'roles',
      label: 'Rôles',
      children: rolesTab,
      icon: <CrownOutlined />,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion d'équipe</h1>
        <p className="text-gray-600">Gérez les membres de votre équipe et leurs permissions</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        type="card"
      />

      <Modal
        title={editingMember ? 'Modifier le membre' : 'Ajouter un membre'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
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
                label="Nom complet"
                rules={[{ required: true, message: 'Le nom est requis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'L\'email est requis' },
                  { type: 'email', message: 'Format d\'email invalide' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Téléphone"
                rules={[{ required: true, message: 'Le téléphone est requis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="speciality"
                label="Spécialité"
                rules={[{ required: true, message: 'La spécialité est requise' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Rôle"
                rules={[{ required: true, message: 'Le rôle est requis' }]}
              >
                <Select>
                  {roles.map(role => (
                    <Option key={role.key} value={role.key}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Statut"
                rules={[{ required: true, message: 'Le statut est requis' }]}
              >
                <Select>
                  <Option value="active">Actif</Option>
                  <Option value="inactive">Inactif</Option>
                  <Option value="on_leave">En congé</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalVisible(false)}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit">
              {editingMember ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Team;
