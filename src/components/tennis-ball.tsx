import { Icon } from 'lucide-react';
import { tennisBall } from '@lucide/lab';

interface TennisBallProps {
  className?: string;
}

const TennisBall: React.FC<TennisBallProps> = ({ className, ...props }) => {
  return <Icon iconNode={tennisBall} className={className} {...props} />;
};

export default TennisBall;
