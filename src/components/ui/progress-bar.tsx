import { motion } from "framer-motion";
import FlipNumbers from "react-flip-numbers";

export const ProgressBar: React.FC<{ percentage: number }> = ({
  percentage,
}) => {
  const formattedPercentage = percentage.toFixed(2);
  const digitsCount = formattedPercentage.replace(".", "").length;
  const digitWidth = 10;
  const totalWidth = digitsCount * digitWidth;

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm font-medium">0%</span>
        <div className="flex-1">
          <div className="bg-gray-700 rounded-full h-6 relative overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-sm flex items-center">
                <div style={{ width: `${totalWidth}px` }}>
                  <FlipNumbers
                    height={14}
                    width={digitWidth}
                    color="#ffffff"
                    background="transparent"
                    play
                    numbers={formattedPercentage}
                  />
                </div>
                <span className="ml-1">%</span>
              </span>
            </div>
          </div>
        </div>
        <span className="text-gray-400 text-sm font-medium">100%</span>
      </div>
      <p className="text-center text-gray-500 text-sm mt-2">Completion Rate</p>
    </div>
  );
};
