import { tennisBall } from "@lucide/lab";
import { Icon } from "lucide-react";

interface TennisBallProps {
  className?: string;
}

const TennisBall: React.FC<TennisBallProps> = ({ className, ...props }) => {
  return <Icon iconNode={tennisBall} className={className} {...props} />;
};

export default TennisBall;
