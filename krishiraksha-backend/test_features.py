import os
import sys
import base64

# ensure utf-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sample_dir = os.path.join(os.path.dirname(__file__), "..", "..", "krishiraksha-web", "public", "samples")
print("Sample dir:", os.path.abspath(sample_dir))

for fname in sorted(os.listdir(sample_dir)):
    if fname.endswith((".jpg", ".png")):
        fpath = os.path.join(sample_dir, fname)
        with open(fpath, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        
        # Test feature extraction directly
        from app.ml.features import load_and_resize, extract_features
        img_arr = load_and_resize(fpath)
        feats = extract_features(img_arr)
        print(f"File: {fname} -> Feats shape: {feats.shape}, Brown frac: {feats[48]:.3f}, Yellow frac: {feats[49]:.3f}, Edge density: {feats[-1]:.3f}")
