import os

import requests

from data_pipeline.api_wrappers.pinnacle.model import Sport


class PinnacleAPI:
    BASE_URL = "https://pinnacle-odds.p.rapidapi.com/kit/v1"

    def __init__(self):
        self.rapidapi_host = "pinnacle-odds.p.rapidapi.com"
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        if not self.rapidapi_key:
            raise ValueError("RapidAPI key is missing. Set it in the .env file as 'RAPIDAPI_KEY'.")

        self.headers = {
            "x-rapidapi-host": self.rapidapi_host,
            "x-rapidapi-key": self.rapidapi_key,
        }

    def _get(self, endpoint, params=None):
        """Helper function for making GET requests with RapidAPI headers."""
        url = f"{self.BASE_URL}/{endpoint}"
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()

    def get_sports_list(self) -> list[Sport]:
        """Fetch a list of available sports."""
        response = self._get("sports")
        return [Sport(**sport) for sport in response]

    def get_markets(self, sport_id, event_type=None, is_have_odds=None):
        """Fetch a list of markets for a specific sport."""
        params = {
            "sport_id": sport_id,
            "event_type": event_type,
            "is_have_odds": is_have_odds,
        }
        return self._get("markets", params=params)

    def get_completed_events(self, sport_id, page_num=1):
        """Fetch a list of completed events for a specific sport."""
        params = {"sport_id": sport_id, "page_num": page_num}
        return self._get("archive", params=params)

    def get_event_details(self, event_id):
        """Fetch historical odds and event details for a specific event."""
        return self._get("details", params={"event_id": event_id})

    def get_updated_markets(self, sport_id, since):
        """Fetch only updated events for a specific sport using the 'since' parameter."""
        params = {"sport_id": sport_id, "since": since}
        return self._get("markets", params=params)
