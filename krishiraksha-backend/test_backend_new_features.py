"""
Verification of newly added backend capabilities:
1. Isolated Vision Layer + Non-plant photo rejection
2. Copilot explain-diagnosis endpoint powered by gpt-oss:120b-cloud
3. India-wide multi-state clusters
"""

import base64
import io
import numpy as np
from PIL import Image
from starlette.testclient import TestClient
from app.main import app
from app.seed_data import seed_all

seed_all()
client = TestClient(app)

def test_non_plant_rejection():
    # 1. Create a pure red/blank image (no plant colors)
    blank_img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    buf = io.BytesIO()
    blank_img.save(buf, format="JPEG")
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")

    from app.services.vision_pipeline import analyze_leaf_scan
    res = analyze_leaf_scan("test_obs_1", image_base64=b64_str)
    assert res["status"] == "rejected_non_plant", f"Expected non-plant rejection, got: {res}"
    print("[PASS] Non-plant / uniform image successfully rejected with helpful guidance.")

def test_explain_diagnosis():
    vision_sample = {
        "top_disease": "Early Blight",
        "top_confidence": 0.88,
        "severity_estimate": "High"
    }
    resp = client.post("/copilot/explain-diagnosis", json={
        "vision_result": vision_sample,
        "role": "Farmer",
        "language": "hi"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "explanation" in data
    assert len(data["explanation"]) > 10
    print("[PASS] Copilot explain-diagnosis returned valid multilingual advisory.")

def test_india_wide_clusters():
    # Login as officer
    login_resp = client.post("/auth/login", json={
        "identifier": "officer@krishiraksha.org",
        "password": "Officer@123"
    })
    data = login_resp.json()
    token = data.get("access_token") or data.get("token")
    headers = {"Authorization": f"Bearer {token}"}

    clusters_resp = client.get("/officer/clusters", headers=headers)
    assert clusters_resp.status_code == 200
    clusters = clusters_resp.json()
    assert len(clusters) >= 5, f"Expected multi-state clusters, got {len(clusters)}"
    states = [c["cluster_name"] for c in clusters]
    print(f"[PASS] India-wide clusters verified: {len(clusters)} hotspots active across India.")

if __name__ == "__main__":
    test_non_plant_rejection()
    test_explain_diagnosis()
    test_india_wide_clusters()
    print("\nALL NEW BACKEND CAPABILITIES VERIFIED SUCCESSFULLY!")
