# data_pipeline/main.py

from config import RAPIDAPI_KEY

from data_pipeline.api_wrappers.sports_score.api import SportScoreAPI
from data_pipeline.api_wrappers.sports_score.constants import (
    SportScoreTennisLeagueIds,
)
from data_pipeline.supa import SupabaseClient


def main():
    api = SportScoreAPI(RAPIDAPI_KEY)
    supabase_client = SupabaseClient()

    # Fetch tennis leagues
    for league_id_enum in SportScoreTennisLeagueIds:
        league_id = league_id_enum.value
        league = api.get_league_by_league_id(league_id)

        if not league:
            print(f"No league found for {league_id}")
            continue

        if league.id not in SportScoreTennisLeagueIds.__members__:
            continue

        total_prize_money = extract_fact_value(league.facts, "Total prize money")
        number_of_sets = extract_fact_value(league.facts, "Number of sets")
        continent = extract_fact_value(league.facts, "Continent")
        draw_size = extract_fact_value(league.facts, "Number of competitors")
        surface_type_id = TOURNAMENT_TO_SURFACE_TYPE_MAP[league_id]

        print(league.name_translations.en, league.start_date)

        # Fetch seasons for the current league
        seasons = api.get_seasons_by_league(league.id)
        if not seasons:
            print(f"No seasons found for {league.name_translations.en}")
            continue

        for season in seasons:
            print(season.name, season.year_start, season.year_end)

            # Upsert season data to Supabase
            supabase_client.upsert_event(
                name=season.name,
                event_type_id=1,  # grand slam
                location=continent,
                surface_type_id=surface_type_id,
                prize_money=total_prize_money,
                draw_size=draw_size,
                event_start_date=season.year_start,
                event_end_date=season.year_end or -1,
                event_year=season.year_start,
                length=int(number_of_sets),
            )

            # Fetch events for the current season
            matches = api.get_events_by_season(season.id)
            if not matches:
                print(f"No matches found for tournament {season.name}")
                continue

            for match in matches:
                # Upsert match data to Supabase
                supabase_client.upsert_match(
                    event_id=match.id,
                    player_a_id=match.player_a_id,
                    player_b_id=match.player_b_id,
                    winner_id=match.winner_id,
                    match_duration=match.duration,
                    match_start_time=match.start_time,
                    match_end_time=match.end_time,
                )

                # Upsert set scores for each match
                for set_score in match.set_scores:
                    supabase_client.insert_set_score(
                        match_id=match.id,
                        set_number=set_score.number,
                        player_a_score=set_score.player_a_score,
                        player_b_score=set_score.player_b_score,
                        tie_break_points_a=set_score.tie_break_points_a,
                        tie_break_points_b=set_score.tie_break_points_b,
                    )


if __name__ == "__main__":
    main()
