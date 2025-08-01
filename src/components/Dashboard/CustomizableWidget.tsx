import React, { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { 
  GripVertical, 
  Settings, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  X,
  MoreVertical 
} from 'lucide-react';
import { useWidgets, Widget, WidgetSize } from '../../contexts/WidgetContext';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomizableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
  isEditMode?: boolean;
  onEdit?: () => void;
}

const CustomizableWidget: React.FC<CustomizableWidgetProps> = ({
  widget,
  children,
  isEditMode = false,
  onEdit,
}) => {
  const { updateWidget, removeWidget, resizeWidget, toggleWidgetVisibility } = useWidgets();
  const { resolvedTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const constraintsRef = useRef(null);

  const sizeClasses: Record<WidgetSize, string> = {
    small: 'col-span-1 row-span-1 min-h-[200px]',
    medium: 'col-span-2 row-span-1 min-h-[200px]',
    large: 'col-span-3 row-span-2 min-h-[400px]',
    xl: 'col-span-4 row-span-3 min-h-[600px]',
  };

  const sizeOptions: { size: WidgetSize; label: string; icon: string }[] = [
    { size: 'small', label: 'Petit', icon: '◽' },
    { size: 'medium', label: 'Moyen', icon: '◼' },
    { size: 'large', label: 'Grand', icon: '⬛' },
    { size: 'xl', label: 'Très grand', icon: '⬛⬛' },
  ];

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Calculer la nouvelle position basée sur le déplacement
    const gridSize = 100; // Taille approximative d'une cellule de grille
    const newX = Math.round(info.offset.x / gridSize);
    const newY = Math.round(info.offset.y / gridSize);
    
    if (newX !== 0 || newY !== 0) {
      const newPosition = {
        x: Math.max(0, widget.position.x + newX),
        y: Math.max(0, widget.position.y + newY),
      };
      updateWidget(widget.id, { position: newPosition });
    }
  };

  const handleResize = (newSize: WidgetSize) => {
    resizeWidget(widget.id, newSize);
    setShowSizeMenu(false);
  };

  const handleRemove = () => {
    removeWidget(widget.id);
  };

  const handleToggleVisibility = () => {
    toggleWidgetVisibility(widget.id);
  };

  if (!widget.isVisible && !isEditMode) {
    return null;
  }

  return (
    <motion.div
      ref={constraintsRef}
      className={`
        relative group
        ${sizeClasses[widget.size]}
        ${isDragging ? 'z-50' : 'z-10'}
        ${!widget.isVisible ? 'opacity-50' : ''}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      drag={isEditMode}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 2,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 1000,
      }}
      onHoverStart={() => setShowControls(true)}
      onHoverEnd={() => setShowControls(false)}
    >
      {/* Conteneur principal du widget */}
      <div
        className={`
          h-full w-full rounded-xl border transition-all duration-200
          ${resolvedTheme === 'dark'
            ? 'bg-gray-800/90 border-gray-700 backdrop-blur-sm'
            : 'bg-white/90 border-gray-200 backdrop-blur-sm shadow-sm'
          }
          ${isDragging ? 'ring-2 ring-blue-500' : ''}
          ${isEditMode ? 'hover:ring-2 hover:ring-blue-400' : ''}
        `}
      >
        {/* Header du widget avec contrôles */}
        {(isEditMode || showControls) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              absolute -top-2 left-2 right-2 z-20
              flex items-center justify-between
              px-3 py-1.5 rounded-lg border
              ${resolvedTheme === 'dark'
                ? 'bg-gray-900 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-700 shadow-sm'
              }
            `}
          >
            {/* Titre et drag handle */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isEditMode && (
                <GripVertical 
                  className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" 
                />
              )}
              <span className="text-sm font-medium truncate">
                {widget.title}
              </span>
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-1">
              {/* Bouton de visibilité */}
              <motion.button
                onClick={handleToggleVisibility}
                className={`
                  p-1 rounded hover:bg-opacity-20 transition-colors
                  ${resolvedTheme === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-500'}
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={widget.isVisible ? 'Masquer' : 'Afficher'}
              >
                {widget.isVisible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </motion.button>

              {/* Menu de taille */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowSizeMenu(!showSizeMenu)}
                  className={`
                    p-1 rounded hover:bg-opacity-20 transition-colors
                    ${resolvedTheme === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-500'}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Redimensionner"
                >
                  <Maximize2 className="w-3 h-3" />
                </motion.button>

                {/* Menu déroulant des tailles */}
                {showSizeMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowSizeMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`
                        absolute top-full mt-1 right-0 z-40
                        min-w-[120px] rounded-lg border shadow-lg
                        ${resolvedTheme === 'dark'
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-gray-200'
                        }
                      `}
                    >
                      {sizeOptions.map((option) => (
                        <button
                          key={option.size}
                          onClick={() => handleResize(option.size)}
                          className={`
                            w-full px-3 py-2 text-left text-sm
                            flex items-center gap-2
                            transition-colors first:rounded-t-lg last:rounded-b-lg
                            ${widget.size === option.size
                              ? resolvedTheme === 'dark'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-700'
                              : resolvedTheme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-200'
                                : 'hover:bg-gray-50 text-gray-700'
                            }
                          `}
                        >
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>

              {/* Bouton de configuration */}
              {onEdit && (
                <motion.button
                  onClick={onEdit}
                  className={`
                    p-1 rounded hover:bg-opacity-20 transition-colors
                    ${resolvedTheme === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-500'}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Configurer"
                >
                  <Settings className="w-3 h-3" />
                </motion.button>
              )}

              {/* Bouton de suppression */}
              <motion.button
                onClick={handleRemove}
                className={`
                  p-1 rounded hover:bg-red-500 hover:text-white transition-colors
                  text-red-500
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Supprimer"
              >
                <X className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Contenu du widget */}
        <div className={`
          h-full w-full p-4 
          ${(isEditMode || showControls) ? 'pt-8' : 'pt-4'}
          ${!widget.isVisible ? 'pointer-events-none' : ''}
        `}>
          {children}
        </div>

        {/* Indicateur de redimensionnement */}
        {isEditMode && (
          <div className={`
            absolute bottom-2 right-2 w-4 h-4
            border-r-2 border-b-2 border-gray-400
            ${resolvedTheme === 'dark' ? 'border-gray-500' : 'border-gray-400'}
          `} />
        )}
      </div>

      {/* Overlay de drag */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl border-2 border-blue-500 border-dashed" />
      )}
    </motion.div>
  );
};

export default CustomizableWidget;
