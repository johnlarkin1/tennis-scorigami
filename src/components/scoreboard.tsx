// src/components/scoreboard.tsx
import React, { useEffect, useState } from "react";
import FlipNumbers from "react-flip-numbers";

export type TennisScoreboardProps = {
  scores: string[];
};

const FLIP_NUMBERS_HEIGHT = 24;
const FLIP_NUMBERS_WIDTH = 16;
const FLIP_NUMBERS_DURATION = 1; // sec

export const TennisScoreboard: React.FC<TennisScoreboardProps> = ({
  scores,
}) => {
  const players = ["PLAYER A", "PLAYER B"];
  const gridCols = "auto repeat(5, minmax(0, 1fr))";
  const [displayScores, setDisplayScores] = useState(scores);

  useEffect(() => {
    if (
      scores &&
      scores.length > 0 &&
      scores.some((s) => s && s.includes("-"))
    ) {
      setDisplayScores(scores);
    }
  }, [scores]);

  return (
    <div className="w-full bg-black border-2 border-green-600 rounded p-4">
      {/* HEADER */}
      <div
        className="grid items-center gap-2 mb-3"
        style={{ gridTemplateColumns: gridCols }}
      >
        {/* invisible placeholder matching the name-cell */}
        <div className="text-green-400 font-medium text-sm p-2 whitespace-nowrap invisible">
          not shown
        </div>

        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="w-full h-12 flex items-center justify-center text-green-400 text-sm font-medium"
          >
            SET {n}
          </div>
        ))}
      </div>

      {/* PLAYER A & B ROWS */}
      {players.map((label, pIdx) => (
        <div
          key={label}
          className="grid items-center gap-2 mb-4"
          style={{ gridTemplateColumns: gridCols }}
        >
          {/* name cell */}
          <div className="text-green-400 font-medium p-2 whitespace-nowrap">
            {label}
          </div>

          {/* score cells */}
          {[0, 1, 2, 3, 4].map((i) => {
            const cell = displayScores[i];
            let val = "-";

            if (cell && typeof cell === "string" && cell.includes("-")) {
              const parts = cell.split("-");
              if (parts.length >= 2 && parts[pIdx]) {
                val = parts[pIdx];
              }
            }

            return (
              <div
                key={i}
                className="w-full h-12 bg-green-900 border border-green-500 rounded flex items-center justify-center"
              >
                <FlipNumbers
                  height={FLIP_NUMBERS_HEIGHT}
                  width={FLIP_NUMBERS_WIDTH}
                  color="#ffffff"
                  background="transparent"
                  play={true}
                  // default inside package is 0.3
                  duration={FLIP_NUMBERS_DURATION}
                  numbers={val}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
