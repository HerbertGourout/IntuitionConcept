import React, { useState } from 'react';
import type { CostItem } from '../../contexts/projectTypes';

interface CostManagementProps {
  costItems: CostItem[];
  onCostItemsChange: (items: CostItem[]) => void;
}

const CostManagement: React.FC<CostManagementProps> = ({ costItems, onCostItemsChange }) => {

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CostItem>>({ name: '', type: 'material', estimatedQuantity: 0, estimatedUnitPrice: 0, unit: 'unit' });

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.estimatedQuantity === undefined || newItem.estimatedUnitPrice === undefined) return;
    
    // Création d'un objet CostItem avec toutes les propriétés obligatoires définies
    const item: CostItem = {
      id: `cost-${Date.now()}`,
      name: newItem.name,
      type: newItem.type || 'material',
      estimatedQuantity: newItem.estimatedQuantity,
      estimatedUnitPrice: newItem.estimatedUnitPrice,
      unit: newItem.unit || 'unit',
      expenses: [],
      // Ajout des propriétés optionnelles si elles existent
      ...(newItem.notes && { notes: newItem.notes }),
      ...(newItem.actualQuantity !== undefined && { actualQuantity: newItem.actualQuantity }),
      ...(newItem.actualUnitPrice !== undefined && { actualUnitPrice: newItem.actualUnitPrice }),
      ...(newItem.actualTotal !== undefined && { actualTotal: newItem.actualTotal })
    };
    
    onCostItemsChange([...costItems, item]);
    setNewItem({ name: '', type: 'material', estimatedQuantity: 0, estimatedUnitPrice: 0, unit: 'unit' });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    onCostItemsChange(costItems.filter(item => item.id !== id));
  };

  const calculateTotals = (item: CostItem) => ({
    estimatedTotal: item.estimatedQuantity * item.estimatedUnitPrice,
    actualTotal: (item.actualQuantity || 0) * (item.actualUnitPrice || 0),
  });

  return (
    <div className="mt-4">
      <button onClick={() => setShowAddForm(true)} className="mb-4 bg-blue-500 text-white p-2 rounded">Ajouter poste de coût</button>
      {showAddForm && (
        <form onSubmit={handleAddOrUpdate} className="mb-4 p-4 border rounded">
          <input value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Nom" className="border p-2 mb-2 w-full" />
          <select 
            onChange={e => setNewItem({ 
              ...newItem, 
              type: e.target.value as 'material' | 'labor' | 'equipment' | 'subcontractor' | 'other' 
            })} 
            value={newItem.type || ''} 
            className="border p-2 mb-2 w-full"
          >
            <option value="material">Matériel</option>
            <option value="labor">Main d'œuvre</option>
          </select>
          <input type="number" value={newItem.estimatedQuantity || 0} onChange={e => setNewItem({ ...newItem, estimatedQuantity: parseFloat(e.target.value) })} placeholder="Qté estimée" className="border p-2 mb-2 w-full" />
          <button type="submit" className="bg-green-500 text-white p-2 rounded">Enregistrer</button>
          <button type="button" onClick={() => setShowAddForm(false)} className="ml-2 text-red-500">Annuler</button>
        </form>
      )}
      <ul>
        {costItems.map(item => {
          const { estimatedTotal, actualTotal } = calculateTotals(item);
          return (
            <li key={item.id} className="mb-2 p-2 border rounded flex justify-between">
              {item.name} - Est: {estimatedTotal} FCFA, Act: {actualTotal} FCFA
              <button onClick={() => handleDelete(item.id)} className="text-red-500">Supprimer</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CostManagement;
