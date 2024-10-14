import json
import os

from data_pipeline.api_wrappers.sports_score.api import SportScoreAPI
from data_pipeline.api_wrappers.sports_score.constants import (
    TENNIS_SPORT_ID,
)
from data_pipeline.config import RAPIDAPI_KEY
from data_pipeline.supa import SupabaseClient


def main():
    api = SportScoreAPI(RAPIDAPI_KEY)
    supabase_client = SupabaseClient()
    country_name_to_id = supabase_client.get_country_code_to_id_map()

    players = []

    try:
        if os.path.exists("players_data.json"):
            with open("players_data.json", "r") as file:
                players = json.load(file)
            print("Players data loaded from players_data.json")

    except FileNotFoundError:
        print("players_data.json not found. Fetching players data from API.")
        players = api.get_players_by_sport(TENNIS_SPORT_ID)
        players_data = [player.model_dump() for player in players]
        with open("players_data.json", "w") as file:
            json.dump(players_data, file)
        print("Players data written to players_data.json")

    except json.JSONDecodeError as err:
        print("Error decoding JSON from players_data.json")
        raise AssertionError("Error decoding JSON from players_data.json") from err
    else:
        print("players_data.json not found. Fetching players data from API.")
        players = api.get_players_by_sport(TENNIS_SPORT_ID)
        players_data = [player.model_dump() for player in players]
        with open("players_data.json", "w") as file:
            json.dump(players_data, file)
        print("Players data written to players_data.json")

    for player in players:
        supabase_client.upsert_player_sports_score(
            player,
            "sports_score",
            country_name_to_id,
        )


if __name__ == "__main__":
    main()
