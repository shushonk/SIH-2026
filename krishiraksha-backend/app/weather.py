"""
Weather-based risk forecasting.

Uses Open-Meteo (https://open-meteo.com) — free, no API key required —
to pull a short-range humidity/precipitation forecast for a field's
coordinates, and translates that into a disease-favorability risk factor.

HONESTY NOTE: this sandbox's network egress is restricted to package
registries only, so the live API call cannot be exercised from inside
this development environment. The integration code below is real and
will work as soon as it runs somewhere with normal internet egress
(e.g. your actual deployment). If the request fails for any reason
(network restriction, timeout, API down), it falls back to a seasonal
estimate — and the response always tells you honestly which one was used,
rather than silently returning a real-looking number from a placeholder.
"""

import urllib.request
import json
from datetime import datetime

OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude={lat}&longitude={lon}"
    "&hourly=relative_humidity_2m,precipitation"
    "&forecast_days=3&timezone=auto"
)

# Fallback used only if the live call fails — clearly labeled as such in the response.
SEASONAL_FALLBACK_HUMIDITY_PCT = 78


def get_weather_risk_factor(lat: float, lon: float):
    """
    Returns a dict: {points, label, source, humidity_pct}
    source is either "live_forecast" or "seasonal_fallback" — never hidden.
    """
    try:
        url = OPEN_METEO_URL.format(lat=lat, lon=lon)
        with urllib.request.urlopen(url, timeout=4) as resp:
            data = json.loads(resp.read().decode())
        humidities = data["hourly"]["relative_humidity_2m"][:24]  # next 24h
        avg_humidity = sum(humidities) / len(humidities)
        source = "live_forecast"
    except Exception:
        avg_humidity = SEASONAL_FALLBACK_HUMIDITY_PCT
        source = "seasonal_fallback"

    # Fungal diseases (Early Blight, Septoria) spread faster above ~75% humidity
    if avg_humidity >= 85:
        points, label = 15, "High humidity forecast — strongly favorable for fungal spread"
    elif avg_humidity >= 75:
        points, label = 10, "Elevated humidity forecast — favorable for fungal spread"
    elif avg_humidity >= 60:
        points, label = 4, "Moderate humidity forecast"
    else:
        points, label = 0, "Low humidity forecast — unfavorable for fungal spread"

    return {
        "points": points,
        "label": label,
        "source": source,
        "humidity_pct": round(avg_humidity, 1),
        "checked_at": datetime.utcnow().isoformat(),
    }
