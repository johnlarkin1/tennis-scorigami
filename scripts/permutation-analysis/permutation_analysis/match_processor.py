from collections import defaultdict
from typing import List, Optional

from tqdm import tqdm

from permutation_analysis.shared_types import (
    AggregatedMatchScore,
    PermutationCountType,
    PermutationMatchesType,
    ProcessedMatchesStats,
    TotalTransitionInfo,
    TotalTransitionsType,
    TransitionInfo,
    TransitionsType,
)


class MatchProcessor:
    @staticmethod
    def process_matches(
        matches: List[AggregatedMatchScore],
        pbar: Optional[tqdm] = None,  # Progress bar object for tracking
    ) -> ProcessedMatchesStats:
        """
        Processes match data to compute:
        - permutation_counts: Count of unique set score permutations.
        - permutation_matches: Mapping of permutations to match IDs.
        - transitions: Count of transitions between set scores.
        - total_transitions: Count of occurrences of each set score as the current set.
        """

        # perm_string -> count
        permutation_counts: PermutationCountType = defaultdict(int)
        # perm_strings -> list_of_ids
        permutation_matches: PermutationMatchesType = defaultdict(list)
        # (current_set, next_set, gender, event_type_name)
        transitions: TransitionsType = defaultdict(int)
        # Counts of each set score in its current position
        total_transitions: TotalTransitionsType = defaultdict(int)

        # Iterate through matches and build permutations and transitions
        for match in matches:
            # Build permutation string (e.g., '6-3,4-6,7-5')
            set_scores = [
                f"{a}-{b}" for a, b in zip(match["player_a_scores"], match["player_b_scores"])
            ]
            permutation_string = ",".join(set_scores)

            # Update permutation counts and associated matches
            permutation_counts[permutation_string] += 1
            permutation_matches[permutation_string].append(match["match_id"])

            # Extract and count transitions
            for i in range(len(set_scores) - 1):
                current_set = set_scores[i]
                next_set = set_scores[i + 1]
                event_gender = match["event_gender"]
                tournament_id = match["tournament_id"]
                event_type_id = match["event_type_id"]

                # Transition from current to next
                transitions[
                    TransitionInfo(
                        current_set, next_set, event_gender, tournament_id, event_type_id
                    )
                ] += 1

                # Track total occurrences of each current set
                total_transitions[
                    TotalTransitionInfo(current_set, event_gender, tournament_id, event_type_id)
                ] += 1

        return ProcessedMatchesStats(
            permutation_counts, permutation_matches, transitions, total_transitions
        )
