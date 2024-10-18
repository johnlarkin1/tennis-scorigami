import * as React from 'react';
import { Button } from '@/shadcn/components/ui/button';

type ToggleButtonProps = {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({ isActive, onClick, children, className }) => {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      onClick={onClick}
      className={`bg-background text-white px-4 py-2 flex items-center transition-colors 
        ${isActive ? 'bg-blue-800 border border-gray-700' : 'bg-background hover:bg-blue-700'} 
        ${className || ''}`}
    >
      {children}
    </Button>
  );
};

export { ToggleButton };
