import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';

  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Gestion du délai d'affichage
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      setIsVisible(false);
    };
  }, []);
  
  // Positionnement du tooltip
  const getPositionStyles = () => {
    if (!tooltipRef.current || !triggerRef.current) return {};
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const positions = {
      top: {
        bottom: `${window.innerHeight - triggerRect.top + 8}px`,
        left: `${triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`,
        transform: 'translateY(0)',
      },
      right: {
        left: `${triggerRect.right + 8}px`,
        top: `${triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`,
        transform: 'translateX(0)',
      },
      bottom: {
        top: `${triggerRect.bottom + 8}px`,
        left: `${triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`,
        transform: 'translateY(0)',
      },
      left: {
        right: `${window.innerWidth - triggerRect.left + 8}px`,
        top: `${triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`,
        transform: 'translateX(0)',
      },
    };
    
    return positions[position] || positions.top;
  };
  
  // Animation d'entrée/sortie
  const tooltipVariants = {

    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: position === 'bottom' ? -10 : position === 'top' ? 10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      x: 0,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: position === 'bottom' ? -10 : position === 'top' ? 10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
      transition: { 
        duration: 0.15 
      } 
    },
  } as const;
  
  // Gestion des événements
  const handleMouseEnter = () => !disabled && setIsVisible(true);
  const handleMouseLeave = () => !disabled && setIsVisible(false);
  const handleFocus = () => !disabled && setIsVisible(true);
  const handleBlur = () => !disabled && setIsVisible(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={triggerRef}
    >
      {/* Élément déclencheur */}
      {React.cloneElement(children, {
        'aria-describedby': `tooltip-${React.Children.only(children).key}`,
        tabIndex: 0,
      })}
      
      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && isMounted && (
          <motion.div
            id={`tooltip-${React.Children.only(children).key}`}
            role="tooltip"
            className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg dark:bg-gray-700 pointer-events-none whitespace-nowrap"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tooltipVariants}
            style={getPositionStyles()}
            ref={tooltipRef}
          >
            {content}
            {/* Flèche du tooltip */}
            <div 
              className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45`}
              style={{
                ...(position === 'top' && { 
                  bottom: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                }),
                ...(position === 'right' && { 
                  left: '-4px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(-45deg)',
                }),
                ...(position === 'bottom' && { 
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-135deg)',
                }),
                ...(position === 'left' && { 
                  right: '-4px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(135deg)',
                }),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
