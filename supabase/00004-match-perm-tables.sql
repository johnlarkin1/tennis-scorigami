-- create match permutation tables
CREATE TABLE IF NOT EXISTS match_permutation (
    permutation_id SERIAL PRIMARY KEY,
    permutation_string TEXT UNIQUE NOT NULL,
    occurrence_count INTEGER DEFAULT 0
);

-- Create table to map permutations to matches where they have occurred
CREATE TABLE IF NOT EXISTS permutation_match (
    permutation_id INTEGER REFERENCES match_permutation(permutation_id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES match(match_id) ON DELETE CASCADE,
    PRIMARY KEY (permutation_id, match_id)
);

-- Create table for set score transition matrix with partitioning
CREATE TABLE IF NOT EXISTS set_score_transition_matrix (
    id SERIAL PRIMARY KEY,
    current_set_score TEXT NOT NULL,
    next_set_score TEXT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    event_type_id REFERENCES event_type(event_type_id) on DELETE CASCADE,
    transition_count INTEGER DEFAULT 0,
    transition_probability DOUBLE PRECISION DEFAULT 0
);

-- Add a unique constraint to avoid duplicate entries
ALTER TABLE set_score_transition_matrix ADD CONSTRAINT unique_transition
UNIQUE (current_set_score, next_set_score, gender, event_type);