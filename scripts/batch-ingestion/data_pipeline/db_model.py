from typing import Optional, Union

from pydantic import BaseModel


# Country Table Models
class CountryRow(BaseModel):
    continent: Optional[str] = None
    country_code: str
    country_id: int
    country_name: str
    official_language: Optional[str] = None
    population: Optional[int] = None
    region: Optional[str] = None


class CountryInsert(BaseModel):
    continent: Optional[str] = None
    country_code: str
    country_id: Optional[int] = None
    country_name: str
    official_language: Optional[str] = None
    population: Optional[int] = None
    region: Optional[str] = None


class CountryUpdate(BaseModel):
    continent: Optional[str] = None
    country_code: Optional[str] = None
    country_id: Optional[int] = None
    country_name: Optional[str] = None
    official_language: Optional[str] = None
    population: Optional[int] = None
    region: Optional[str] = None


# Event Table Models
class EventRow(BaseModel):
    draw_size: Optional[int] = None
    event_end_date: Optional[str] = None
    event_id: int
    event_start_date: Optional[str] = None
    event_type_id: int
    external_id: Optional[str] = None
    length: Optional[int] = None
    location: Optional[str] = None
    name: Optional[str] = None
    prize_money: Optional[int] = None
    surface_type_id: int


class EventInsert(BaseModel):
    draw_size: Optional[int] = None
    event_end_date: Optional[str] = None
    event_id: Optional[int] = None
    event_start_date: Optional[str] = None
    event_type_id: int
    external_id: Optional[str] = None
    length: Optional[int] = None
    location: Optional[str] = None
    name: Optional[str] = None
    prize_money: Optional[int] = None
    surface_type_id: int


class EventUpdate(BaseModel):
    draw_size: Optional[int] = None
    event_end_date: Optional[str] = None
    event_id: Optional[int] = None
    event_start_date: Optional[str] = None
    event_type_id: Optional[int] = None
    external_id: Optional[str] = None
    length: Optional[int] = None
    location: Optional[str] = None
    name: Optional[str] = None
    prize_money: Optional[int] = None
    surface_type_id: Optional[int] = None


# Event Type Table Models
class EventTypeRow(BaseModel):
    event_type: str
    event_type_id: int


class EventTypeInsert(BaseModel):
    event_type: str
    event_type_id: Optional[int] = None


class EventTypeUpdate(BaseModel):
    event_type: Optional[str] = None
    event_type_id: Optional[int] = None


# Match Table Models
class MatchRow(BaseModel):
    event_id: int
    external_id: Optional[str] = None
    match_duration: Optional[Union[dict, str]] = None
    match_end_time: Optional[str] = None
    match_id: int
    match_start_time: Optional[str] = None
    player_a_id: Optional[int] = None
    player_b_id: Optional[int] = None
    winner_id: Optional[int] = None


class MatchInsert(BaseModel):
    event_id: Optional[int] = None
    external_id: Optional[str] = None
    match_duration: Optional[Union[dict, str]] = None
    match_end_time: Optional[str] = None
    match_id: Optional[int] = None
    match_start_time: Optional[str] = None
    player_a_id: Optional[int] = None
    player_b_id: Optional[int] = None
    winner_id: Optional[int] = None


class MatchUpdate(BaseModel):
    event_id: Optional[int] = None
    external_id: Optional[str] = None
    match_duration: Optional[Union[dict, str]] = None
    match_end_time: Optional[str] = None
    match_id: Optional[int] = None
    match_start_time: Optional[str] = None
    player_a_id: Optional[int] = None
    player_b_id: Optional[int] = None
    winner_id: Optional[int] = None


# Player Table Models
class PlayerRow(BaseModel):
    country_id: Optional[int] = None
    date_of_birth: Optional[str] = None
    external_id: Optional[str] = None
    first_name: Optional[str] = None
    full_name: Optional[str] = None
    handedness: Optional[str] = None
    height_cm: Optional[int] = None
    last_known_ranking: Optional[int] = None
    last_name: Optional[str] = None
    last_update_time: Optional[str] = None
    name_code: Optional[str] = None
    place_of_birth: Optional[str] = None
    player_id: int
    sex: Optional[str] = None
    source: Optional[str] = None
    weight_kg: Optional[int] = None


class PlayerInsert(BaseModel):
    country_id: Optional[int] = None
    date_of_birth: Optional[str] = None
    external_id: Optional[str] = None
    first_name: Optional[str] = None
    full_name: Optional[str] = None
    handedness: Optional[str] = None
    height_cm: Optional[int] = None
    last_known_ranking: Optional[int] = None
    last_name: Optional[str] = None
    last_update_time: Optional[str] = None
    name_code: Optional[str] = None
    place_of_birth: Optional[str] = None
    player_id: Optional[int] = None
    sex: Optional[str] = None
    source: Optional[str] = None
    weight_kg: Optional[int] = None


class PlayerUpdate(BaseModel):
    country_id: Optional[int] = None
    date_of_birth: Optional[str] = None
    external_id: Optional[str] = None
    first_name: Optional[str] = None
    full_name: Optional[str] = None
    handedness: Optional[str] = None
    height_cm: Optional[int] = None
    last_known_ranking: Optional[int] = None
    last_name: Optional[str] = None
    last_update_time: Optional[str] = None
    name_code: Optional[str] = None
    place_of_birth: Optional[str] = None
    player_id: Optional[int] = None
    sex: Optional[str] = None
    source: Optional[str] = None
    weight_kg: Optional[int] = None


# Player Rank History Table Models
class PlayerRankHistoryRow(BaseModel):
    player_id: Optional[int] = None
    rank_history_id: int
    ranking: Optional[int] = None
    ranking_date: Optional[str] = None


class PlayerRankHistoryInsert(BaseModel):
    player_id: Optional[int] = None
    rank_history_id: Optional[int] = None
    ranking: Optional[int] = None
    ranking_date: Optional[str] = None


class PlayerRankHistoryUpdate(BaseModel):
    player_id: Optional[int] = None
    rank_history_id: Optional[int] = None
    ranking: Optional[int] = None
    ranking_date: Optional[str] = None


# Player Statistic Table Models
class PlayerStatisticRow(BaseModel):
    grand_slam_titles: Optional[int] = None
    last_updated: Optional[str] = None
    losses: Optional[int] = None
    player_id: Optional[int] = None
    stat_id: str
    surface_type_id: int
    titles_won: Optional[int] = None
    top_10_wins: Optional[int] = None
    total_matches_played: Optional[int] = None
    win_percentage: Optional[float] = None
    wins: Optional[int] = None


class PlayerStatisticInsert(BaseModel):
    grand_slam_titles: Optional[int] = None
    last_updated: Optional[str] = None
    losses: Optional[int] = None
    player_id: Optional[int] = None
    stat_id: str
    surface_type_id: int
    titles_won: Optional[int] = None
    top_10_wins: Optional[int] = None
    total_matches_played: Optional[int] = None
    win_percentage: Optional[float] = None
    wins: Optional[int] = None


class PlayerStatisticUpdate(BaseModel):
    grand_slam_titles: Optional[int] = None
    last_updated: Optional[str] = None
    losses: Optional[int] = None
    player_id: Optional[int] = None
    stat_id: Optional[str] = None
    surface_type_id: Optional[int] = None
    titles_won: Optional[int] = None
    top_10_wins: Optional[int] = None
    total_matches_played: Optional[int] = None
    win_percentage: Optional[float] = None
    wins: Optional[int] = None


# Set Score Table Models
class SetScoreRow(BaseModel):
    match_id: int
    player_a_score: Optional[int] = None
    player_b_score: Optional[int] = None
    set_number: Optional[int] = None
    set_score_id: int
    tie_break_points_a: Optional[int] = None
    tie_break_points_b: Optional[int] = None


class SetScoreInsert(BaseModel):
    match_id: Optional[int] = None
    player_a_score: Optional[int] = None
    player_b_score: Optional[int] = None
    set_number: Optional[int] = None
    set_score_id: Optional[int] = None
    tie_break_points_a: Optional[int] = None
    tie_break_points_b: Optional[int] = None


class SetScoreUpdate(BaseModel):
    match_id: Optional[int] = None
    player_a_score: Optional[int] = None
    player_b_score: Optional[int] = None
    set_number: Optional[int] = None
    set_score_id: Optional[int] = None
    tie_break_points_a: Optional[int] = None
    tie_break_points_b: Optional[int] = None


# Surface Type Table Models
class SurfaceTypeRow(BaseModel):
    surface_type: str
    surface_type_id: int


class SurfaceTypeInsert(BaseModel):
    surface_type: str
    surface_type_id: Optional[int] = None


class SurfaceTypeUpdate(BaseModel):
    surface_type: Optional[str] = None
    surface_type_id: Optional[int] = None
