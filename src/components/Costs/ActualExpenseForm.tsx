import React, { useState } from "react";
import {
    Button,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Upload,
    UploadFile,
    message,
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import OCRScanner from "../OCR/OCRScanner";
import { ExtractedData } from "../../services/ocrService";
import { useSecureAction } from "../../hooks/useSecureAction";

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
    const [showOCRScanner, setShowOCRScanner] = useState(false);

    // Secure action to open OCR scanner (permission: expenses.create)
    const { execute: openScanner, canExecute: canScan } = useSecureAction(
        async () => {
            setShowOCRScanner(true);
        },
        'scan_invoice',
        {
            requiredPermissions: ['finances.edit'],
            resource: 'expense',
            logAction: true
        }
    );

    const handleOCRData = (data: ExtractedData, imageUrl?: string) => {
        // Map OCR extracted data to form fields
        const firstDate = data.dates?.[0];
        const parsedDate = firstDate ? dayjs(firstDate, [
            "DD/MM/YYYY",
            "D/M/YYYY",
            "YYYY-MM-DD",
            "YYYY/M/D",
            "D MMMM YYYY",
            "DD-MM-YYYY",
            "D-MM-YYYY"
        ], true) : null;

        form.setFieldsValue({
            supplier: data.vendorName || undefined,
            reference: data.invoiceNumber || undefined,
            total: data.total || undefined,
            date: parsedDate && parsedDate.isValid() ? parsedDate : undefined,
        });

        // Joindre automatiquement l'image scannée comme pièce jointe si disponible
        if (imageUrl) {
            const fileName = `scan-${Date.now()}.png`;
            const newFile: UploadFile = {
                uid: `${Date.now()}`,
                name: fileName,
                status: 'done',
                url: imageUrl,
                thumbUrl: imageUrl,
            } as UploadFile;
            setFileList(prev => [...prev, newFile]);
        }

        // Feedback utilisateur
        message.success("Données extraites automatiquement depuis le document scanné.");

        // Auto-save si tous les champs obligatoires sont remplis
        const formValues = form.getFieldsValue();
        const hasRequiredFields = formValues.date && formValues.total && formValues.reference;
        
        if (hasRequiredFields && data.total && data.invoiceNumber) {
            // Attendre un court délai pour que les champs soient mis à jour
            setTimeout(() => {
                const finalValues = form.getFieldsValue();
                if (finalValues.date && finalValues.total && finalValues.reference) {
                    message.info("Sauvegarde automatique en cours...");
                    onFinish(finalValues);
                }
            }, 500);
        }

        setShowOCRScanner(false);
    };

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
                    <div className="md:col-span-2 flex justify-between gap-2">
                        <Button
                            onClick={() => {
                                const quantity = form.getFieldValue('quantity');
                                const total = form.getFieldValue('total');
                                if (!quantity || quantity <= 0) {
                                    message.error("Quantité invalide pour répartir le total.");
                                    return;
                                }
                                if (!total || total <= 0) {
                                    message.error("Veuillez saisir un total valide.");
                                    return;
                                }
                                const unitPrice = Math.round((total / quantity) * 100) / 100;
                                form.setFieldsValue({ unitPrice });
                                message.success("Prix unitaire calculé à partir du total et de la quantité.");
                            }}
                        >
                            Répartir le total → PU
                        </Button>
                        <Button onClick={openScanner} disabled={!canScan} title={!canScan ? "Permission 'expenses.create' requise" : undefined}>
                            Scanner une facture
                        </Button>
                    </div>
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
            <OCRScanner
                isOpen={showOCRScanner}
                onClose={() => setShowOCRScanner(false)}
                onDataExtracted={(data, image) => handleOCRData(data, image)}
                title="Scanner une facture"
            />
        </div>
    );
};
