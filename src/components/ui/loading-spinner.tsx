import { Loader2 } from "lucide-react";
import { FC } from "react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 24,
  className = "",
  text,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-green-500 h-${size} w-${size}`} />
      {text && <p className="mt-2 text-sm text-gray-400">{text}</p>}
    </div>
  );
};
