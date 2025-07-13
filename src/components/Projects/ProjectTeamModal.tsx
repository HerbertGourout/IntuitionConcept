import React, { useState } from 'react';
import { Modal, Input, Button, Tag } from 'antd';

interface ProjectTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: string[];
  onSave: (newTeam: string[]) => void;
}

const ProjectTeamModal: React.FC<ProjectTeamModalProps> = ({ isOpen, onClose, team, onSave }) => {
  const [members, setMembers] = useState<string[]>(team || []);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !members.includes(inputValue.trim())) {
      setMembers([...members, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (member: string) => {
    setMembers(members.filter(m => m !== member));
  };

  const handleSave = () => {
    onSave(members);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleSave}
      title="Gérer l'équipe du projet"
      okText="Enregistrer"
      cancelText="Annuler"
    >
      <div className="mb-4">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={handleAdd}
          placeholder="Nom ou email du membre"
          addonAfter={<Button type="primary" onClick={handleAdd}>Ajouter</Button>}
        />
      </div>
      <div>
        {members.map(member => (
          <Tag
            key={member}
            closable
            onClose={() => handleRemove(member)}
            style={{ marginBottom: 8 }}
          >
            {member}
          </Tag>
        ))}
        {members.length === 0 && <div className="text-gray-400">Aucun membre pour l'instant.</div>}
      </div>
    </Modal>
  );
};

export default ProjectTeamModal;
