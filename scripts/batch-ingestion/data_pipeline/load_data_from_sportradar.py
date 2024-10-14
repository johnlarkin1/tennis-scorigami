from sportradar_tennis_v3.api.competitions import get_competition_seasons, get_competitions
from sportradar_tennis_v3.api.competitors import get_competitor_profile
from sportradar_tennis_v3.api.seasons import get_season_info, get_season_summaries
from sportradar_tennis_v3.models.get_competition_seasons_locale import GetCompetitionSeasonsLocale
from sportradar_tennis_v3.models.get_competitions_locale import GetCompetitionsLocale
from sportradar_tennis_v3.models.get_competitions_response_200_competitions_item_level import (
    GetCompetitionsResponse200CompetitionsItemLevel,
)
from sportradar_tennis_v3.models.get_competitor_profile_locale import GetCompetitorProfileLocale
from sportradar_tennis_v3.models.get_season_info_locale import GetSeasonInfoLocale
from sportradar_tennis_v3.models.get_season_summaries_locale import GetSeasonSummariesLocale

from data_pipeline.api_wrappers.sportradar.api import SportradarClient
from data_pipeline.config import SPORTRADAR_API_KEY
from data_pipeline.supa import SupabaseClient


def main() -> None:
    sr_client = SportradarClient(api_key=SPORTRADAR_API_KEY)
    supa = SupabaseClient()
    country_code_to_id = supa.get_country_code_to_id_map()
    player_sr_id_to_id = supa.get_player_sr_id_to_id_map()
    print("player_sr_id_to_id", player_sr_id_to_id)
    round_type_to_id_map = supa.get_round_type_to_id_map()

    response = get_competitions.sync(
        locale=GetCompetitionsLocale.EN,
        client=sr_client,
    )
    assert response
    assert response.competitions
    processed_sr_player_ids = set()
    for competition in response.competitions:
        if (
            competition.level == GetCompetitionsResponse200CompetitionsItemLevel.GRAND_SLAM
            and competition.type == "singles"
        ):
            print("Grand Slam:", competition)

            seasons_response = get_competition_seasons.sync(
                locale=GetCompetitionSeasonsLocale.EN, urn_competition=competition.id, client=sr_client
            )
            assert seasons_response
            assert seasons_response.seasons
            for season in seasons_response.seasons:
                print("Season:", season)

                if (
                    season.end_date.year != 2025
                    and ("men" in competition.name.lower() or "women" in competition.name.lower())
                    and "doubles" not in competition.name.lower()
                    and "wimbledon" in competition.name.lower()
                    and "juniors" not in competition.name.lower()
                    and "wheelchair" not in competition.name.lower()
                ):
                    # process players
                    # season_competitors = get_season_competitors.sync(
                    #     locale=GetSeasonCompetitorsLocale.EN,
                    #     urn_season=season.id,
                    #     client=sr_client,
                    #     limit=2000,
                    # )
                    # assert season_competitors
                    # if not season_competitors.season_competitors:
                    #     continue

                    # for competitor in season_competitors.season_competitors:
                    #     print("Competitor:", competitor)
                    #     assert competitor

                    #     if competitor.id in processed_sr_player_ids:
                    #         continue

                    #     competitor_profile = get_competitor_profile.sync(
                    #         locale=GetCompetitorProfileLocale.EN,
                    #         urn_competitor=competitor.id,
                    #         client=sr_client,
                    #     )
                    #     assert competitor_profile
                    #     # let's be a bit more succinct
                    #     processed_sr_player_ids.add(competitor.id)

                    #     supabase_client.upsert_player_sportradar(
                    #         competitor=competitor_profile, source="sportradar", country_code_to_id=country_code_to_id
                    #     )

                    season_info = get_season_info.sync(
                        locale=GetSeasonInfoLocale.EN,
                        urn_season=season.id,
                        client=sr_client,
                    )
                    assert season_info
                    assert season_info.season
                    assert season_info.season.info

                    surface_type_id = 4

                    if season_info.season.info.surface:
                        surface_type = season_info.season.info.surface.lower()
                        if "grass" in surface_type:
                            surface_type_id = 1
                        elif "clay" in surface_type:
                            surface_type_id = 2
                        elif "hard" in surface_type and "outdoor" in surface_type:
                            surface_type_id = 4
                        elif "hard" in surface_type and "indoor" in surface_type:
                            surface_type_id = 3

                    length = 3 if "women" in competition.name.lower() else 5
                    db_event = supa.upsert_event(
                        name=season.name,
                        event_type_id=1,  # grand slam,
                        location=season_info.season.info.complex_ or "",
                        surface_type_id=surface_type_id,
                        prize_money=season_info.season.info.prize_money or -1,
                        draw_size=season_info.season.info.number_of_qualified_competitors or -1,
                        event_start_date=season_info.season.start_date,
                        event_end_date=season_info.season.end_date,
                        event_year=season_info.season.start_date.year,
                        length=length,
                        external_id=season.id,
                    )

                    start = 0
                    batch_size = 200
                    while True:
                        season_summaries_response = get_season_summaries.sync(
                            locale=GetSeasonSummariesLocale.EN,
                            urn_season=season.id,
                            client=sr_client,
                            limit=batch_size,
                            start=start,
                        )
                        print("Season summaries:", season_summaries_response)
                        assert season_summaries_response
                        if not season_summaries_response.summaries:
                            break

                        start += batch_size

                        for summary in season_summaries_response.summaries:
                            sport_event = summary.sport_event
                            sport_event_status = summary.sport_event_status
                            if not sport_event_status or not sport_event:
                                continue

                            round_name = sport_event.sport_event_context.round_.name
                            if round_name and "qualification" in round_name.lower():
                                continue

                            round_id = round_type_to_id_map[sport_event.sport_event_context.round_.name]

                            competitors = sport_event.competitors
                            if not competitors or len(competitors) != 2:
                                continue
                            home_competitor = competitors[0]
                            if home_competitor.id not in player_sr_id_to_id:
                                # Fetch competitor profile and upsert player if missing
                                competitor_profile = get_competitor_profile.sync(
                                    locale=GetCompetitorProfileLocale.EN,
                                    urn_competitor=home_competitor.id,
                                    client=sr_client,
                                )
                                assert competitor_profile
                                supa.upsert_player_sportradar(
                                    competitor=competitor_profile,
                                    source="sportradar",
                                    country_code_to_id=country_code_to_id,
                                )
                                # Refresh the player ID mapping after insertion
                                player_sr_id_to_id = supa.get_player_sr_id_to_id_map()

                            # Process away competitor
                            away_competitor = competitors[1]
                            if away_competitor.id not in player_sr_id_to_id:
                                # Fetch competitor profile and upsert player if missing
                                competitor_profile = get_competitor_profile.sync(
                                    locale=GetCompetitorProfileLocale.EN,
                                    urn_competitor=away_competitor.id,
                                    client=sr_client,
                                )
                                assert competitor_profile
                                supa.upsert_player_sportradar(
                                    competitor=competitor_profile,
                                    source="sportradar",
                                    country_code_to_id=country_code_to_id,
                                )
                                # Refresh the player ID mapping after insertion
                                player_sr_id_to_id = supa.get_player_sr_id_to_id_map()

                            # Now that we have ensured the players exist, get their IDs
                            home_competitor_id = player_sr_id_to_id.get(home_competitor.id)
                            away_competitor_id = player_sr_id_to_id.get(away_competitor.id)
                            if not home_competitor_id or not away_competitor_id:
                                continue

                            # Determine the winner's ID
                            winner_sr_id = sport_event_status.winner_id
                            if not winner_sr_id:
                                continue  # Skip if no winner is recorded

                            winner_id = player_sr_id_to_id.get(winner_sr_id)
                            if not winner_id:
                                # If winner is not found in mapping, fetch and insert
                                competitor_profile = get_competitor_profile.sync(
                                    locale=GetCompetitorProfileLocale.EN,
                                    urn_competitor=winner_sr_id,
                                    client=sr_client,
                                )
                                assert competitor_profile
                                supa.upsert_player_sportradar(
                                    competitor=competitor_profile,
                                    source="sportradar",
                                    country_code_to_id=country_code_to_id,
                                )
                                player_sr_id_to_id = supa.get_player_sr_id_to_id_map()
                                winner_id = player_sr_id_to_id[winner_sr_id]

                            db_match = supa.upsert_match(
                                event_id=db_event.event_id,
                                player_a_id=home_competitor_id,
                                player_b_id=away_competitor_id,
                                winner_id=winner_id,
                                match_duration=None,
                                match_start_time=sport_event.start_time,
                                match_end_time=None,
                                external_id=sport_event.id,
                                round_id=round_id,
                            )

                            if sport_event_status.period_scores:
                                for score in sport_event_status.period_scores:
                                    assert score.number
                                    supa.upsert_set_score(
                                        match_id=db_match.match_id,
                                        set_number=score.number,
                                        player_a_score=score.home_score,
                                        player_b_score=score.away_score,
                                        external_match_id=sport_event.id,
                                        tie_break_points_a=score.home_tiebreak_score or None,
                                        tie_break_points_b=score.away_tiebreak_score or None,
                                    )


if __name__ == "__main__":
    main()
