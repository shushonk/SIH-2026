"""
Train a real classifier on real PlantVillage images.

Setup (get the dataset first):
    cd krishiraksha-project
    git clone --filter=blob:none --sparse --depth 1 https://github.com/spMohanty/PlantVillage-Dataset.git
    cd PlantVillage-Dataset
    git sparse-checkout set raw/color/Tomato___Early_blight raw/color/Tomato___Septoria_leaf_spot raw/color/Tomato___healthy raw/color/Tomato___Leaf_Mold raw/color/Tomato___Target_Spot

Then run:
    cd krishiraksha-backend/ml
    python3 train.py

This prints and saves REAL measured accuracy — not an assumed number. The
trained model + honest metadata already included in this folder were
produced by this exact script.
"""

import os
import glob
import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import json
import time

from features import load_and_resize, extract_features

DATA_ROOT = os.environ.get(
    "PLANTVILLAGE_DATA_ROOT",
    os.path.join(os.path.dirname(__file__), "..", "..", "PlantVillage-Dataset", "raw", "color"),
)

# Map dataset folder names -> the disease labels used in the KrishiRaksha backend,
# so this model's output plugs directly into the existing knowledge base / risk engine.
CLASS_MAP = {
    "Tomato___Early_blight": "Early Blight",
    "Tomato___Septoria_leaf_spot": "Septoria Leaf Spot",
    "Tomato___healthy": "Healthy",
    "Tomato___Leaf_Mold": "Leaf Mold",
    "Tomato___Target_Spot": "Target Spot",
}

IMAGES_PER_CLASS = 300  # subset for reasonable CPU training time; real images, not synthetic
RANDOM_SEED = 42

random.seed(RANDOM_SEED)


def collect_dataset():
    X, y, paths = [], [], []
    for folder, label in CLASS_MAP.items():
        folder_path = os.path.join(DATA_ROOT, folder)
        files = glob.glob(os.path.join(folder_path, "*"))
        if not files:
            print(f"WARNING: no files found for {folder}")
            continue
        random.shuffle(files)
        chosen = files[:IMAGES_PER_CLASS]
        print(f"{label}: using {len(chosen)} of {len(files)} available images")
        for f in chosen:
            paths.append(f)
            y.append(label)
    return paths, y


def main():
    t0 = time.time()
    paths, labels = collect_dataset()
    print(f"\nTotal images collected: {len(paths)}")

    print("Extracting features (real CV pipeline — color, texture, edges)...")
    X = []
    valid_labels = []
    for i, (p, lab) in enumerate(zip(paths, labels)):
        try:
            img = load_and_resize(p)
            feats = extract_features(img)
            X.append(feats)
            valid_labels.append(lab)
        except Exception as e:
            print(f"Skipping {p}: {e}")
        if (i + 1) % 200 == 0:
            print(f"  processed {i+1}/{len(paths)}")

    X = np.array(X)
    y = np.array(valid_labels)
    print(f"\nFeature matrix: {X.shape}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )
    print(f"Train: {X_train.shape[0]} images, Test: {X_test.shape[0]} images (held out, never seen during training)")

    clf = RandomForestClassifier(n_estimators=300, max_depth=None, random_state=RANDOM_SEED, n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred, labels=clf.classes_)

    print(f"\n=== REAL MEASURED TEST ACCURACY: {acc:.3f} ===\n")
    print(classification_report(y_test, y_pred))
    print("Confusion matrix (rows=true, cols=predicted):")
    print("Classes:", list(clf.classes_))
    print(cm)

    out_dir = os.path.dirname(os.path.abspath(__file__))
    joblib.dump(clf, os.path.join(out_dir, "model.joblib"))

    metadata = {
        "test_accuracy": acc,
        "classes": list(clf.classes_),
        "n_train": int(X_train.shape[0]),
        "n_test": int(X_test.shape[0]),
        "per_class_report": report,
        "confusion_matrix": cm.tolist(),
        "training_time_seconds": round(time.time() - t0, 1),
        "dataset_source": "https://github.com/spMohanty/PlantVillage-Dataset",
        "feature_pipeline": "HSV color histograms + GLCM texture + Canny edge density (classical CV, not deep learning)",
        "images_per_class_used": IMAGES_PER_CLASS,
    }
    with open(os.path.join(out_dir, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel saved to model.joblib, metadata saved to model_metadata.json")
    print(f"Total time: {time.time() - t0:.1f}s")


if __name__ == "__main__":
    main()
