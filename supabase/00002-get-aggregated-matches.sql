CREATE OR REPLACE FUNCTION get_aggregated_match_scores()
RETURNS TABLE (
  match_id INT,
  player_a_full_name TEXT,
  player_b_full_name TEXT,
  round_name TEXT,
  event_name TEXT,
  event_gender TEXT,
  event_year INT,
  player_a_scores INT[],
  player_b_scores INT[],
  match_start_time TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.match_id,
    player_a.full_name::TEXT AS player_a_full_name,  -- Cast to TEXT
    player_b.full_name::TEXT AS player_b_full_name,  -- Cast to TEXT
    mr.round_name::TEXT AS round_name,              -- Cast to TEXT
    e.name::TEXT AS event_name,                     -- Cast to TEXT
    e.event_gender::TEXT AS event_gender,           -- Cast to TEXT
    e.event_year,
    array_agg(ss.player_a_score ORDER BY ss.set_number) AS player_a_scores,
    array_agg(ss.player_b_score ORDER BY ss.set_number) AS player_b_scores,
    m.match_start_time
  FROM set_score ss
  JOIN match m ON ss.match_id = m.match_id
  JOIN match_round mr ON m.round_id = mr.round_id
  JOIN event e ON m.event_id = e.event_id
  JOIN player player_a ON m.player_a_id = player_a.player_id
  JOIN player player_b ON m.player_b_id = player_b.player_id
  GROUP BY m.match_id, player_a.full_name, player_b.full_name, mr.round_name, e.name, e.event_year, e.event_gender, m.match_start_time;
END;
$$;


select *
from get_aggregated_match_scores()