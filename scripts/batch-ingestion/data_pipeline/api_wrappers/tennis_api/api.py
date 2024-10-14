# data_pipeline/api_wrappers/tennis_api.py

import os
from typing import Any, Dict, Optional

import requests


class TennisAPI:
    BASE_URL = "https://allsportsapi2.p.rapidapi.com"  # Replace with actual base URL if different

    def __init__(self):
        self.headers = {"x-rapidapi-host": os.getenv("RAPIDAPI_HOST"), "x-rapidapi-key": os.getenv("RAPIDAPI_KEY")}
        if not self.headers["x-rapidapi-key"]:
            raise ValueError("RapidAPI key is missing. Set it in the .env file.")

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None):
        """Helper function to send GET requests."""
        url = f"{self.BASE_URL}/{endpoint}"
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()  # Raise an error for bad responses
        return response.json()

    def get_event_schedules(self, sport_id: int, date: Optional[str] = None):
        """Fetch event schedules for a specific sport and date."""
        params = {"sport_id": sport_id}
        if date:
            params["date"] = date
        return self._get("EventSchedules", params=params)

    def get_event_details(self, event_id: int):
        """Fetch details for a specific event."""
        params = {"event_id": event_id}
        return self._get("Event", params=params)

    def get_event_statistics(self, event_id: int):
        """Fetch statistics for a specific event."""
        params = {"event_id": event_id}
        return self._get("EventStatistics", params=params)

    def get_live_events(self, sport_id: int):
        """Fetch live events for a specific sport."""
        params = {"sport_id": sport_id}
        return self._get("LiveEvents", params=params)

    def get_head_to_head_events(self, team1_id: int, team2_id: int):
        """Fetch head-to-head events between two teams or players."""
        params = {"team1_id": team1_id, "team2_id": team2_id}
        return self._get("EventH2HDuel", params=params)

    def get_team_rankings(self, sport_id: int, category_id: int):
        """Fetch team rankings for a sport and category."""
        params = {"sport_id": sport_id, "category_id": category_id}
        return self._get("TeamRankings", params=params)
