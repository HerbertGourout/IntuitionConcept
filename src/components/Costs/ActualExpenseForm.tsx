import React from "react";
import {
    Button,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Upload,
    UploadFile,
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

export interface CostItem {
    id: string;
    name: string;
    type: 'material' | 'labor' | 'equipment' | 'subcontractor' | 'other';
    estimatedQuantity: number;
    estimatedUnitPrice: number;
    unit: 'unit' | 'm2' | 'm3' | 'ml' | 'day' | 'hour';
}

export interface ExpenseFormValues {
    date: Dayjs;
    supplier?: string;
    invoiceNumber?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    notes?: string;
}

interface ActualExpenseFormProps {
    onSave: (values: ExpenseFormValues & { 
        costItemId: string; 
        date: string; 
        attachments: string[] 
    }) => void;
    costItem: CostItem;
}

export const ActualExpenseForm: React.FC<ActualExpenseFormProps> = ({
    onSave,
    costItem,
}) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = React.useState<UploadFile[]>([]);

    const onFinish = (formValues: ExpenseFormValues) => {
        const expense = {
            ...formValues,
            costItemId: costItem.id,
            date: formValues.date.format("YYYY-MM-DD"),
            attachments: fileList.map((file) => file.name || '').filter(Boolean),
        } as ExpenseFormValues & { costItemId: string; date: string; attachments: string[] };
        
        onSave(expense);
        form.resetFields();
        setFileList([]);
    };

    const uploadProps = {
        onRemove: (file: UploadFile) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
            return false;
        },
        beforeUpload: (file: UploadFile) => {
            setFileList(prevList => [...prevList, file]);
            return false;
        },
        fileList,
        multiple: true,
    };

    return (
        <div className="p-4">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    date: dayjs(),
                    quantity: costItem.estimatedQuantity,
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item<ExpenseFormValues>
                        name="date"
                        label="Date de la dépense"
                        rules={[{ required: true, message: "Ce champ est requis" }]}
                    >
                        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="reference"
                        label="Référence (N° facture/BL)"
                        rules={[{ required: true, message: "Ce champ est requis" }]}
                    >
                        <Input placeholder="Ex: FACT-2023-001" />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label={`Quantité (${costItem.unit})`}
                        rules={[{ required: true, message: "Ce champ est requis" }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            step={costItem.unit === "unit" ? 1 : 0.01}
                        />
                    </Form.Item>

                    <Form.Item
                        name="unitPrice"
                        label="Prix unitaire (FCFA)"
                        rules={[{ required: true, message: "Ce champ est requis" }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(value: string | number | undefined) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0'
                            }
                            parser={(value: string | undefined) =>
                                value ? parseInt(value.replace(/\s?FCFA|(,*)/g, ''), 10) || 0 : 0
                            }
                            step="1000"
                        />
                    </Form.Item>

                    <Form.Item<ExpenseFormValues>
                        name="total"
                        label="Total (FCFA)"
                        rules={[{ required: true, message: 'Ce champ est requis' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(value: string | number | undefined) => 
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0'
                            }
                            parser={(value: string | undefined) => 
                                value ? parseInt(value.replace(/\s?FCFA|(,*)/g, ''), 10) || 0 : 0
                            }
                            step="1000"
                        />
                    </Form.Item>

                    <Form.Item
                        name="supplier"
                        label="Fournisseur"
                        className="md:col-span-2"
                    >
                        <Input placeholder="Nom du fournisseur" />
                    </Form.Item>

                    <Form.Item name="notes" label="Notes" className="md:col-span-2">
                        <Input.TextArea
                            rows={2}
                            placeholder="Informations complémentaires..."
                        />
                    </Form.Item>

                    <Form.Item label="Pièces jointes" className="md:col-span-2">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>
                                Sélectionner des fichiers
                            </Button>
                        </Upload>
                    </Form.Item>
                </div>

                <Form.Item className="mt-4">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                        Enregistrer la dépense
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};
