import time

from tqdm import tqdm

from permutation_analysis.config import (
    SUPABASE_RAW_DB_HOST,
    SUPABASE_RAW_DB_NAME,
    SUPABASE_RAW_DB_PASSWORD,
    SUPABASE_RAW_DB_PORT,
    SUPABASE_RAW_DB_USER,
)
from permutation_analysis.match_processor import MatchProcessor
from permutation_analysis.supa_raw_client import SupaRawClient


def main() -> None:
    processor = MatchProcessor()
    db_client = SupaRawClient(
        dbname=SUPABASE_RAW_DB_NAME,
        user=SUPABASE_RAW_DB_USER,
        password=SUPABASE_RAW_DB_PASSWORD,
        host=SUPABASE_RAW_DB_HOST,
        port=SUPABASE_RAW_DB_PORT,
    )
    db_client.ensure_connectivity()
    db_client.clear_prepared_statements()

    # Fetch and track progress of match data loading
    print("🔄 Loading match data from the database...")
    start_time = time.time()
    matches = db_client.fetch_aggregated_match_data()
    print(f"✅ Loaded {len(matches)} matches in {time.time() - start_time:.2f}s")

    # Process matches with tqdm tracking
    print("🔄 Processing match data for permutations and transitions...")
    with tqdm(total=len(matches), desc="Processing matches") as pbar:
        permutation_counts, permutation_matches, transitions, total_transitions = (
            processor.process_matches(matches, pbar)
        )
    print("✅ Finished processing matches.")

    # Insert permutations with tqdm tracking
    print("🔄 Inserting or updating permutations...")
    start_time = time.time()
    permutation_ids = db_client.insert_permutations_if_not_exist(permutation_counts)
    print(f"✅ Inserted/updated permutations in {time.time() - start_time:.2f}s")

    # Insert permutation matches with tqdm tracking
    print("🔄 Inserting permutation matches...")
    start_time = time.time()
    db_client.insert_permutation_matches(permutation_matches, permutation_ids)
    print(f"✅ Inserted permutation matches in {time.time() - start_time:.2f}s")

    # Update transition matrix with tqdm tracking
    print("🔄 Updating transition matrix...")
    start_time = time.time()
    db_client.upsert_transition_matrix(transitions, total_transitions)
    print(f"✅ Updated transition matrix in {time.time() - start_time:.2f}s")

    db_client.close()
    print("✅ Database connection closed.")


if __name__ == "__main__":
    main()
