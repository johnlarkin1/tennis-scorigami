import logging
from typing import Generator, List, Optional, Type, TypeVar

import requests
from pydantic import BaseModel, ValidationError

from .model import Event, League, Player, Season, Sport

T = TypeVar("T", bound=BaseModel)


class SportScoreAPI:
    BASE_URL = "https://sportscore1.p.rapidapi.com"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": "sportscore1.p.rapidapi.com",
        }

    def _get(self, endpoint: str, model: Type[T], params: Optional[dict] = None) -> Optional[List[T]]:
        """Helper method for GET requests and model validation."""
        url = f"{self.BASE_URL}{endpoint}"
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            raw_data = response.json().get("data", [])
            return [model.model_validate(item) for item in raw_data]
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to fetch data from {url}: {e}")
        except ValidationError as ve:
            logging.error(f"Data validation error: {ve}")
        return None

    def get_sports(self) -> Optional[List[Sport]]:
        """Get a list of available sports as Sport models."""
        return self._get("/sports", Sport)

    def get_sports_by_name(self, sport_name: str) -> Sport:
        """Get a list of sports by name as Sport models."""
        sports = self.get_sports()
        if not sports:
            raise AssertionError("Failed to fetch sports data.")
        return [sport for sport in sports if sport.name == sport_name][0]

    def get_seasons_by_sport_and_league(self, sport: Sport) -> Generator[Season, None, None]:
        """Get seasons within a specific sport as Season models."""
        page_num = 1
        while True:
            seasons = self._get(f"/sports/{sport.id}/seasons?page={page_num}", Season)
            if not seasons:
                break
            for season in seasons:
                yield season
            page_num += 1

    def get_leagues_by_sport(self, sport: Sport) -> Generator[League, None, None]:
        """Get leagues within a specific sport as League models, paginated."""
        page_num = 1
        while True:
            leagues = self._get(f"/sports/{sport.id}/leagues", League, params={"page": page_num})
            if not leagues:
                break
            for league in leagues:
                yield league
            page_num += 1

    def get_league_by_league_id(self, league_id: int) -> Optional[League]:
        """Get a league by its ID."""
        leagues = self._get(f"/leagues/{league_id}", League)
        if not leagues:
            return None
        return leagues[0]

    def get_seasons_by_league(self, league_id: int) -> Optional[List[Season]]:
        """Get a list of seasons for a specific league."""
        return self._get(f"/leagues/{league_id}/seasons", Season)

    def get_events_by_season(self, season_id: int) -> Generator[Event, None, None]:
        """Get a list of events for a specific season."""
        page_num = 1
        while True:
            events = self._get(f"/seasons/{season_id}/events", Event, params={"page": page_num})
            if not events:
                break
            for event in events:
                yield event
            page_num += 1

    def get_players_by_sport(self, sport_id: int) -> Generator[Player, None, None]:
        """Get players by sport as individual Player models."""
        page_num = 1
        while True:
            players = self._get(f"/sports/{sport_id}/teams", Player, params={"page": page_num})
            if not players:
                break
            for player in players:
                if player.is_nationality:
                    continue
                yield player
            page_num += 1
