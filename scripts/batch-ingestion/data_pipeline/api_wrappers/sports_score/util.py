import re
from datetime import datetime
from typing import List, Optional

from data_pipeline.api_wrappers.sports_score.model import Fact, PlayerDetails


def extract_fact_value(facts: List[Fact], name: str) -> str:
    """Helper function to extract fact value by name from facts list."""
    for fact in facts:
        if fact.name == name:
            return fact.value
    return "Unknown"


def extract_country(details: PlayerDetails) -> Optional[str]:
    """Extract the country name from details."""
    return details.country if details else None


def extract_country_iso(details: PlayerDetails) -> Optional[str]:
    """Extract the ISO country code from details."""
    return details.country_iso if details else None


def extract_place_of_birth(details: PlayerDetails) -> Optional[str]:
    """Extract the place of birth from details."""
    return details.birthplace if details else None


def extract_date_of_birth(details: PlayerDetails) -> Optional[str]:
    """Extract and format date of birth from details."""
    dob_raw = details.date_of_birth if details else None
    if dob_raw:
        # The date appears as "31 (25 Dec 1991)", so let's use regex to get the actual date
        match = re.search(r"\((\d{2} \w{3} \d{4})\)", dob_raw)
        if match:
            date_of_birth_str = match.group(1)  # Returns "25 Dec 1991"
            return datetime.strptime(date_of_birth_str, "%d %b %Y").date().isoformat()
    return None


def extract_handedness(details: PlayerDetails) -> Optional[str]:
    """Extract handedness (Right or Left) from details."""
    handedness = details.plays if details else None
    if handedness and "Left" in handedness:
        return "Left"
    elif handedness and "Right" in handedness:
        return "Right"
    return None


def extract_weight(details: PlayerDetails) -> Optional[int]:
    """Extract weight in kg from details."""
    weight_str = details.weight if details else None
    if weight_str:
        weight_match = re.search(r"(\d+)", weight_str)
        if weight_match:
            return int(weight_match.group(1))
    return None


def extract_height_cm(details: PlayerDetails) -> Optional[int]:
    """Extract height in cm from details."""
    return int(details.height_meters * 100) if details.height_meters else None


def extract_prize_money(details: PlayerDetails) -> Optional[int]:
    """Extract total prize money in euros from details."""
    prize_money = details.prize_total_euros if details else None
    return int(prize_money) if prize_money is not None else None
