import React from 'react';
import { Modal, Timeline } from 'antd';

export interface ProjectHistoryEntry {
  date: string;
  action: string;
  user?: string;
  details?: string;
}

interface ProjectHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ProjectHistoryEntry[];
}

const ProjectHistoryModal: React.FC<ProjectHistoryModalProps> = ({ isOpen, onClose, history }) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title="Historique du projet"
      width={600}
    >
      <Timeline mode="left">
        {history.length === 0 && (
          <Timeline.Item color="gray">
            <span className="text-gray-500">Aucune activité pour ce projet.</span>
          </Timeline.Item>
        )}
        {history.map((entry, idx) => (
          <Timeline.Item key={idx} color="blue" label={new Date(entry.date).toLocaleString('fr-FR')}>
            <div>
              <strong>{entry.action}</strong>
              {entry.user && <span> par {entry.user}</span>}
              {entry.details && <div className="text-gray-600 text-xs mt-1">{entry.details}</div>}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Modal>
  );
};

export default ProjectHistoryModal;
