import sys
import os

try:
    import joblib
    print("joblib imported", flush=True)
    import skimage
    print("skimage imported", flush=True)
    from app.ml.classifier import get_model_metadata, _load
    print("loading model...", flush=True)
    model, meta = _load()
    print("Model loaded successfully!", flush=True)
    print("Classes:", model.classes_, flush=True)
    print("Metadata:", meta, flush=True)
except Exception as e:
    print("Error:", e, flush=True)
