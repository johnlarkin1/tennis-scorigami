export type ViewType = 'horizontal' | 'vertical';

export type TreeControlsProps = {
  slams: { value: string; label: string }[];
  years: { value: string; label: string }[];
  selectedSlam: string;
  setSelectedSlam: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  showGradient: boolean;
  setShowGradient: (value: boolean) => void;
  showCount: boolean;
  setShowCount: (value: boolean) => void;
  viewType: ViewType;
  setViewType: (value: ViewType) => void;
};
