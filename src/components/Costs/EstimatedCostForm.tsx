import React from 'react';
import { Button, Form, Input, InputNumber, Select, Space, Card } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export interface CostFormValues {
  name: string;
  type: 'material' | 'labor' | 'equipment' | 'subcontractor' | 'other';
  description: string;
  estimatedQuantity: number;
  estimatedUnitPrice: number;
  estimatedTotal?: number;
  unit: 'unit' | 'm2' | 'm3' | 'ml' | 'day' | 'hour';
  notes?: string;
  status?: 'planned' | 'in_progress' | 'completed';
}

interface EstimatedCostFormProps {
  onSave: (values: CostFormValues) => void;
  initialValues?: Partial<CostFormValues>;
  projectId: string;
  phaseId?: string;
  taskId?: string;
}

export const EstimatedCostForm: React.FC<EstimatedCostFormProps> = ({
  onSave,
  initialValues,
  projectId,
  phaseId,
  taskId,
}) => {
  const [form] = Form.useForm();

  const costTypes = [
    { value: 'material', label: 'Matériel' },
    { value: 'labor', label: 'Main d\'œuvre' },
    { value: 'equipment', label: 'Équipement' },
    { value: 'subcontractor', label: 'Sous-traitance' },
    { value: 'other', label: 'Autre' },
  ];

  const units = [
    { value: 'unit', label: 'Unité' },
    { value: 'm2', label: 'm²' },
    { value: 'm3', label: 'm³' },
    { value: 'ml', label: 'ml' },
    { value: 'day', label: 'Jour' },
    { value: 'hour', label: 'Heure' },
  ];

  const onFinish = (values: CostFormValues) => {
    const costItem = {
      ...values,
      projectId,
      phaseId,
      taskId,
      estimatedTotal: values.estimatedQuantity * values.estimatedUnitPrice,
      status: 'planned' as const,
    };
    onSave(costItem);
    form.resetFields();
  };

  return (
    <Card title="Nouveau Poste de Coût Estimé" size="small">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="Désignation"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Input placeholder="Ex: Acier pour fondations" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type de coût"
          rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
        >
          <Select placeholder="Sélectionner un type">
            {costTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            name="estimatedQuantity"
            label="Quantité estimée"
            rules={[{ required: true, message: 'Ce champ est requis' }]}
            style={{ width: '150px' }}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0.00"
              step="0.01"
            />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unité"
            rules={[{ required: true, message: 'Ce champ est requis' }]}
            style={{ width: '120px' }}
          >
            <Select showSearch placeholder="Unité">
              {units.map((unit) => (
                <Option key={unit.value} value={unit.value}>
                  {unit.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="estimatedUnitPrice"
            label="Prix unitaire estimé (FCFA)"
            rules={[{ required: true, message: 'Ce champ est requis' }]}
            style={{ width: '200px' }}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value: string | number | undefined) => 
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0'
              }
              parser={(value: string | undefined) => 
                value ? parseInt(value.replace(/\s?FCFA|(,*)/g, ''), 10) || 0 : 0
              }
              step="1000"
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={2} placeholder="Détails supplémentaires..." />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
          >
            Enregistrer
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
