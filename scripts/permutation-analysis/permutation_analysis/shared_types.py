from datetime import datetime
from typing import Dict, List, NamedTuple, TypedDict


# Database Types
class AggregatedMatchScore(TypedDict):
    tournament_id: int
    match_id: int
    player_a_full_name: str
    player_b_full_name: str
    round_name: str
    event_name: str
    event_gender: str
    event_year: int
    event_type_id: int
    player_a_scores: List[int]
    player_b_scores: List[int]
    match_start_time: datetime


# Processor Types
PermutationCountType = Dict[str, int]
PermutationMatchesType = Dict[str, List[int]]
TransitionInfo = NamedTuple(
    "TransitionInfo",
    [
        ("current_set", str),
        ("next_set", str),
        ("event_gender", str),
        ("tournament_id", int),
        ("event_type_id", int),
    ],
)
TransitionsType = Dict[TransitionInfo, int]
TotalTransitionInfo = NamedTuple(
    "TotalTransitionInfo",
    [
        ("current_set", str),
        ("event_gender", str),
        ("tournament_id", int),
        ("event_type_id", int),
    ],
)
TotalTransitionsType = Dict[TotalTransitionInfo, int]


class ProcessedMatchesStats(NamedTuple):
    permutation_counts: PermutationCountType
    permutation_matches: PermutationMatchesType
    transitions: TransitionsType
    total_transitions: TotalTransitionsType
