import os
import json
import time
import csv
from typing import Dict, Any, Optional

import requests
from dotenv import load_dotenv

CSV_PATH = os.path.join(os.path.dirname(__file__), 'capitalone_data.csv')
MAP_OUT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'outputs', 'nessie_customers_map.json')
NESSIE_BASE = 'https://api.nessieisreal.com'


def nessie_key() -> Optional[str]:
    load_dotenv()
    return os.getenv('CAPITAL_ONE_API_KEY')


def ensure_outputs_dir():
    out_dir = os.path.dirname(MAP_OUT)
    os.makedirs(out_dir, exist_ok=True)


def create_customer(api_key: str, first_name: str, last_name: str, city: str, state: str) -> Optional[Dict[str, Any]]:
    # Minimal viable payload for /customers
    address = {
        'street_number': '1',
        'street_name': 'Main St',
        'city': city or 'Unknown',
        'state': state or 'NA',
        'zip': '00000',
    }
    payload = {
        'first_name': first_name,
        'last_name': last_name,
        'address': address,
    }
    url = f"{NESSIE_BASE}/customers?key={api_key}"
    try:
        resp = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload, timeout=15)
        if resp.status_code in (200, 201):
            data = resp.json()
            # Nessie often wraps in {'objectCreated': {...}}
            return data.get('objectCreated') if isinstance(data, dict) and 'objectCreated' in data else data
        else:
            print(f"Create failed {resp.status_code}: {resp.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Network error creating customer: {e}")
        return None


def get_customer(api_key: str, customer_id: str) -> Optional[Dict[str, Any]]:
    url = f"{NESSIE_BASE}/customers/{customer_id}?key={api_key}"
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"Get failed {resp.status_code}: {resp.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Network error getting customer: {e}")
        return None


def read_csv_rows(csv_path: str):
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row


def run(max_rows: int = 25, sleep_secs: float = 0.25):

    key = nessie_key()
    if not key or not key.strip():
        print("[ERROR] No CAPITAL_ONE_API_KEY found in .env or environment. Aborting. Please set it and try again.")
        return
    print(f"[INFO] Using API key: {key[:4]}...{key[-4:]} (length {len(key)})")

    ensure_outputs_dir()

    # Load existing mapping if present
    if os.path.exists(MAP_OUT):
        with open(MAP_OUT, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
    else:
        mapping = {}

    created = 0
    attempted = 0
    for i, row in enumerate(read_csv_rows(CSV_PATH)):
        if i >= max_rows:
            break
        csv_customer_id = row.get('customer_id')
        customer_name = (row.get('customer_name') or '').strip()
        if not customer_name:
            print(f"[WARN] Row {i} missing customer_name, skipping.")
            continue
        first_name, last_name = (customer_name.split(' ', 1) + [''])[:2]

        # Skip if already mapped
        if csv_customer_id in mapping:
            print(f"[INFO] Row {i} ({customer_name}) already mapped, skipping.")
            continue

        city = row.get('city')
        state = row.get('state')
        print(f"[POST] Creating customer {customer_name} (city={city}, state={state})...")
        data = create_customer(key, first_name, last_name, city, state)
        attempted += 1
        if data and isinstance(data, dict) and data.get('_id'):
            mapping[csv_customer_id] = {
                'nessie_customer_id': data['_id'],
                'first_name': data.get('first_name', first_name),
                'last_name': data.get('last_name', last_name),
            }
            created += 1
            print(f"[OK] Created {customer_name} -> {data['_id']}")
        else:
            print(f"[FAIL] Could not create {customer_name} (row {i}).")
        time.sleep(sleep_secs)

    if created > 0:
        with open(MAP_OUT, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, indent=2)
        print(f"[SUCCESS] Wrote mapping file: {MAP_OUT}")
    else:
        print("[ERROR] No customers created. Check API key, rate limits, or payload format.")

    print(f"[SUMMARY] Attempted: {attempted}, Created: {created}, Total mapped: {len(mapping)}")


if __name__ == '__main__':
    run()
