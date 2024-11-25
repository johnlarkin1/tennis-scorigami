import { AggregatedMatchScore } from '@/types/set-score';

export type MatchDetailsProps = {
  selectedNodePath: string[];
  matchesForSelectedNode: AggregatedMatchScore[];
  isDetailedMatchesLoading: boolean;
  isDetailedMatchesError: boolean;
};

export const MatchDetails = ({
  selectedNodePath,
  matchesForSelectedNode,
  isDetailedMatchesLoading,
  isDetailedMatchesError,
}: MatchDetailsProps) => {
  if (selectedNodePath.length === 0) {
    return <p className='text-gray-600 dark:text-gray-400 italic'>Click on a node to view match details.</p>;
  }

  if (isDetailedMatchesLoading) {
    return <p className='text-gray-700 dark:text-gray-300'>Loading match details...</p>;
  }

  if (isDetailedMatchesError) {
    return <p className='text-red-600 dark:text-red-400'>Error loading match details!</p>;
  }

  if (matchesForSelectedNode.length === 0) {
    return <p className='text-gray-600 dark:text-gray-400 italic'>No matches found for this sequence.</p>;
  }

  return (
    <div>
      <h2 className='text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200'>
        Matches with Score Sequence: {selectedNodePath.join(' ')}
      </h2>
      <ul className='space-y-4'>
        {matchesForSelectedNode.map((match) => (
          <li key={match.match_id} className='p-4 bg-gray-200 dark:bg-gray-700 rounded-lg'>
            <p>
              <strong className='text-gray-700 dark:text-gray-300'>
                {match.player_a_full_name} vs {match.player_b_full_name}
              </strong>
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {match.event_name} - {match.match_start_time}
            </p>
            <p className='mt-2'>
              <strong>Scores:</strong>{' '}
              {match.player_a_scores.map((aScore, i) => (
                <span
                  key={i}
                  className={
                    selectedNodePath[i] === `${aScore}-${match.player_b_scores[i]}`
                      ? 'text-green-600 dark:text-green-400 font-bold'
                      : ''
                  }
                >
                  {aScore}-{match.player_b_scores[i]}{' '}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
