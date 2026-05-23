import React from 'react';

interface LayoutRendererProps {
  layout?: 'single-column' | 'two-column' | 'grid' | string;
  children: React.ReactNode[];
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  layout = 'single-column',
  children,
}) => {
  if (!children || children.length === 0) {
    return null;
  }

  // Handle different layout configurations
  switch (layout) {
    case 'two-column':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {children}
        </div>
      );
    case 'grid':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {children}
        </div>
      );
    case 'single-column':
    default:
      return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {children}
        </div>
      );
  }
};

export default LayoutRenderer;
