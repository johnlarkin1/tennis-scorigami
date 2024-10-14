from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class SportTranslation(BaseModel):
    en: str


class Sport(BaseModel):
    id: int
    slug: str
    name: str
    # name_translations: SportTranslation


class Section(BaseModel):
    id: int
    sport_id: int
    slug: str
    name: str
    priority: int
    flag: str


class Fact(BaseModel):
    name: str
    value: str


class NameTranslation(BaseModel):
    en: str


class League(BaseModel):
    id: int
    sport_id: int
    section_id: int
    slug: str
    name_translations: NameTranslation
    has_logo: bool
    logo: str
    start_date: Optional[str]
    end_date: Optional[str]
    priority: int
    # host: Optional[str]
    tennis_points: int
    facts: List[Fact]
    most_count: Optional[int]
    section: Section
    sport: Sport


class Season(BaseModel):
    id: int
    slug: str
    name: str
    year_start: int
    year_end: Optional[int] = None
    league: List[League] = []


####################

####################


class Team(BaseModel):
    id: int
    sport_id: int
    category_id: Optional[int]
    venue_id: Optional[int]
    manager_id: Optional[int]
    slug: str
    name: str
    has_logo: bool
    logo: Optional[str]
    name_translations: Optional[NameTranslation] = None
    name_short: str
    name_full: str
    name_code: str
    has_sub: bool
    gender: str
    is_nationality: bool
    country_code: Optional[str]
    country: Optional[str]
    flag: Optional[str]
    foundation: Optional[str]


class Score(BaseModel):
    current: Optional[int]
    display: Optional[int]
    period_1: Optional[int]
    period_2: Optional[int]
    period_3: Optional[int]
    period_4: Optional[int]
    period_5: Optional[int]
    normal_time: Optional[int]
    point: Optional[str]
    period_1_tie_break: Optional[int]
    period_2_tie_break: Optional[int]
    period_3_tie_break: Optional[int]
    period_4_tie_break: Optional[int]
    period_5_tie_break: Optional[int]


class RoundInfo(BaseModel):
    round: int
    name: str
    cupRoundType: Optional[int]


class Challenge(BaseModel):
    id: int
    sport_id: int
    league_id: int
    slug: str
    name: str
    name_translations: Dict[str, str]
    order: int
    priority: int


class Event(BaseModel):
    id: int
    sport_id: int
    home_team_id: int
    away_team_id: int
    league_id: int
    challenge_id: int
    season_id: int
    venue_id: Optional[int]
    referee_id: Optional[int]
    slug: str
    name: str
    status: str
    status_more: Optional[str]
    time_details: Optional[str]
    home_team: Team
    away_team: Team
    start_at: str
    priority: int
    home_score: Score
    away_score: Score
    winner_code: Optional[int]
    aggregated_winner_code: Optional[int]
    result_only: bool
    coverage: Optional[str]
    ground_type: Optional[str]
    round_number: Optional[int]
    series_count: Optional[int]
    medias_count: Optional[int]
    status_lineup: Optional[str]
    first_supply: Optional[str]
    cards_code: Optional[str]
    event_data_change: Optional[str]
    lasted_period: Optional[str]
    default_period_count: Optional[str]
    attendance: Optional[int]
    cup_match_order: Optional[int]
    cup_match_in_round: Optional[int]
    periods: Optional[str]
    round_info: Optional[RoundInfo]
    periods_time: Optional[str]
    main_odds: Optional[str]
    league: League
    challenge: Challenge
    season: Season
    section: Section
    sport: Sport


class EventsResponse(BaseModel):
    data: List[Event]
    meta: Dict[str, int]


class PlayerDetails(BaseModel):
    country: str
    country_iso: Optional[str] = Field(default=None, alias="countryISO")
    date_of_birth: Optional[str] = None
    birthplace: Optional[str] = None
    plays: Optional[str] = None
    weight: Optional[str] = None
    height_meters: Optional[int] = None
    prize_total: Optional[str] = None
    prize_total_euros: Optional[int] = None
    flag: Optional[str] = None


class Player(BaseModel):
    id: str
    sport_id: int
    name: str
    slug: str
    has_logo: bool
    logo: str
    name_short: Optional[str] = None
    name_full: Optional[str] = None
    name_code: Optional[str] = None
    gender: Optional[str] = None
    is_nationality: bool
    country_code: Optional[str] = None
    country: Optional[str] = None
    details: Optional[PlayerDetails]
