from enum import Enum

from data_pipeline.api_wrappers.sports_score.model import Sport


class SportScoreTennisLeagueIds(Enum):
    AUSTRALIAN_OPEN = 7117
    FRENCH_OPEN = 7118
    WIMBLEDON = 7119
    US_OPEN = 7120


TENNIS_SPORT_ID = 2
TENNIS_SPORT_NAME = "Tennis"
TENNIS_SLUG = "tennis"
TENNIS_SPORT = Sport(id=TENNIS_SPORT_ID, slug=TENNIS_SLUG, name=TENNIS_SPORT_NAME)


SURFACE_TYPE_ID_TO_VAL = {
    1: "grass",
    2: "clay",
    3: "indoor hard",
    4: "outdoor hard",
}


TOURNAMENT_TO_SURFACE_TYPE_MAP = {
    SportScoreTennisLeagueIds.AUSTRALIAN_OPEN.value: 4,
    SportScoreTennisLeagueIds.FRENCH_OPEN.value: 2,
    SportScoreTennisLeagueIds.WIMBLEDON.value: 1,
    SportScoreTennisLeagueIds.US_OPEN.value: 4,
}
