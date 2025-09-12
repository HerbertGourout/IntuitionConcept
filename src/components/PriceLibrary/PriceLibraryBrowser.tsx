import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Table, Button, Space, Tag, Tooltip, message, Modal, Form } from 'antd';
import { 
  PlusOutlined, 
  DollarOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  EditOutlined
} from '@ant-design/icons';
import { priceLibraryService, PriceItem, Trade } from '../../services/priceLibraryService';

const { Search } = Input;
const { Option } = Select;

// Form values type for adding a price item (replaces `any`)
interface PriceFormValues {
  code: string;
  designation: string;
  unit: string;
  unitPrice: number | string;
  currency: 'XOF' | 'XAF' | 'MAD' | 'USD' | 'EUR';
  category: string;
  subcategory?: string;
  trade: string;
  region: string;
  country: string;
  description?: string;
}

interface PriceLibraryBrowserProps {
  onSelectItem?: (item: PriceItem) => void;
  selectionMode?: boolean;
}

const PriceLibraryBrowser: React.FC<PriceLibraryBrowserProps> = ({
  onSelectItem,
  selectionMode = false
}) => {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Filtres
  const [filters, setFilters] = useState({
    searchTerm: '',
    trade: '',
    category: '',
    region: '',
    country: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchItems();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      // Initialiser la bibliothèque si nécessaire
      await priceLibraryService.initializePriceLibrary();
      
      // Charger les données de référence
      const tradesData = priceLibraryService.getTrades();
      const regionsData = await priceLibraryService.getAvailableRegions();
      const countriesData = await priceLibraryService.getAvailableCountries();
      
      setTrades(tradesData);
      setRegions(regionsData);
      setCountries(countriesData);
      
      // Charger les items
      searchItems();
    } catch (error) {
      console.error('Erreur chargement données:', error);
      message.error('Erreur lors du chargement de la bibliothèque');
    }
  };

  const searchItems = async () => {
    setLoading(true);
    try {
      const results = await priceLibraryService.searchPriceItems({
        ...filters,
        limit: 100
      });
      setItems(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
      message.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (values: PriceFormValues) => {
    try {
      await priceLibraryService.addPriceItem({
        code: values.code,
        designation: values.designation,
        unit: values.unit,
        unitPrice: parseFloat(String(values.unitPrice)),
        currency: values.currency,
        category: values.category,
        subcategory: values.subcategory || values.category,
        trade: values.trade,
        region: values.region,
        country: values.country,
        source: 'user',
        description: values.description
      });

      message.success('Prix ajouté avec succès');
      setAddModalVisible(false);
      form.resetFields();
      searchItems();
    } catch (error) {
      console.error('Erreur ajout prix:', error);
      message.error('Erreur lors de l\'ajout du prix');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XOF' ? 'XOF' : 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSourceTag = (source: PriceItem['source']) => {
    const sourceConfig = {
      official: { color: 'green', text: 'Officiel' },
      market: { color: 'blue', text: 'Marché' },
      user: { color: 'orange', text: 'Utilisateur' },
      ai_estimated: { color: 'purple', text: 'IA Estimé' }
    };
    
    const config = sourceConfig[source];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {code}
        </span>
      )
    },
    {
      title: 'Désignation',
      dataIndex: 'designation',
      key: 'designation',
      render: (designation: string, record: PriceItem) => (
        <Space direction="vertical" size="small">
          <span style={{ fontWeight: 500 }}>{designation}</span>
          {record.description && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.description}
            </span>
          )}
        </Space>
      )
    },
    {
      title: 'Prix Unitaire',
      key: 'price',
      render: (record: PriceItem) => (
        <Space direction="vertical" size="small">
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {formatPrice(record.unitPrice, record.currency)}
          </span>
          <span style={{ fontSize: '11px', color: '#999' }}>
            par {record.unit}
          </span>
        </Space>
      )
    },
    {
      title: 'Métier',
      dataIndex: 'trade',
      key: 'trade',
      render: (trade: string) => {
        const tradeData = trades.find(t => t.id === trade);
        return (
          <Tag color="blue">
            {tradeData?.icon} {tradeData?.name || trade}
          </Tag>
        );
      }
    },
    {
      title: 'Localisation',
      key: 'location',
      render: (record: PriceItem) => (
        <Space direction="vertical" size="small">
          <span style={{ fontSize: '12px' }}>
            <EnvironmentOutlined /> {record.region}
          </span>
          <span style={{ fontSize: '11px', color: '#666' }}>
            {record.country}
          </span>
        </Space>
      )
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: PriceItem['source']) => getSourceTag(source)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: PriceItem) => (
        <Space>
          {selectionMode ? (
            <Button 
              type="primary" 
              size="small"
              onClick={() => onSelectItem?.(record)}
            >
              Sélectionner
            </Button>
          ) : (
            <Tooltip title="Modifier">
              <Button 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => {
                  // TODO: Ouvrir modal d'édition
                  message.info('Édition à implémenter');
                }}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Filtres de recherche */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Rechercher par désignation, code..."
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
            onChange={(e) => {
              if (!e.target.value) {
                setFilters(prev => ({ ...prev, searchTerm: '' }));
              }
            }}
          />
          
          <Select
            placeholder="Métier"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilters(prev => ({ ...prev, trade: value || '' }))}
          >
            {trades.map(trade => (
              <Option key={trade.id} value={trade.id}>
                {trade.icon} {trade.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Région"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setFilters(prev => ({ ...prev, region: value || '' }))}
          >
            {regions.map(region => (
              <Option key={region} value={region}>{region}</Option>
            ))}
          </Select>

          <Select
            placeholder="Pays"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setFilters(prev => ({ ...prev, country: value || '' }))}
          >
            {countries.map(country => (
              <Option key={country} value={country}>{country}</Option>
            ))}
          </Select>

          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Ajouter un prix
          </Button>
        </Space>
      </Card>

      {/* Statistiques */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Tag color="blue">
            <DollarOutlined /> {items.length} prix disponibles
          </Tag>
          <Tag color="green">
            <ToolOutlined /> {trades.length} métiers
          </Tag>
          <Tag color="orange">
            <EnvironmentOutlined /> {regions.length} régions
          </Tag>
        </Space>
      </div>

      {/* Tableau des prix */}
      <Card>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total: ${total} prix`
          }}
          locale={{
            emptyText: 'Aucun prix trouvé'
          }}
        />
      </Card>

      {/* Modal d'ajout de prix */}
      <Modal
        title="Ajouter un nouveau prix"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddItem}
        >
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Code requis' }]}
          >
            <Input placeholder="Ex: GO001" />
          </Form.Item>

          <Form.Item
            name="designation"
            label="Désignation"
            rules={[{ required: true, message: 'Désignation requise' }]}
          >
            <Input placeholder="Ex: Béton dosé à 350kg/m³" />
          </Form.Item>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="unitPrice"
              label="Prix unitaire"
              rules={[{ required: true, message: 'Prix requis' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" placeholder="85000" />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Devise"
              rules={[{ required: true }]}
              style={{ width: 100 }}
            >
              <Select>
                <Option value="XOF">XOF</Option>
                <Option value="XAF">XAF</Option>
                <Option value="MAD">MAD</Option>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="unit"
              label="Unité"
              rules={[{ required: true }]}
              style={{ width: 100 }}
            >
              <Select>
                <Option value="m³">m³</Option>
                <Option value="m²">m²</Option>
                <Option value="ml">ml</Option>
                <Option value="kg">kg</Option>
                <Option value="unité">unité</Option>
                <Option value="sac">sac</Option>
                <Option value="litre">litre</Option>
              </Select>
            </Form.Item>
          </Space.Compact>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="trade"
              label="Métier"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select>
                {trades.map(trade => (
                  <Option key={trade.id} value={trade.id}>
                    {trade.icon} {trade.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label="Catégorie"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Ex: beton" />
            </Form.Item>
          </Space.Compact>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="region"
              label="Région"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select>
                {regions.map(region => (
                  <Option key={region} value={region}>{region}</Option>
                ))}
                <Option value="Autre">Autre région</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="country"
              label="Pays"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select>
                {countries.map(country => (
                  <Option key={country} value={country}>{country}</Option>
                ))}
                <Option value="Autre">Autre pays</Option>
              </Select>
            </Form.Item>
          </Space.Compact>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={2} placeholder="Description détaillée..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Ajouter le prix
              </Button>
              <Button onClick={() => {
                setAddModalVisible(false);
                form.resetFields();
              }}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PriceLibraryBrowser;
