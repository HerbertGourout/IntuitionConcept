import React, { useState } from 'react';
import type { Equipment, MaintenanceEvent } from '../../contexts/projectTypes';
import { Plus, Trash2 } from 'lucide-react';

interface MaintenanceHistorySectionProps {
  equipment: Equipment | null;
  onUpdate?: (equipment: Equipment) => void;
}

const emptyEvent: Omit<MaintenanceEvent, 'id'> = {
  date: '',
  type: '',
  description: '',
  operator: '',
};

export const MaintenanceHistorySection: React.FC<MaintenanceHistorySectionProps> = ({ equipment, onUpdate }) => {
  const [adding, setAdding] = useState(false);
  const [newEvent, setNewEvent] = useState(emptyEvent);

  if (!equipment) return null;
  const history = equipment.maintenanceHistory || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.type || !newEvent.description) return;
    const event: MaintenanceEvent = {
      ...newEvent,
      id: Date.now().toString(),
    };
    const updated = {
      ...equipment,
      maintenanceHistory: [...history, event],
    };
    if (onUpdate) {
      onUpdate(updated);
    }
    setNewEvent(emptyEvent);
    setAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = {
      ...equipment,
      maintenanceHistory: history.filter(ev => ev.id !== id),
    };
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  return (
    <div>
      <ul className="mb-2">
        {history.length === 0 && <li className="text-gray-500">Aucune maintenance enregistrée.</li>}
        {history.map(ev => (
          <li key={ev.id} className="flex items-center justify-between border-b py-1 text-sm">
            <span>
              <span className="font-medium">{ev.date}</span> – <span>{ev.type}</span> : {ev.description} {ev.operator && (<span className="text-gray-500">({ev.operator})</span>)}
            </span>
            <button onClick={() => handleDelete(ev.id)} className="ml-2 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-2">
          <input className="border rounded px-2 py-1" type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
          <input className="border rounded px-2 py-1" placeholder="Type (révision, réparation...)" value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} required />
          <input className="border rounded px-2 py-1" placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
          <input className="border rounded px-2 py-1" placeholder="Opérateur" value={newEvent.operator} onChange={e => setNewEvent({ ...newEvent, operator: e.target.value })} />
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700" type="submit">Ajouter</button>
            <button className="bg-gray-200 px-2 py-1 rounded" type="button" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="flex items-center gap-1 text-blue-700 hover:underline" onClick={() => setAdding(true)}>
          <Plus size={16} /> Ajouter une maintenance
        </button>
      )}
    </div>
  );
};

export default MaintenanceHistorySection;
