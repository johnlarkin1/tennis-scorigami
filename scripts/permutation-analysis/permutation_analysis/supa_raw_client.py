from typing import Any, Dict, List, LiteralString, Optional, Tuple, cast

import psycopg
from psycopg.rows import dict_row

from permutation_analysis.shared_types import (
    AggregatedMatchScore,
    TotalTransitionInfo,
    TotalTransitionsType,
    TransitionsType,
)


class SupaRawClient:
    def __init__(self, dbname: str, user: str, password: str, host: str, port: str) -> None:
        self.conn = psycopg.connect(
            dbname=dbname, user=user, password=password, host=host, port=port, autocommit=True
        )

    def _fetch_all(
        self, query: LiteralString, params: Optional[Tuple] = None
    ) -> List[Dict[str, Any]]:
        """Fetch all results from a query and return as a list of dictionaries."""
        with self.conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def close(self) -> None:
        """Close the database connection."""
        self.conn.close()

    def ensure_connectivity(self) -> None:
        """Check if the connection is alive."""
        with self.conn.cursor() as cur:
            cur.execute("SELECT version();")
            cur.fetchone()
        print("✅ Successfully connected!")

    def get_permutation_strings(self) -> set[str]:
        """Fetch all permutation strings from the match_permutation table."""
        query = "SELECT permutation_string FROM match_permutation;"
        result = self._fetch_all(query)
        return {row["permutation_string"] for row in result}

    def fetch_aggregated_match_data(
        self,
        tournament_id: Optional[int] = None,
        event_year: Optional[int] = None,
        event_gender: Optional[str] = None,
    ) -> List[AggregatedMatchScore]:
        """Call get_aggregated_match_scores function to retrieve match data."""
        query = "SELECT * FROM get_aggregated_match_scores(%s, %s, %s);"
        params = (tournament_id, event_year, event_gender)
        return cast(List[AggregatedMatchScore], self._fetch_all(query, params))

    def insert_permutations_if_not_exist(self, permutations: Dict[str, int]) -> Dict[str, int]:
        """Insert or update permutations and return their IDs."""
        id_map = {}
        query = """
            INSERT INTO match_permutation (permutation_string, occurrence_count)
            VALUES (%s, %s)
            ON CONFLICT (permutation_string) DO UPDATE
            SET occurrence_count = match_permutation.occurrence_count + EXCLUDED.occurrence_count
            RETURNING permutation_string, permutation_id;
        """
        with self.conn.cursor(row_factory=dict_row) as cur:
            for permutation_string, count in permutations.items():
                cur.execute(query, (permutation_string, count))
                fetched_val = cur.fetchone()
                if not fetched_val:
                    raise ValueError(f"Could not fetch permutation ID for {permutation_string}")
                id_map[permutation_string] = fetched_val["permutation_id"]
        return id_map

    def insert_permutation_matches(
        self, permutation_matches: Dict[str, List[int]], permutation_ids: Dict[str, int]
    ) -> None:
        """Insert permutation matches."""
        data = [
            (permutation_ids[perm_string], match_id)
            for perm_string, match_ids in permutation_matches.items()
            for match_id in match_ids
        ]
        query = """
        INSERT INTO permutation_match (permutation_id, match_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING;
        """
        with self.conn.cursor() as cur:
            cur.executemany(query, data)

    def upsert_transition_matrix(
        self, transitions: TransitionsType, total_transitions: TotalTransitionsType
    ) -> None:
        """Insert or update set score transition matrix entries."""
        data = [
            (
                transition_info.current_set,
                transition_info.next_set,
                transition_info.event_gender,
                transition_info.event_type_id,
                transition_info.tournament_id,
                count,
                count
                / total_transitions[
                    TotalTransitionInfo(
                        transition_info.current_set,
                        transition_info.event_gender,
                        transition_info.tournament_id,
                        transition_info.event_type_id,
                    )
                ]
                if total_transitions.get(
                    TotalTransitionInfo(
                        transition_info.current_set,
                        transition_info.event_gender,
                        transition_info.tournament_id,
                        transition_info.event_type_id,
                    ),
                    0,
                )
                > 0
                else 0,
            )
            for transition_info, count in transitions.items()
        ]

        query = """
        INSERT INTO set_score_transition_matrix (
            current_set_score, next_set_score, event_sex, event_type_id, tournament_id,
            transition_count, transition_probability
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (current_set_score, next_set_score, event_sex, event_type_id, tournament_id)
        DO UPDATE SET
            transition_count = EXCLUDED.transition_count,
            transition_probability = EXCLUDED.transition_probability;
        """
        with self.conn.cursor() as cur:
            cur.executemany(query, data)

    def clear_prepared_statements(self) -> None:
        """Deallocate all prepared statements in the current session."""
        with self.conn.cursor() as cur:
            cur.execute("DEALLOCATE ALL;")
