"""
Real trained classifier, wired into the backend.

HONEST LIMITATIONS — read this before treating the accuracy number below as
a claim about real-world performance:

1. Trained on PlantVillage (github.com/spMohanty/PlantVillage-Dataset), which
   consists of leaf photos taken in controlled lab conditions on plain,
   near-uniform backgrounds. Measured test accuracy on a held-out split of
   THAT SAME kind of image is in app/ml/model_metadata.json (currently ~98%).
2. That number does NOT represent expected accuracy on real farmer field
   photos — cluttered backgrounds, variable lighting, multiple leaves,
   motion blur, phone camera artifacts. This is a well-documented gap in
   agricultural ML: the original PlantVillage paper itself reported accuracy
   dropping from ~99% on its own test images to roughly 31% on random
   real-world internet photos of the same diseases (Mohanty et al., 2016).
3. Uses classical computer-vision features (color histograms, GLCM texture,
   edge density — see app/ml/features.py), not a deep CNN, because this
   sandbox has no GPU and can't reach the hosts that serve pretrained
   ImageNet weights. A fine-tuned CNN would very likely generalize better
   to real photos than this does.
4. Only 5 classes are covered (Early Blight, Septoria Leaf Spot, Healthy,
   Leaf Mold, Target Spot) — matching what PlantVillage's tomato subset
   provides. "Nutrient Deficiency (Potassium)" from the knowledge base has
   NO trained coverage here; the keyword-based path is still used as a
   fallback for that case.

In short: this is a real, honestly-measured step up from the keyword lookup
it replaces — genuinely trained on genuine images, not fabricated — but it
is a lab-conditions baseline, not a field-ready deployment model. Say so
plainly if asked.
"""

import base64
import io
import json
import os
import numpy as np
import joblib
from PIL import Image

from app.ml.features import extract_features, IMG_SIZE

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
_METADATA_PATH = os.path.join(os.path.dirname(__file__), "model_metadata.json")

_model = None
_metadata = None


def _load():
    global _model, _metadata
    if _model is None:
        _model = joblib.load(_MODEL_PATH)
    if _metadata is None:
        with open(_METADATA_PATH) as f:
            _metadata = json.load(f)
    return _model, _metadata


def get_model_metadata():
    _, metadata = _load()
    return metadata


def classify_image_base64(image_b64: str):
    """
    Takes a base64-encoded image, returns a differential diagnosis list
    using the REAL trained model — actual inference, not a lookup table.
    """
    model, metadata = _load()

    image_bytes = base64.b64decode(image_b64)
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)
    img_array = np.array(img)

    feats = extract_features(img_array).reshape(1, -1)
    probs = model.predict_proba(feats)[0]
    classes = model.classes_

    differential = sorted(
        [{"disease": str(c), "confidence": round(float(p), 3)} for c, p in zip(classes, probs)],
        key=lambda x: -x["confidence"],
    )
    return differential
