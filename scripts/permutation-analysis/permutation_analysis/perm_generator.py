"""
Utility class to generate all possible permutations of set scores in a tennis match.
"""

from collections import Counter
from itertools import product
from typing import Generator

WLType = str
WLListType = list[str]


def unique_permutations(elements: WLListType) -> Generator[tuple[str, ...], None, None]:
    """
    Generate unique permutations of elements.

    Args:
        elements: List of elements to permute. For example, ["W", "W", "L", "L", "L"].
    Returns:
        Generator of unique permutations.
    """
    counter = Counter(elements)

    def permute_unique(
        prefix: tuple[str, ...], remaining: Counter[WLType]
    ) -> Generator[tuple[str, ...], None, None]:
        if not remaining:
            yield prefix
        else:
            for elem in sorted(remaining):  # Sorting for consistent order
                next_prefix = prefix + (elem,)
                next_remaining = remaining.copy()
                next_remaining[elem] -= 1
                if next_remaining[elem] == 0:
                    del next_remaining[elem]
                yield from permute_unique(next_prefix, next_remaining)

    return permute_unique((), counter)


def generate_valid_set_winner_sequences(N: int) -> list[tuple[str, ...]]:
    W_count = 3
    L_count = N - 3
    elements: WLListType = ["W"] * W_count + ["L"] * L_count
    all_sequences = unique_permutations(elements)
    valid_sequences = []
    for seq in all_sequences:
        winner_wins = 0
        # Check if the winner reaches 3 wins exactly at the Nth set
        for i in range(len(seq)):
            if seq[i] == "W":
                winner_wins += 1
            if winner_wins == 3:
                if i == N - 1:
                    valid_sequences.append(seq)
                break  # Winner reaches 3 wins before Nth set
    return valid_sequences


def generate_all_permutations() -> set[str]:
    # Scores where Player A wins the set
    set_scores_a_wins = ["6-0", "6-1", "6-2", "6-3", "6-4", "7-5", "7-6"]
    # Scores where Player B wins the set
    set_scores_b_wins = ["0-6", "1-6", "2-6", "3-6", "4-6", "5-7", "6-7"]

    permutations = set()

    for winner in ["A", "B"]:
        winner_scores = set_scores_a_wins if winner == "A" else set_scores_b_wins
        loser_scores = set_scores_b_wins if winner == "A" else set_scores_a_wins

        for N in [3, 4, 5]:
            valid_sequences = generate_valid_set_winner_sequences(N)
            for seq in valid_sequences:
                # Map 'W' and 'L' to actual set scores
                set_score_options = []
                for outcome in seq:
                    if outcome == "W":
                        set_score_options.append(winner_scores)
                    else:
                        set_score_options.append(loser_scores)
                # Generate all combinations of set scores for this sequence
                for scores in product(*set_score_options):
                    permutation = ",".join(scores)
                    permutations.add(permutation)

    return permutations


# Example usage
if __name__ == "__main__":
    all_permutations = generate_all_permutations()
    print(f"Total permutations: {len(all_permutations)}")
    # print("all_permutations:", all_permutations)
    print("6-7,6-7,6-7" in all_permutations)
    print("7-6,7-6,7-6" in all_permutations)
    # print("unique perms", list(unique_permutations(["W", "W", "L", "L", "L"])))
