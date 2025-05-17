import { Button } from "@/components/ui/button";
import * as React from "react";

type ToggleButtonProps = {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onClick,
  children,
  className,
  disabled = false,
}) => {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      onClick={onClick}
      disabled={disabled}
      className={`bg-background text-white px-4 py-2 flex items-center transition-colors 
        ${isActive ? "bg-blue-800 border border-gray-700" : "bg-background hover:bg-blue-700"} 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className || ""}`}
    >
      {children}
    </Button>
  );
};

export { ToggleButton };
