CREATE TABLE country (
    country_id SERIAL PRIMARY KEY,                -- Unique identifier for each country
    country_code CHAR(3) UNIQUE NOT NULL,         -- ISO Alpha-3 country code, e.g., 'USA', 'GBR'
    country_name VARCHAR(100) UNIQUE NOT NULL,    -- Full country name, e.g., 'United States', 'United Kingdom'
    population BIGINT,                            -- Population, nullable
    continent VARCHAR(50),                        -- Continent, nullable
    region VARCHAR(100),                          -- Optional region or subcontinent, nullable
    official_language VARCHAR(150)                -- Main or official language, nullable
);

CREATE TABLE surface_type (
    surface_type_id SERIAL PRIMARY KEY,
    surface_type VARCHAR(15) UNIQUE NOT NULL      -- e.g., "clay", "grass", "outdoor hard", "indoor hard"
);

CREATE TABLE event_type (
    event_type_id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) UNIQUE NOT NULL       -- e.g., "Grand Slam"
);

CREATE TABLE player (
    player_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name varchar(50),
    name_code varchar(5),
    country_id INTEGER REFERENCES country(country_id) ON DELETE SET NULL,
    sex varchar(2),
    date_of_birth DATE,
    place_of_birth varchar(50),
    handedness VARCHAR(10) CHECK (handedness IN ('right', 'left')),
    height_cm INTEGER,
    weight_kg INTEGER,
    last_update_time TIMESTAMP,
    last_known_ranking INTEGER,
    external_id varchar(50),
    source varchar(10)
);

CREATE TABLE player_statistic (
    stat_id UUID PRIMARY KEY,
    player_id INTEGER REFERENCES player(player_id) ON DELETE CASCADE,
    total_matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    surface_type_id INTEGER NOT NULL REFERENCES surface_type(surface_type_id) ON DELETE RESTRICT, -- Non-nullable surface type
    win_percentage DECIMAL(5, 2),
    titles_won INTEGER DEFAULT 0,
    top_10_wins INTEGER DEFAULT 0,
    grand_slam_titles INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE player_rank_history (
    rank_history_id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES player(player_id) ON DELETE CASCADE,
    ranking INTEGER,
    ranking_date DATE
);

CREATE TABLE event (
    event_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    event_type_id INTEGER NOT NULL REFERENCES event_type(event_type_id) ON DELETE RESTRICT, -- Non-nullable event type
    location VARCHAR(100),
    surface_type_id INTEGER NOT NULL REFERENCES surface_type(surface_type_id) ON DELETE RESTRICT, -- Non-nullable surface type
    prize_money DECIMAL(15, 2),
    draw_size INTEGER,
    event_start_date DATE,
    event_end_date DATE,
    event_year int,
    length INTEGER CHECK (length IN (3, 5)),      -- 3 sets or 5 sets
    external_id varchar(50)
);

ALTER TABLE event ADD CONSTRAINT unique_event_external_id UNIQUE (external_id);
ALTER TABLE match ADD CONSTRAINT unique_match_external_id UNIQUE (external_id);


CREATE TABLE match (
    match_id SERIAL PRIMARY KEY,
    event_id SERIAL REFERENCES event(event_id) ON DELETE CASCADE,
    player_a_id INTEGER REFERENCES player(player_id),
    player_b_id INTEGER REFERENCES player(player_id),
    winner_id INTEGER REFERENCES player(player_id),
    match_duration INTERVAL,
    match_start_time TIMESTAMP,
    match_end_time TIMESTAMP,
    external_id varchar(50),
    round_id INTEGER REFERENCES match_round(round_id)
);

CREATE TABLE set_score (
    set_score_id SERIAL PRIMARY KEY,
    match_id SERIAL REFERENCES match(match_id) ON DELETE CASCADE,
    set_number INTEGER CHECK (set_number BETWEEN 1 AND 5),
    player_a_score INTEGER,
    player_b_score INTEGER,
    tie_break_points_a INTEGER,                -- nullable, only if decided by a tiebreak
    tie_break_points_b INTEGER,                 -- nullable, only if decided by a tiebreak
    external_id varchar(50)
);


CREATE TABLE match_round (
    round_id SERIAL PRIMARY KEY,
    round_name VARCHAR(50) UNIQUE NOT NULL   -- e.g., "First Round", "Quarterfinal", "Semifinal", "Final"
);

