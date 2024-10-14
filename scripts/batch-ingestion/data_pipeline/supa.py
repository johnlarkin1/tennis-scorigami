import uuid
from datetime import date, datetime
from typing import Optional

from sportradar_tennis_v3.models.get_competitor_profile_response_200 import GetCompetitorProfileResponse200
from supabase import create_client

from data_pipeline.api_wrappers.sports_score.model import Player
from data_pipeline.api_wrappers.sports_score.util import (
    extract_date_of_birth,
    extract_handedness,
    extract_height_cm,
    extract_place_of_birth,
    extract_weight,
)
from data_pipeline.config import SUPABASE_KEY, SUPABASE_URL
from data_pipeline.db_model import EventRow, MatchRow


class SupabaseClient:
    def __init__(self):
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Upsert into the country table
    def upsert_country(
        self,
        country_code: str,
        country_name: str,
        population: Optional[int] = None,
        continent: Optional[str] = None,
        region: Optional[str] = None,
        official_language: Optional[str] = None,
    ):
        data = {
            "country_code": country_code,
            "country_name": country_name,
            "population": population,
            "continent": continent,
            "region": region,
            "official_language": official_language,
        }
        response = self.supabase.table("country").upsert(data, on_conflict="country_code").execute()
        print("Country upserted:", response.data)

    # Upsert into the surface_type table
    def upsert_surface_type(self, surface_type: str):
        data = {"surface_type": surface_type}
        response = self.supabase.table("surface_type").upsert(data, on_conflict="surface_type").execute()
        print("Surface Type upserted:", response.data)

    # Upsert into the player table
    def upsert_player_sports_score(
        self,
        player: Player,
        source: str,
        country_code_to_id: dict[str, int],
    ):
        data = {
            "first_name": player.name_full.split(", ")[1]
            if player.name_full and ", " in player.name_full
            else player.name,
            "last_name": player.name_full.split(", ")[0]
            if player.name_full and ", " in player.name_full
            else player.name,
            "full_name": player.name_full,
            "name_code": player.name_code,
            "country_id": country_code_to_id[player.country_code]
            if player.country_code in country_code_to_id
            else None,
            "sex": player.gender,
            "date_of_birth": extract_date_of_birth(player.details) if player.details else None,
            "place_of_birth": extract_place_of_birth(player.details) if player.details else None,
            "handedness": extract_handedness(player.details) if player.details else None,
            "height_cm": extract_height_cm(player.details) if player.details else None,
            "weight_kg": extract_weight(player.details) if player.details else None,
            "last_update_time": datetime.now().isoformat(),
            "last_known_ranking": None,  # if ranking is provided in data
            "external_id": player.id,
            "source": source,
        }
        try:
            print("about to send")
            print(data)
            response = self.supabase.table("player").upsert(data, on_conflict="player_id").execute()
            print("Player upserted:", response.data)
        except Exception as e:
            print(f"Error: {e}")
            print(repr(e))

    # Upsert into the player table
    def upsert_player_sportradar(
        self,
        competitor: GetCompetitorProfileResponse200,
        source: str,
        country_code_to_id: dict[str, int],
    ):
        assert competitor
        competitor_core = competitor.competitor
        assert competitor_core
        competitor_info = competitor.info
        assert competitor_info

        print("Competitor Core:", competitor_core)
        print("Competitor Info:", competitor_info)
        data = {
            "first_name": competitor_core.name.split(", ")[1]
            if competitor_core.name and ", " in competitor_core.name
            else competitor_core.name,
            "last_name": competitor_core.name.split(", ")[0]
            if competitor_core.name and ", " in competitor_core.name
            else competitor_core.name,
            "full_name": competitor_core.name,
            "name_code": competitor_core.abbreviation or None,
            "country_id": country_code_to_id[competitor_core.country_code]
            if competitor_core.country_code in country_code_to_id
            else None,
            "sex": "M" if competitor_core.gender == "male" else "F",
            "date_of_birth": competitor_info.date_of_birth or None,
            "place_of_birth": None,
            "handedness": competitor_info.handedness.lower() if competitor_info.handedness else None,
            "height_cm": competitor_info.height or None,
            "weight_kg": str(competitor_info.weight) if competitor_info.weight else None,
            "last_update_time": datetime.now().isoformat(),
            "last_known_ranking": None,
            "external_id": competitor_core.id,
            "source": source,
        }
        try:
            print("about to send")
            print(data)
            response = self.supabase.table("player").upsert(data, on_conflict="external_id").execute()
            print("Player upserted:", response.data)
        except Exception as e:
            print(f"Error: {e}")
            print(repr(e))

    # Upsert into the event table
    def upsert_event(
        self,
        name: str,
        event_type_id: int,
        location: str,
        surface_type_id: int,
        prize_money: int,
        draw_size: int,
        event_start_date: date,
        event_end_date: date,
        event_year: int,
        length: int,
        external_id: str,
    ) -> EventRow:
        data = {
            "name": name,
            "event_type_id": event_type_id,
            "location": location,
            "surface_type_id": surface_type_id,
            "prize_money": prize_money,
            "draw_size": draw_size,
            "event_start_date": event_start_date.isoformat(),
            "event_end_date": event_end_date.isoformat(),
            "event_year": event_year,
            "length": length,
            "external_id": external_id,
        }
        response = self.supabase.table("event").upsert(data, on_conflict="external_id").execute()
        print("Event upserted:", response.data)
        return EventRow(**response.data[0])

    # Upsert into the player_statistic table
    def upsert_player_statistic(
        self,
        player_id: str,
        total_matches_played: int,
        wins: int,
        losses: int,
        surface_type_id: int,
        win_percentage: float,
        titles_won: int = 0,
        top_10_wins: int = 0,
        grand_slam_titles: int = 0,
    ):
        data = {
            "stat_id": str(uuid.uuid4()),
            "player_id": player_id,
            "total_matches_played": total_matches_played,
            "wins": wins,
            "losses": losses,
            "surface_type_id": surface_type_id,
            "win_percentage": win_percentage,
            "titles_won": titles_won,
            "top_10_wins": top_10_wins,
            "grand_slam_titles": grand_slam_titles,
        }
        response = self.supabase.table("player_statistic").upsert(data, on_conflict="stat_id").execute()
        print("Player statistic upserted:", response.data)

    # Upsert into the player_rank_history table
    def upsert_player_rank_history(self, player_id: str, ranking: int, ranking_date: str):
        data = {
            "rank_history_id": str(uuid.uuid4()),
            "player_id": player_id,
            "ranking": ranking,
            "ranking_date": ranking_date,
        }
        response = self.supabase.table("player_rank_history").upsert(data, on_conflict="rank_history_id").execute()
        print("Player rank history upserted:", response.data)

    # Upsert into the event_type table
    def upsert_event_type(self, event_type: str):
        data = {"event_type_id": str(uuid.uuid4()), "event_type": event_type}
        response = self.supabase.table("event_type").upsert(data, on_conflict="event_type_id").execute()
        print("Event type upserted:", response.data)

    # Upsert into the match table
    def upsert_match(
        self,
        event_id: int,
        player_a_id: int,
        player_b_id: int,
        winner_id: int,
        match_duration: Optional[str],
        match_start_time: datetime,
        match_end_time: Optional[str],
        external_id: str,
        round_id: int,
    ) -> MatchRow:
        data = {
            "event_id": event_id,
            "player_a_id": player_a_id,
            "player_b_id": player_b_id,
            "winner_id": winner_id,
            "match_duration": match_duration,
            "match_start_time": match_start_time.isoformat(),
            "match_end_time": match_end_time,
            "external_id": external_id,
            "round_id": round_id,
        }
        response = self.supabase.table("match").upsert(data, on_conflict="external_id").execute()
        print("Match upserted:", response.data)
        return MatchRow(**response.data[0])

    # Insert into the set_score table
    def upsert_set_score(
        self,
        match_id: int,
        set_number: int,
        player_a_score: int,
        player_b_score: int,
        external_match_id: str,
        tie_break_points_a: Optional[int] = None,
        tie_break_points_b: Optional[int] = None,
    ):
        data = {
            "match_id": match_id,
            "set_number": set_number,
            "player_a_score": player_a_score,
            "player_b_score": player_b_score,
            "tie_break_points_a": tie_break_points_a,
            "tie_break_points_b": tie_break_points_b,
            "external_id": external_match_id + "-" + str(set_number),
        }
        response = self.supabase.table("set_score").upsert(data, on_conflict="external_id").execute()
        print("Set score inserted:", response.data)

    def get_country_code_to_id_map(self) -> dict[str, int]:
        response = self.supabase.table("country").select("country_id", "country_code").execute()
        return {country["country_code"]: country["country_id"] for country in response.data}

    def get_player_sr_id_to_id_map(self) -> dict[str, int]:
        response = self.supabase.table("player").select("player_id", "external_id").execute()
        return {player["external_id"]: player["player_id"] for player in response.data}

    def get_round_type_to_id_map(self) -> dict[str, int]:
        response = self.supabase.table("match_round").select("round_id", "round_name").execute()
        return {round_type["round_name"]: round_type["round_id"] for round_type in response.data}
