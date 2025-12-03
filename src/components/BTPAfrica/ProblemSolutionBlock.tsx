import React from 'react';
import { motion } from 'framer-motion';

interface ProblemSolution {
  problem: string;
  solution: string;
}

interface ProblemSolutionBlockProps {
  title?: string;
  items: ProblemSolution[];
  variant?: 'default' | 'cards' | 'inline';
  className?: string;
}

/**
 * Bloc problème/solution avec couleurs au lieu d'icônes
 * Rouge pour problèmes, vert pour solutions - pas d'emoji
 */
const ProblemSolutionBlock: React.FC<ProblemSolutionBlockProps> = ({
  title,
  items,
  variant = 'default',
  className = '',
}) => {
  if (variant === 'cards') {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#C45C3E]"
            >
              <p className="text-[#8B3D2A] font-medium mb-2 line-through decoration-[#C45C3E]/50">
                {item.problem}
              </p>
              <p className="text-[#4A7C59] font-medium">
                {item.solution}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
        )}
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-[#8B3D2A] line-through decoration-2">{item.problem}</span>
              <span className="text-gray-400">→</span>
              <span className="text-[#4A7C59] font-medium">{item.solution}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#F5F0E8] rounded-xl p-5"
          >
            <p className="text-[#8B3D2A] font-medium mb-3 line-through decoration-[#C45C3E]/40 decoration-2">
              {item.problem}
            </p>
            <div className="h-px bg-gradient-to-r from-[#C45C3E] to-[#4A7C59] mb-3" />
            <p className="text-[#4A7C59] font-medium">
              {item.solution}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProblemSolutionBlock;
