import requests
from config import SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL
from supabase import Client, create_client

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
response = requests.get("https://restcountries.com/v3.1/all")
countries = response.json()

# Transform data
data = [
    {
        "country_code": country["cca3"],
        "country_name": country["name"]["common"],
        "population": country.get("population"),
        "continent": country.get("region"),
        "region": country.get("subregion"),
        "official_language": (
            ", ".join([lang for lang in country.get("languages", {}).values()]) if country.get("languages") else None
        ),
    }
    for country in countries
]

# Insert data into Supabase table in batches
batch_size = 50  # Adjust batch size as needed for optimal performance
response = supabase.table("country").select("*").execute()
print("response", response)
i = 0
for i in range(0, len(data), batch_size):
    batch = data[i : i + batch_size]
    for item in batch:
        for key, value in item.items():
            if value and isinstance(value, str) and len(value) > 150:
                print(f"Field {key} exceeds 150 characters in batch {i // batch_size + 1}")
                print("value", value)
    response = supabase.table("country").insert(batch).execute()
    print(f"Batch {i // batch_size + 1} inserted successfully.")

# Ensure the last batch is not missed
print("i", i)
last_batch = data[i + batch_size :]
if last_batch:
    response = supabase.table("country").insert(last_batch).execute()
    print(f"Last batch inserted successfully with size: {len(last_batch)}.")
