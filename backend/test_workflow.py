import requests
import time

BASE_URL = "http://localhost:8080/api"

print("--- Testing Layer 1: Ingestion & Qualification Gate ---")
ingest_payload = {
    "customer": "John Doe LLC",
    "type": "Sanctions Velocity",
    "amount": 55000.0
}
res = requests.post(f"{BASE_URL}/ingest", json=ingest_payload)
print(f"Ingest Status: {res.status_code}")
alert = res.json()
print("Alert Response:", alert)
case_id = f"CASE-{alert['id'].split('-')[1]}"
print(f"Assumed Case ID: {case_id}")

print("\n--- Testing Layer 2: Dashboard Queue ---")
res = requests.get(f"{BASE_URL}/dashboard")
print(f"Dashboard Status: {res.status_code}")
print("Dashboard Items Count:", len(res.json()))

print("\n--- Testing Layer 3: Evidence Assembly ---")
res = requests.get(f"{BASE_URL}/evidence/{case_id}")
print(f"Evidence Status: {res.status_code}")
evidence = res.json()
print("Evidence Keys:", evidence.keys() if res.status_code == 200 else evidence)

print("\n--- Testing Layer 4: Live Gemini SAR Generation ---")
res = requests.post(f"{BASE_URL}/pipeline/generate/{case_id}")
print(f"Pipeline Generate Status: {res.status_code}")
try:
    print("SAR Data:", res.json())
except Exception as e:
    print("Error parsing SAR:", res.text)

print("\n--- Testing Layer 5: Governance Signoff ---")
signoff_payload = {
    "case_id": case_id,
    "action": "approve",
    "role": "auditor",
    "notes": "Looks good, sending to FINCEN."
}
res = requests.post(f"{BASE_URL}/governance/signoff", json=signoff_payload)
print(f"Signoff Status: {res.status_code}")
print("Signoff Response:", res.json())

