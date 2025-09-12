import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Standard page wrapper aligned to "Mon Espace" style
// - full-width content
// - soft gradient background
// - consistent vertical rhythm
const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6 ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
