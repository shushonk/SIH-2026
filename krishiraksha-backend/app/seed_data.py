"""
Seed data generator for KrishiRaksha SQLite database.
Populates all 24 entities with realistic agricultural data for Pune/Khed Maharashtra agro-climatic region.
"""

import json
from datetime import datetime, timedelta
from app.database import get_db, init_db, query_db, execute_db


def seed_all():
    init_db()

    conn = get_db()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as count FROM roles;")
    if cursor.fetchone()["count"] > 0:
        cursor.execute("SELECT COUNT(*) as count FROM clusters;")
        if cursor.fetchone()["count"] < 6:
            multi_clusters = [
                ("cluster_kolar_tomato", "Kolar-Chintamani Tomato Blight Hotspot (KA)", "Tomato Leaf Curl & Blight", 13.1367, 78.1291, 8.5, 14, 0.55, "active", "2026-08-28"),
                ("cluster_jalandhar_potato", "Jalandhar Doaba Potato Late Blight (PB)", "Potato Late Blight", 31.3260, 75.5762, 12.0, 22, 0.80, "active", "2026-08-30"),
                ("cluster_guntur_chili", "Guntur-Tenali Chili Anthracnose Belt (AP)", "Chili Anthracnose & Thrips", 16.3067, 80.4365, 6.8, 18, 0.42, "active", "2026-08-27"),
                ("cluster_anand_tobacco", "Anand-Kheda Solanaceous Blight (GJ)", "Solanaceous Damping-off", 22.5645, 72.9289, 5.5, 8, 0.28, "active", "2026-09-01"),
                ("cluster_hooghly_potato", "Hooghly-Arambagh Potato Blight Surge (WB)", "Potato Late Blight", 22.8895, 87.7844, 9.2, 16, 0.65, "active", "2026-08-29"),
            ]
            for cl in multi_clusters:
                cursor.execute("INSERT OR IGNORE INTO clusters (cluster_id, cluster_name, disease, center_lat, center_lon, radius_km, total_cases, spread_velocity_km_day, active_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", cl)
            conn.commit()

        # Check if new tables (entities 25-28) need seeding
        cursor.execute("SELECT COUNT(*) as count FROM sensor_readings;")
        if cursor.fetchone()["count"] == 0:
            obs_id = "obs_seed_104_1"
            # Seed 16. Sensor Readings
            sensor_readings = [
                ("sens_1", "104", "soil_moisture", 74.0, "%", 0, "IoT_Station_Alpha", (datetime.now() - timedelta(hours=3)).isoformat()),
                ("sens_2", "104", "leaf_wetness", 8.5, "hours", 1, "IoT_LeafWet_01", (datetime.now() - timedelta(hours=2)).isoformat()),
                ("sens_3", "104", "canopy_humidity", 86.0, "%", 1, "IoT_RH_Sensor", (datetime.now() - timedelta(hours=1)).isoformat()),
                ("sens_4", "218", "soil_moisture", 58.0, "%", 0, "IoT_Station_Beta", (datetime.now() - timedelta(hours=5)).isoformat()),
                ("sens_5", "301", "leaf_wetness", 3.2, "hours", 0, "IoT_Station_Gamma", (datetime.now() - timedelta(hours=4)).isoformat()),
            ]
            cursor.executemany("INSERT INTO sensor_readings (reading_id, field_id, sensor_type, value, unit, threshold_exceeded, source, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", sensor_readings)

            # Seed 17. Trap Counts
            trap_counts = [
                ("trap_1", "104", "pheromone_trap", "Helicoverpa armigera", 18, 15, 1, "Ramesh Patil", "Pheromone lure delta trap erected 1m above canopy; moth catch exceeded economic threshold of 15/night.", (datetime.now() - timedelta(hours=6)).isoformat()),
                ("trap_2", "104", "yellow_sticky_card", "Bemisia tabaci (Whitefly)", 22, 30, 0, "Ramesh Patil", "Sticky trap placed in south corner. Moderate whitefly density observed.", (datetime.now() - timedelta(days=1)).isoformat()),
                ("trap_3", "218", "pheromone_trap", "Spodoptera litura", 7, 12, 0, "Suresh Ghadge", "Normal baseline activity.", (datetime.now() - timedelta(days=1)).isoformat()),
            ]
            cursor.executemany("INSERT INTO trap_counts (trap_id, field_id, trap_type, target_pest, count, economic_threshold, threshold_breached, logged_by, notes, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", trap_counts)

            # Seed 18. Forecast Alerts
            forecast_alerts = [
                (
                    "fc_seed_104",
                    "104",
                    "Early Blight",
                    5,
                    82,
                    "Microclimate forecast over next 5 days indicates prolonged 86% RH and 24-27°C canopy temperatures creating an 82% probability window favorable for Early Blight proliferation.",
                    json.dumps([
                        "Prune lower senescent leaves to improve under-canopy airflow and reduce spore splash",
                        "Apply Trichoderma viride bio-fungicide prophylactic spray before forecasted evening rains",
                        "Avoid overhead sprinkler irrigation; maintain root-zone drip only",
                        "Scout border rows every 48 hours for concentric target-pattern lesions"
                    ]),
                    "active",
                    (datetime.now() - timedelta(hours=8)).isoformat()
                )
            ]
            cursor.executemany("INSERT INTO forecast_alerts (forecast_id, field_id, disease, forecast_window_days, probability_pct, favorable_conditions_summary, preventive_actions_json, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", forecast_alerts)

            # Seed 19. Case Messages
            case_messages = [
                (
                    "msg_1",
                    obs_id,
                    "104",
                    "usr_farmer_1",
                    "usr_expert_1",
                    "Dr. Meera Nair, I noticed dark concentric spots spreading on the lower foliage of my Pusa Ruby tomatoes. Should I spray immediately or prune first?",
                    1,
                    (datetime.now() - timedelta(hours=3, minutes=30)).isoformat()
                ),
                (
                    "msg_2",
                    obs_id,
                    "104",
                    "usr_expert_1",
                    "usr_farmer_1",
                    "Namaste Ramesh ji. Do NOT spray heavy chemical fungicides yet. Please prune the bottom 3 affected leaves to halt ground-splash, and upload a close-up photo of the leaf underside so I can rule out Septoria leaf spot.",
                    0,
                    (datetime.now() - timedelta(hours=2, minutes=15)).isoformat()
                )
            ]
            cursor.executemany("INSERT INTO messages (message_id, case_id, field_id, sender_id, receiver_id, text, is_read, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", case_messages)

            conn.commit()
        conn.close()
        return

    # 1. Roles
    roles = [
        ("role_farmer", "Farmer", "Smallholder farmer managing fields and recording crop health observations"),
        ("role_expert", "Expert", "Agronomist / Plant Pathologist performing differential reviews and validation"),
        ("role_officer", "Officer", "Government / Extension Officer managing regional clusters and interventions"),
        ("role_admin", "Admin", "System administrator tracking model metrics, agreement rates, and audit logs"),
    ]
    cursor.executemany("INSERT INTO roles (role_id, role_name, description) VALUES (?, ?, ?);", roles)

    # 2. Users
    from app.auth.security import hash_password
    users = [
        ("usr_farmer_1", "Ramesh Patil", "farmer@krishiraksha.org", "+91 98220 12345", hash_password("Farmer@123"), "role_farmer", "https://ui-avatars.com/api/?name=Ramesh+Patil&background=059669&color=fff"),
        ("usr_expert_1", "Dr. Meera Nair", "expert@krishiraksha.org", "+91 94470 54321", hash_password("Expert@123"), "role_expert", "https://ui-avatars.com/api/?name=Meera+Nair&background=0284c7&color=fff"),
        ("usr_officer_1", "Officer Deshmukh", "officer@krishiraksha.org", "+91 97650 99881", hash_password("Officer@123"), "role_officer", "https://ui-avatars.com/api/?name=Officer+Deshmukh&background=d97706&color=fff"),
        ("usr_admin_1", "Rajesh Verma", "admin@krishiraksha.gov.in", "+91 99110 77665", hash_password("Admin@123"), "role_admin", "https://ui-avatars.com/api/?name=Rajesh+Verma&background=dc2626&color=fff"),
    ]
    cursor.executemany("INSERT INTO users (user_id, name, email, phone, password_hash, role_id, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?);", users)

    # 3. Farms
    farms = [
        ("farm_1", "Patil Bio-Agro", "usr_farmer_1", "Khed Tehsil", "Pune", "Maharashtra", 6.5, 18.5204, 73.8567),
        ("farm_2", "Devi Sustainable Agro", None, "Manchar Valley", "Pune", "Maharashtra", 8.0, 18.5240, 73.8590),
        ("farm_3", "Sahyadri Bio-Farms", None, "Junnar Slopes", "Pune", "Maharashtra", 12.0, 18.6100, 73.9200),
        ("farm_4", "Indrayani Riverbank Krishi", None, "Alandi Basin", "Pune", "Maharashtra", 4.5, 18.5310, 73.8650),
    ]
    cursor.executemany("INSERT INTO farms (farm_id, farm_name, owner_id, location_name, district, state, total_acres, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", farms)

    # 4. Crops
    crops = [
        ("crop_tomato", "Tomato", "Solanum lycopersicum", "Solanaceae", 110),
        ("crop_potato", "Potato", "Solanum tuberosum", "Solanaceae", 95),
        ("crop_chili", "Chili", "Capsicum annuum", "Solanaceae", 130),
    ]
    cursor.executemany("INSERT INTO crops (crop_id, crop_name, scientific_name, category, typical_duration_days) VALUES (?, ?, ?, ?, ?);", crops)

    # 5. Fields
    fields = [
        ("104", "farm_1", "Ramesh Patil", "North Canopy Acre", "Tomato", "Pusa Ruby", 52, "Flowering", 18.5204, 73.8567, "Clay loam", 74.0, "Stable", 82, "HIGH"),
        ("218", "farm_2", "Sunita Devi", "Canal-fed Plot A", "Tomato", "Pusa Ruby", 68, "Fruiting", 18.5240, 73.8590, "Sandy loam", 58.0, "Worsening", 68, "MEDIUM"),
        ("077", "farm_3", "Arun Kumar", "Terraced Ridge 3", "Tomato", "Arka Rakshak", 34, "Vegetative", 18.6100, 73.9200, "Loam", 48.0, "Improving", 22, "LOW"),
        ("301", "farm_1", "Lakshmi Bai", "South Irrigation Plot", "Tomato", "Pusa Ruby", 55, "Flowering", 18.5215, 73.8575, "Clay loam", 71.0, "Stable", 74, "HIGH"),
        ("405", "farm_4", "Vilas Shinde", "Riverbank Bed", "Potato", "Kufri Jyoti", 45, "Vegetative", 18.5310, 73.8650, "Silty clay", 65.0, "Stable", 48, "MEDIUM"),
        ("512", "farm_2", "Geeta More", "East Solar Plot", "Chili", "Pusa Jwala", 40, "Flowering", 18.5150, 73.8480, "Red loam", 52.0, "Improving", 30, "LOW"),
    ]
    cursor.executemany("""
        INSERT INTO fields (field_id, farm_id, owner_name, field_name, crop, variety, age_days, growth_stage, latitude, longitude, soil_type, soil_moisture_pct, health_trend, current_risk_score, current_risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, fields)

    # 6. Crop Cycles
    cycles = [
        ("cycle_104", "104", "Tomato", "Pusa Ruby", "2026-07-15", "2026-11-05", "Flowering", "active"),
        ("cycle_218", "218", "Tomato", "Pusa Ruby", "2026-07-01", "2026-10-20", "Fruiting", "active"),
        ("cycle_077", "077", "Tomato", "Arka Rakshak", "2026-08-01", "2026-11-20", "Vegetative", "active"),
        ("cycle_301", "301", "Tomato", "Pusa Ruby", "2026-07-12", "2026-11-01", "Flowering", "active"),
        ("cycle_405", "405", "Potato", "Kufri Jyoti", "2026-07-22", "2026-10-25", "Vegetative", "active"),
        ("cycle_512", "512", "Chili", "Pusa Jwala", "2026-07-28", "2026-12-05", "Flowering", "active"),
    ]
    cursor.executemany("INSERT INTO crop_cycles (cycle_id, field_id, crop, variety, sowing_date, expected_harvest, current_stage, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", cycles)

    # 7. Knowledge Documents (Strictly safe IPM, no arbitrary pesticide dosages, English + Hindi)
    knowledge_docs = [
        (
            "doc_eb",
            "Early Blight",
            "A destructive fungal disease caused by Alternaria solani affecting solanaceous crops (tomato, potato). Characterized by circular dark brown lesions with concentric bullseye rings, primarily beginning on older lower foliage.",
            json.dumps(["Dark brown spots with concentric bullseye rings", "Chlorotic halo / yellowing surrounding lesions", "Premature senescence of lower canopy leaves", "Collar rot or stem cankers on older stems"]),
            json.dumps([
                "Maintain minimum 60cm plant-to-plant spacing to maximize canopy ventilation",
                "Employ drip irrigation to eliminate overhead water splash and foliage wetting",
                "Apply clean straw mulching (5-7cm depth) to prevent soil-borne spore splash",
                "Practice a minimum 3-year crop rotation away from solanaceous species"
            ]),
            json.dumps([
                "Prune visibly affected lower leaves using sterilized shears; dispose into sealed bio-pit outside farm perimeter",
                "Increase inter-row drainage channels to prevent standing puddles during high-humidity periods",
                "Consult the local Krishi Vigyan Kendra (KVK) or extension officer for authorized bio-fungicides (e.g., Trichoderma harzianum or Bacillus subtilis foliar spray)",
                "Avoid applying uncalibrated chemical fungicides without official label verification"
            ]),
            "If necrotic lesions advance into the upper third of the canopy within 72 hours, submit an urgent expert escalation.",
            json.dumps({
                "hi": {
                    "disease_name": "अगेती झुलसा (अर्ली ब्लाइट)",
                    "description": "अल्टरनेरिया सोलानी कवक द्वारा फैलने वाला एक गंभीर रोग जो टमाटर और आलू की पत्तियों पर संकेंद्रित छल्लों (बुल्स-आई) वाले भूरे-काले धब्बे बनाता है।",
                    "safe_next_steps": [
                        "संक्रमित निचली पत्तियों को तुरंत काटकर खेत से दूर गड्ढे में दबाएं",
                        "ऊपर से छिड़काव सिंचाई तुरंत बंद करें और ड्रिप प्रणाली अपनाएं",
                        "रासायनिक दवाइयों के अनियंत्रित उपयोग से बचें; अधिकृत बायो-फफूंदनाशक के लिए KVK अधिकारी से सलाह लें"
                    ],
                    "escalation_note": "यदि 72 घंटों में धब्बे ऊपरी पत्तों तक फैलते हैं, तो कृषि अधिकारी से तत्काल निरीक्षण की मांग करें।"
                }
            })
        ),
        (
            "doc_septoria",
            "Septoria Leaf Spot",
            "A fungal pathogen (Septoria lycopersici) forming numerous small circular spots with distinct greyish-white centers and dark brown margins. Often confused with Early Blight in early stages.",
            json.dumps(["Numerous small (2-4mm) circular lesions", "Distinct grey/white center with dark border", "Tiny black pycnidia specks visible within lesion centers", "Progressive bottom-up leaf defoliation"]),
            json.dumps([
                "Never enter fields when foliage is wet from morning dew or rain",
                "Thoroughly clean trellising posts and tools between seasons",
                "Plant certified disease-free seeds or resistant rootstocks"
            ]),
            json.dumps([
                "Strip the lowest 20-30cm of foliage once fruit set begins to cut soil splash contact",
                "Ensure stake aerations allow morning dew to evaporate within 2 hours of sunrise",
                "Consult extension specialist for approved copper-based protective barriers if weather forecasts predict sustained rain"
            ]),
            "Escalate immediately if stem cankers develop near vegetative nodes.",
            json.dumps({
                "hi": {
                    "disease_name": "सेप्टोरिया पर्ण धब्बा",
                    "description": "एक कवक रोग जो पत्तियों पर हल्के भूरे/सफेद केंद्र और गहरे किनारों वाले छोटे गोल धब्बे बनाता है।",
                    "safe_next_steps": [
                        "गीले पत्तों को हाथ न लगाएं ताकि बीजाणु न फैलें",
                        "निचली संक्रमित पत्तियों को साफ करें और वायु संचार बढ़ाएं",
                        "उपचार हेतु स्थानीय कृषि विस्तार केंद्र से अनुमोदित सलाह लें"
                    ],
                    "escalation_note": "यदि तने पर काले धब्बे दिखें तो तुरंत कृषि वैज्ञानिक को सूचित करें।"
                }
            })
        ),
        (
            "doc_potassium",
            "Nutrient Deficiency (Potassium)",
            "A physiological nutrient deficiency causing marginal leaf chlorosis, tip burn, and necrosis on older foliage, frequently misdiagnosed as fungal leaf spot.",
            json.dumps(["Marginal yellowing starting at leaf tips and edges", "Dry, scorched edges curling upwards ('firing')", "Uniform bilateral symmetry on leaves, unlike asymmetric fungal spots", "Uneven fruit ripening ('blotchy ripening')"]),
            json.dumps([
                "Perform seasonal comprehensive soil health test before planting",
                "Maintain balanced N:P:K stoichiometry matching crop growth phase",
                "Incorporate composted farmyard manure to enhance cation exchange capacity"
            ]),
            json.dumps([
                "Obtain a certified laboratory soil test before broadcasting synthetic potassic fertilizers",
                "Check irrigation salinity and pH to ensure potassium uptake is not chemically locked",
                "Request an extension soil specialist consultation for recommended foliar potassium sulfate ratios tailored to soil type"
            ]),
            "If leaf margin necrosis spreads despite verified soil balance, request expert pathology review to rule out secondary bacterial infections.",
            json.dumps({
                "hi": {
                    "disease_name": "पोटैशियम की कमी (पोषक तत्व असंतुलन)",
                    "description": "यह कोई कवक या जीवाणु रोग नहीं है, बल्कि मिट्टी में पोटाश की कमी है जिससे पत्तों के किनारे पीले पड़कर झुलस जाते हैं।",
                    "safe_next_steps": [
                        "बिना मिट्टी जांच कराए रासायनिक पोटाश न डालें",
                        "मिट्टी के pH और नमी की जांच करवाएं",
                        "कृषि विज्ञान केंद्र के उर्वरक चार्ट के अनुसार ही पोषक तत्व दें"
                    ],
                    "escalation_note": "यदि पोटाश देने के बाद भी लक्षण न सुधरें तो रोग जांच करवाएं।"
                }
            })
        ),
        (
            "doc_leaf_mold",
            "Tomato Leaf Mold",
            "Caused by Passalora fulva, thrives under high relative humidity (>85%) and poor ventilation, causing pale green/yellow spots on leaf tops and olive-green velvet mold underneath.",
            json.dumps(["Pale yellow diffuse patches on upper leaf surface", "Velvety olive-green to brown fungal sporulation on underside", "Leaves wither and drop prematurely"]),
            json.dumps(["Maintain greenhouse humidity below 80%", "Increase ridge venting and prune sucker branches"]),
            json.dumps(["Increase spacing and prune interior canopy foliage", "Consult extension officer for approved biological agents"]),
            "Escalate if blossom clusters show mold sporulation.",
            json.dumps({
                "hi": {
                    "disease_name": "टमाटर लीफ मोल्ड (फफूंद)",
                    "description": "अधिक नमी वाले मौसम में पत्तों के नीचे जैतूनी-हरे मखमली कवक की परत जम जाती है।",
                    "safe_next_steps": ["खेत और पॉलीहाउस में हवा का बहाव बढ़ाएं", "रोगग्रस्त पत्तों को हटाएं"]
                }
            })
        ),
    ]
    cursor.executemany("""
        INSERT INTO knowledge_documents (doc_id, disease, description, symptoms_json, prevention_json, safe_next_steps_json, escalation_note, translations_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, knowledge_docs)

    # 8. Health Passports
    passports = [
        ("pass_104", "104", "Stable", "Solanaceae Blight monitoring active. 2 historic scans on file. Flowering phase requires strict canopy humidity control. Extension advisory active.", 3, "2026-09-07", "2026-09-08"),
        ("pass_218", "218", "Worsening", "Fruiting stage showing progressive lesion density. Soil moisture 58%. Proximity alert issued regarding Field 104 verified case.", 4, "2026-09-06", "2026-09-08"),
        ("pass_077", "077", "Improving", "Cultivar Arka Rakshak showing high inherent field tolerance. Low lesion incidence following sanitation intervention.", 2, "2026-09-05", "2026-09-08"),
        ("pass_301", "301", "Stable", "Flowering phase plot located within 250m of Field 104. Moderate risk due to shared irrigation boundary.", 2, "2026-09-07", "2026-09-08"),
        ("pass_405", "405", "Stable", "Potato crop showing occasional early leaf necrosis; monitored under regional blight watch.", 1, "2026-09-04", "2026-09-08"),
        ("pass_512", "512", "Improving", "Chili crop healthy with minimal leaf curl incidence. Sensor telemetry within normal bounds.", 1, "2026-09-03", "2026-09-08"),
    ]
    cursor.executemany("""
        INSERT INTO health_passports (passport_id, field_id, trend_label, summary_narrative, total_scans, last_observation_date, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    """, passports)

    # 9. Clusters (All-India Multi-State Seed)
    clusters = [
        ("cluster_pune_blight", "Pune-Khed Solanaceae Early Blight Cluster", "Early Blight", 18.5220, 73.8580, 4.2, 5, 0.35, "active", "2026-08-25"),
        ("cluster_kolar_tomato", "Kolar-Chintamani Tomato Blight Hotspot (KA)", "Tomato Leaf Curl & Blight", 13.1367, 78.1291, 8.5, 14, 0.55, "active", "2026-08-28"),
        ("cluster_jalandhar_potato", "Jalandhar Doaba Potato Late Blight (PB)", "Potato Late Blight", 31.3260, 75.5762, 12.0, 22, 0.80, "active", "2026-08-30"),
        ("cluster_guntur_chili", "Guntur-Tenali Chili Anthracnose Belt (AP)", "Chili Anthracnose & Thrips", 16.3067, 80.4365, 6.8, 18, 0.42, "active", "2026-08-27"),
        ("cluster_anand_tobacco", "Anand-Kheda Solanaceous Blight (GJ)", "Solanaceous Damping-off", 22.5645, 72.9289, 5.5, 8, 0.28, "active", "2026-09-01"),
        ("cluster_hooghly_potato", "Hooghly-Arambagh Potato Blight Surge (WB)", "Potato Late Blight", 22.8895, 87.7844, 9.2, 16, 0.65, "active", "2026-08-29"),
    ]
    cursor.executemany("""
        INSERT INTO clusters (cluster_id, cluster_name, disease, center_lat, center_lon, radius_km, total_cases, spread_velocity_km_day, active_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, clusters)

    # 10. Regional Signals (14-day progression for spatiotemporal replay slider!)
    signals = []
    base_date = datetime.now() - timedelta(days=14)
    # Timeline progression:
    # Day 1-3: Originating isolated cases at Field 104 and Field 301
    signals.append(("sig_1", "cluster_pune_blight", "Early Blight", 1, 18.5204, 73.8567, 0.4, 1, (base_date + timedelta(days=1)).strftime("%Y-%m-%d")))
    signals.append(("sig_2", "cluster_pune_blight", "Early Blight", 2, 18.5215, 73.8575, 0.5, 1, (base_date + timedelta(days=2)).strftime("%Y-%m-%d")))
    signals.append(("sig_3", "cluster_pune_blight", "Early Blight", 3, 18.5208, 73.8570, 0.6, 2, (base_date + timedelta(days=3)).strftime("%Y-%m-%d")))
    # Day 4-7: Expansion across corridor towards Field 218
    signals.append(("sig_4", "cluster_pune_blight", "Early Blight", 4, 18.5225, 73.8580, 0.7, 2, (base_date + timedelta(days=4)).strftime("%Y-%m-%d")))
    signals.append(("sig_5", "cluster_pune_blight", "Early Blight", 5, 18.5240, 73.8590, 0.8, 3, (base_date + timedelta(days=5)).strftime("%Y-%m-%d")))
    signals.append(("sig_6", "cluster_pune_blight", "Early Blight", 6, 18.5230, 73.8585, 0.85, 3, (base_date + timedelta(days=6)).strftime("%Y-%m-%d")))
    signals.append(("sig_7", "cluster_pune_blight", "Early Blight", 7, 18.5250, 73.8600, 0.9, 4, (base_date + timedelta(days=7)).strftime("%Y-%m-%d")))
    # Day 8-10: Peak intensity before officer intervention
    signals.append(("sig_8", "cluster_pune_blight", "Early Blight", 8, 18.5245, 73.8595, 1.0, 5, (base_date + timedelta(days=8)).strftime("%Y-%m-%d")))
    signals.append(("sig_9", "cluster_pune_blight", "Early Blight", 9, 18.5260, 73.8610, 0.95, 5, (base_date + timedelta(days=9)).strftime("%Y-%m-%d")))
    signals.append(("sig_10", "cluster_pune_blight", "Early Blight", 10, 18.5240, 73.8590, 0.85, 4, (base_date + timedelta(days=10)).strftime("%Y-%m-%d")))
    # Day 11-14: Stabilization following bio-fungicide & sanitization advisories
    signals.append(("sig_11", "cluster_pune_blight", "Early Blight", 11, 18.5220, 73.8578, 0.7, 3, (base_date + timedelta(days=11)).strftime("%Y-%m-%d")))
    signals.append(("sig_12", "cluster_pune_blight", "Early Blight", 12, 18.5215, 73.8575, 0.6, 2, (base_date + timedelta(days=12)).strftime("%Y-%m-%d")))
    signals.append(("sig_13", "cluster_pune_blight", "Early Blight", 13, 18.5204, 73.8567, 0.5, 2, (base_date + timedelta(days=13)).strftime("%Y-%m-%d")))
    signals.append(("sig_14", "cluster_pune_blight", "Early Blight", 14, 18.5210, 73.8570, 0.45, 1, (base_date + timedelta(days=14)).strftime("%Y-%m-%d")))

    cursor.executemany("""
        INSERT INTO regional_signals (signal_id, cluster_id, disease, day_step, latitude, longitude, intensity, verified_count, recorded_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, signals)

    # 11. Initial Historical Observation & Analysis for Field 104 (Ambiguous Baseline)
    obs_id = "obs_seed_104_1"
    cursor.execute("""
        INSERT INTO observations (observation_id, field_id, image_ref, symptom_notes, symptom_keywords_json, status, sync_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (obs_id, "104", "tomato_leaf_concentric_01.jpg", "Lower canopy dark spots with slight yellow margin", json.dumps(["leaf_spots_concentric"]), "pending_investigation", "synced", (datetime.now() - timedelta(hours=4)).isoformat()))

    # AI Analysis
    analysis_id = "analysis_seed_1"
    cursor.execute("""
        INSERT INTO ai_analyses (analysis_id, observation_id, model_name, top_disease, top_confidence, severity_estimate, explanation, needs_investigation, investigation_question, model_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        analysis_id,
        obs_id,
        "KrishiRaksha Hybrid Uncertainty Classifier v1.2 (Deterministic Mock Mode)",
        "Early Blight",
        0.54,
        "Medium",
        "Concentric target rings observed on lower leaf surface. However, Septoria leaf spot exhibits overlapping margin characteristics at this resolution.",
        1,
        "Close diagnostic margin detected between Early Blight (54%) and Septoria Leaf Spot (38%). Please upload a clear photo of the leaf underside to check for diagnostic velvety mold or tiny black pycnidia specks.",
        "deterministic_mock_v1",
        (datetime.now() - timedelta(hours=4)).isoformat()
    ))

    # Differential entries
    differentials = [
        ("diff_1", analysis_id, "Early Blight", 0.54, 1, "Concentric target rings on mature foliage"),
        ("diff_2", analysis_id, "Septoria Leaf Spot", 0.38, 2, "Circular spots with dark borders"),
        ("diff_3", analysis_id, "Nutrient Deficiency (Potassium)", 0.08, 3, "Margin chlorosis on older leaves"),
    ]
    cursor.executemany("INSERT INTO differential_diagnoses (differential_id, analysis_id, disease, confidence, rank_order, key_indicators) VALUES (?, ?, ?, ?, ?, ?);", differentials)

    # Investigation Request
    cursor.execute("""
        INSERT INTO investigation_requests (request_id, observation_id, question_prompt, requested_image_type, farmer_answer, narrowed_disease, narrowed_confidence, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        "inv_req_1",
        obs_id,
        "Please capture and upload a close-up photo of the leaf underside to inspect sporulation structures.",
        "underside",
        None,
        None,
        None,
        "pending",
        (datetime.now() - timedelta(hours=4)).isoformat()
    ))

    # 12. Inspection Priorities for Officer Dashboard
    priorities = [
        (
            "prio_1",
            "104",
            1,
            82,
            json.dumps([
                {"factor": "High Verified Severity", "points": 25},
                {"factor": "Vulnerable Growth Stage (Flowering)", "points": 15},
                {"factor": "Cluster Center Proximity (3 cases < 1.5km)", "points": 20},
                {"factor": "Favorable Weather (82% Humidity, Open-Meteo)", "points": 12},
                {"factor": "Susceptible Cultivar ('Pusa Ruby')", "points": 6},
                {"factor": "Elevated Soil Moisture (74%)", "points": 4}
            ]),
            "pending",
            "Officer Deshmukh"
        ),
        (
            "prio_2",
            "301",
            2,
            74,
            json.dumps([
                {"factor": "Immediate Neighbor to Verified Field 104 (120m)", "points": 24},
                {"factor": "Vulnerable Growth Stage (Flowering)", "points": 15},
                {"factor": "Susceptible Cultivar ('Pusa Ruby')", "points": 15},
                {"factor": "High Soil Moisture (71%)", "points": 12},
                {"factor": "High Ambient Humidity Forecast", "points": 8}
            ]),
            "pending",
            "Officer Deshmukh"
        ),
        (
            "prio_3",
            "218",
            3,
            68,
            json.dumps([
                {"factor": "Fruiting Stage Stress Vulnerability", "points": 20},
                {"factor": "Worsening Leaflet Lesion Trend", "points": 18},
                {"factor": "Within 1.8km of Regional Blight Cluster", "points": 15},
                {"factor": "Pheromone Trap Count Elevated (12 pests/trap)", "points": 10},
                {"factor": "Susceptible Cultivar ('Pusa Ruby')", "points": 5}
            ]),
            "pending",
            "Officer Deshmukh"
        ),
        (
            "prio_4",
            "405",
            4,
            48,
            json.dumps([
                {"factor": "Alternative Host Crop (Potato Kufri Jyoti)", "points": 18},
                {"factor": "Riverbank Microclimate Fog Density", "points": 15},
                {"factor": "Vegetative Stage Relative Resistance", "points": -5},
                {"factor": "Distance from Core Hotspot (3.8km)", "points": 20}
            ]),
            "pending",
            None
        ),
        (
            "prio_5",
            "512",
            5,
            30,
            json.dumps([
                {"factor": "Chili Crop Tolerance", "points": 10},
                {"factor": "Well-Drained Red Loam Soil", "points": 5},
                {"factor": "Upwind Spatial Location (4.1km)", "points": 15}
            ]),
            "resolved",
            None
        ),
        (
            "prio_6",
            "077",
            6,
            22,
            json.dumps([
                {"factor": "Cultivar Genetic Resistance ('Arka Rakshak')", "points": -10},
                {"factor": "Low Canopy Moisture (48%)", "points": 4},
                {"factor": "Isolated Terrace Location (>6km from Cluster)", "points": 8},
                {"factor": "Documented Improving Trend", "points": 10},
                {"factor": "Vegetative Stage Vigor", "points": 10}
            ]),
            "resolved",
            None
        ),
    ]
    cursor.executemany("""
        INSERT INTO inspection_priorities (priority_id, field_id, rank_order, priority_score, driving_reasons_json, status, assigned_officer)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    """, priorities)

    # 13. Risk Assessment for Field 104
    cursor.execute("""
        INSERT INTO risk_assessments (assessment_id, field_id, score, level, factors_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?);
    """, (
        "risk_104_initial",
        "104",
        82,
        "HIGH",
        json.dumps([
            {"label": "Moderate-to-High Diagnostic Severity", "weight": 25},
            {"label": "Vulnerable Growth Stage (Flowering)", "weight": 15},
            {"label": "Proximity to Regional Blight Cluster (3 verified cases within 1.5km)", "weight": 20},
            {"label": "Favorable Humidity Forecast (82% RH, Open-Meteo live signal)", "weight": 12},
            {"label": "Cultivar 'Pusa Ruby' documented susceptibility", "weight": 6},
            {"label": "High Soil Moisture (74% in clay loam)", "weight": 4}
        ]),
        (datetime.now() - timedelta(hours=3)).isoformat()
    ))

    # 14. Seed Alerts
    alerts = [
        (
            "alert_seed_1",
            "218",
            "regional_cluster_warning",
            "Early Blight",
            "Confirmed Early Blight case identified 1.4 km from your canal plot. Favorable dew conditions forecast tonight.",
            "Remove visibly spotted lower leaves; avoid evening furrow flooding; inspect lower canopy morning dew.",
            1.4,
            "synced",
            0,
            (datetime.now() - timedelta(hours=2)).isoformat()
        ),
        (
            "alert_seed_2",
            "301",
            "high_risk_boundary",
            "Early Blight",
            "Shared boundary alert: Neighboring plot Field 104 confirmed high risk (score 82/100).",
            "Inspect underside of lower foliage; check leaf airflow spacing; sanitize footwear between plots.",
            0.15,
            "synced",
            0,
            (datetime.now() - timedelta(hours=1)).isoformat()
        ),
    ]
    cursor.executemany("""
        INSERT INTO alerts (alert_id, field_id, alert_type, disease, message, treatment_summary, distance_km, sync_status, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, alerts)

    # 15. Audit Logs
    audit_logs = [
        ("log_1", "Admin", "System Bootstrap", "INITIALIZE_DATABASE", "SYSTEM", "DATABASE", json.dumps({"status": "seeded", "tables": 28}), (datetime.now() - timedelta(days=1)).isoformat()),
        ("log_2", "Farmer", "Ramesh Patil", "SUBMIT_OBSERVATION", "OBSERVATION", obs_id, json.dumps({"field_id": "104", "symptoms": ["leaf_spots_concentric"]}), (datetime.now() - timedelta(hours=4)).isoformat()),
        ("log_3", "AI", "VisionUncertaintyEngine", "GENERATE_ANALYSIS", "AI_ANALYSIS", analysis_id, json.dumps({"top_disease": "Early Blight", "confidence": 0.54, "needs_investigation": True}), (datetime.now() - timedelta(hours=4)).isoformat()),
        ("log_4", "Officer", "Officer Deshmukh", "UPDATE_PRIORITY_QUEUE", "INSPECTION_PRIORITY", "prio_1", json.dumps({"rank": 1, "field_id": "104", "score": 82}), (datetime.now() - timedelta(hours=2)).isoformat()),
    ]
    cursor.executemany("""
        INSERT INTO audit_logs (log_id, actor_role, actor_name, action_type, entity_type, entity_id, details_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, audit_logs)

    # 16. Sensor Readings (Item 10a)
    sensor_readings = [
        ("sens_1", "104", "soil_moisture", 74.0, "%", 0, "IoT_Station_Alpha", (datetime.now() - timedelta(hours=3)).isoformat()),
        ("sens_2", "104", "leaf_wetness", 8.5, "hours", 1, "IoT_LeafWet_01", (datetime.now() - timedelta(hours=2)).isoformat()),
        ("sens_3", "104", "canopy_humidity", 86.0, "%", 1, "IoT_RH_Sensor", (datetime.now() - timedelta(hours=1)).isoformat()),
        ("sens_4", "218", "soil_moisture", 58.0, "%", 0, "IoT_Station_Beta", (datetime.now() - timedelta(hours=5)).isoformat()),
        ("sens_5", "301", "leaf_wetness", 3.2, "hours", 0, "IoT_Station_Gamma", (datetime.now() - timedelta(hours=4)).isoformat()),
    ]
    cursor.executemany("""
        INSERT INTO sensor_readings (reading_id, field_id, sensor_type, value, unit, threshold_exceeded, source, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, sensor_readings)

    # 17. Trap Counts (Item 10a: Helicoverpa armigera pheromone trap breach on Field 104)
    trap_counts = [
        ("trap_1", "104", "pheromone_trap", "Helicoverpa armigera", 18, 15, 1, "Ramesh Patil", "Pheromone lure delta trap erected 1m above canopy; moth catch exceeded economic threshold of 15/night.", (datetime.now() - timedelta(hours=6)).isoformat()),
        ("trap_2", "104", "yellow_sticky_card", "Bemisia tabaci (Whitefly)", 22, 30, 0, "Ramesh Patil", "Sticky trap placed in south corner. Moderate whitefly density observed.", (datetime.now() - timedelta(days=1)).isoformat()),
        ("trap_3", "218", "pheromone_trap", "Spodoptera litura", 7, 12, 0, "Suresh Ghadge", "Normal baseline activity.", (datetime.now() - timedelta(days=1)).isoformat()),
    ]
    cursor.executemany("""
        INSERT INTO trap_counts (trap_id, field_id, trap_type, target_pest, count, economic_threshold, threshold_breached, logged_by, notes, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, trap_counts)

    # 18. Forecast Alerts (Item 10b: 5-Day Weather-Based Outbreak Forecast)
    forecast_alerts = [
        (
            "fc_seed_104",
            "104",
            "Early Blight",
            5,
            82,
            "Microclimate forecast over next 5 days indicates prolonged 86% RH and 24-27°C canopy temperatures creating an 82% probability window favorable for Early Blight proliferation.",
            json.dumps([
                "Prune lower senescent leaves to improve under-canopy airflow and reduce spore splash",
                "Apply Trichoderma viride bio-fungicide prophylactic spray before forecasted evening rains",
                "Avoid overhead sprinkler irrigation; maintain root-zone drip only",
                "Scout border rows every 48 hours for concentric target-pattern lesions"
            ]),
            "active",
            (datetime.now() - timedelta(hours=8)).isoformat()
        )
    ]
    cursor.executemany("""
        INSERT INTO forecast_alerts (forecast_id, field_id, disease, forecast_window_days, probability_pct, favorable_conditions_summary, preventive_actions_json, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, forecast_alerts)

    # 19. Case Messages (Item 10d: Human-to-Human chat linked to scan obs_001)
    case_messages = [
        (
            "msg_1",
            obs_id,
            "104",
            "usr_farmer_1",
            "usr_expert_1",
            "Dr. Meera Nair, I noticed dark concentric spots spreading on the lower foliage of my Pusa Ruby tomatoes. Should I spray immediately or prune first?",
            1,
            (datetime.now() - timedelta(hours=3, minutes=30)).isoformat()
        ),
        (
            "msg_2",
            obs_id,
            "104",
            "usr_expert_1",
            "usr_farmer_1",
            "Namaste Ramesh ji. Do NOT spray heavy chemical fungicides yet. Please prune the bottom 3 affected leaves to halt ground-splash, and upload a close-up photo of the leaf underside so I can rule out Septoria leaf spot.",
            0,
            (datetime.now() - timedelta(hours=2, minutes=15)).isoformat()
        )
    ]
    cursor.executemany("""
        INSERT INTO messages (message_id, case_id, field_id, sender_id, receiver_id, text, is_read, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, case_messages)

    conn.commit()
    conn.close()
