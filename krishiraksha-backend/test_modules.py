"""
Automated verification for Items 10a (Sensors & Traps), 10b (Weather Outbreak Forecast),
10c (Multilingual Advisories), and 10d (Case Chat & Notifications).
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== Testing KrishiRaksha Extended Modules ===")

    # 1. Login as Farmer
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "identifier": "farmer@krishiraksha.org",
        "password": "Farmer@123"
    })
    assert login_res.status_code == 200, f"Farmer login failed: {login_res.text}"
    farmer_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {farmer_token}"}
    print("[PASS] Farmer authenticated successfully via JWT.")

    # 2. Test Sensors & Pest Trap Logging (Item 10a)
    traps_res = requests.get(f"{BASE_URL}/sensors/traps/104", headers=headers)
    assert traps_res.status_code == 200, f"Get traps failed: {traps_res.text}"
    traps = traps_res.json()
    assert len(traps) >= 1, "No traps found"
    print(f"[PASS] Retrieved {len(traps)} trap records. Top trap pest: {traps[0]['target_pest']}.")

    # Log a new trap breach
    log_trap_res = requests.post(f"{BASE_URL}/sensors/traps", headers=headers, json={
        "field_id": "104",
        "trap_type": "pheromone_trap",
        "target_pest": "Helicoverpa armigera",
        "count": 19,
        "economic_threshold": 15,
        "notes": "Verified morning count"
    })
    assert log_trap_res.status_code == 200, f"Log trap failed: {log_trap_res.text}"
    trap_data = log_trap_res.json()
    assert trap_data["threshold_breached"] == True
    print(f"[PASS] Logged trap breach: {trap_data['message']}")

    # 3. Test Weather-Based Outbreak Forecast & Multilingual Advisories (Items 10b & 10c)
    fc_en = requests.get(f"{BASE_URL}/forecast/alerts/104?lang=en", headers=headers)
    assert fc_en.status_code == 200, f"Forecast EN failed: {fc_en.text}"
    fc_data_en = fc_en.json()
    assert len(fc_data_en) >= 1, "No forecast alerts found"
    print(f"[PASS] 5-Day Weather Forecast (EN): {fc_data_en[0]['disease']} ({fc_data_en[0]['probability_pct']}% probability)")

    # Fetch Hindi translation
    fc_hi = requests.get(f"{BASE_URL}/forecast/alerts/104?lang=hi", headers=headers)
    assert fc_hi.status_code == 200, f"Forecast HI failed: {fc_hi.text}"
    fc_data_hi = fc_hi.json()
    assert "अगेती" in fc_data_hi[0].get("localized_disease", ""), f"Hindi translation missing: {fc_data_hi[0]}"
    print(f"[PASS] Multilingual Forecast (HI): {fc_data_hi[0]['localized_disease'].encode('unicode_escape').decode()}")

    # 4. Test Case-Linked Direct Messaging (Item 10d)
    msg_get = requests.get(f"{BASE_URL}/messages/case/obs_seed_104_1", headers=headers)
    assert msg_get.status_code == 200, f"Get messages failed: {msg_get.text}"
    case_thread = msg_get.json()
    assert len(case_thread["messages"]) >= 2, "Expected seeded case messages"
    assert case_thread["context"] is not None, "Context must accompany case messages"
    print(f"[PASS] Case chat retrieved {len(case_thread['messages'])} messages with context for {case_thread['context']['crop']}.")

    # Send a message
    send_res = requests.post(f"{BASE_URL}/messages", headers=headers, json={
        "case_id": "obs_seed_104_1",
        "field_id": "104",
        "receiver_id": "usr_expert_1",
        "text": "Dr. Nair, I have pruned the 3 lower leaves as advised. Please review!"
    })
    assert send_res.status_code == 200, f"Send message failed: {send_res.text}"
    print(f"[PASS] Message sent to expert. Message ID: {send_res.json()['message_id']}")

    # Check alert was created for the recipient
    alerts_res = requests.get(f"{BASE_URL}/alerts/104", headers=headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    has_msg_alert = any(a.get("alert_type") == "CASE_MESSAGE" for a in alerts)
    assert has_msg_alert, "Expected notification alert for new case message"
    print("[PASS] Alert notification successfully generated for case message recipient.")

    print("\nALL 4 NEW MODULES PASSED VERIFICATION WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_tests()
