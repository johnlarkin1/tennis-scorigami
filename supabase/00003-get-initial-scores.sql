CREATE OR REPLACE FUNCTION get_initial_scores(
  p_event_id INT DEFAULT NULL,
  p_event_year INT DEFAULT NULL
)
RETURNS TABLE (
  event_id INT,
  event_name TEXT,
  event_year INT,
  event_gender TEXT,
  player_a_scores INT,
  player_b_scores INT,
  player_a_tiebreak_points INT,
  player_b_tiebreak_points INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
      e.event_id,
      e.name AS event_name,
      e.event_year,
      e.event_gender,
      ss.player_a_score AS player_a_scores,
      ss.player_b_score AS player_b_scores,
      ss.tie_break_points_a AS player_a_tiebreak_points,
      ss.tie_break_points_b AS player_b_tiebreak_points
  FROM
      match m
  JOIN
      set_score ss ON m.match_id = ss.match_id
  JOIN
      player player_a ON m.player_a_id = player_a.player_id
  JOIN
      player player_b ON m.player_b_id = player_b.player_id
  JOIN
      event e ON m.event_id = e.event_id
  JOIN
      match_round r ON m.round_id = r.round_id
  WHERE
      ss.set_number = 1 -- Only return the first set
      AND (p_event_id IS NULL OR e.event_id = p_event_id)  -- Filter by event_id if provided
      AND (p_event_year IS NULL OR e.event_year = p_event_year); -- Filter by event_year if provided
END;
$$ LANGUAGE plpgsql;
