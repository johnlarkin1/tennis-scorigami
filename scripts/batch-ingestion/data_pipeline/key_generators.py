import uuid


def get_player_uuid(player_fullname: str) -> str:
    """Generate a UUID for a player using their name full."""
    return str(uuid.uuid5(uuid.NAMESPACE_OID, player_fullname))
