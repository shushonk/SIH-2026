"""
Real, working feature extraction for plant-leaf images.

Not a deep CNN — a classical computer-vision feature pipeline (color
distribution + texture + edge density), chosen deliberately because it:
  - trains in minutes on CPU with no GPU and no external pretrained-weight
    download (this sandbox can't reach the hosts that serve pretrained
    ImageNet weights), so every claimed accuracy number below is measured,
    not assumed
  - is honest about its own ceiling: expect meaningfully lower accuracy
    than a fine-tuned CNN would achieve on the same data. That's a real
    tradeoff, not a hidden one.
"""

import numpy as np
from PIL import Image
from skimage.feature import graycomatrix, graycoprops
from skimage.color import rgb2gray
from skimage.feature import canny

IMG_SIZE = (128, 128)


def load_and_resize(path):
    img = Image.open(path).convert("RGB").resize(IMG_SIZE)
    return np.array(img)


def extract_features(img_array):
    """img_array: HxWx3 uint8 RGB array. Returns a 1D real-valued feature vector."""
    img = img_array.astype(np.float32) / 255.0

    # --- Color histogram features (HSV) ---
    from colorsys import rgb_to_hsv
    # vectorized RGB->HSV via matplotlib.colors is heavier; do a fast approximate HSV via numpy
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    maxc = np.max(img, axis=-1)
    minc = np.min(img, axis=-1)
    v = maxc
    delta = maxc - minc + 1e-6
    s = delta / (maxc + 1e-6)
    # hue calculation
    hue = np.zeros_like(maxc)
    mask = delta > 1e-5
    r_eq = (maxc == r) & mask
    g_eq = (maxc == g) & mask & ~r_eq
    b_eq = (maxc == b) & mask & ~r_eq & ~g_eq
    hue[r_eq] = ((g[r_eq] - b[r_eq]) / delta[r_eq]) % 6
    hue[g_eq] = ((b[g_eq] - r[g_eq]) / delta[g_eq]) + 2
    hue[b_eq] = ((r[b_eq] - g[b_eq]) / delta[b_eq]) + 4
    hue = hue / 6.0

    h_hist, _ = np.histogram(hue, bins=16, range=(0, 1), density=True)
    s_hist, _ = np.histogram(s, bins=16, range=(0, 1), density=True)
    v_hist, _ = np.histogram(v, bins=16, range=(0, 1), density=True)

    # Brown/necrotic-spot proxy: fraction of pixels in a dark-brown hue band with mid saturation
    brown_mask = (hue > 0.02) & (hue < 0.12) & (s > 0.25) & (v < 0.7)
    brown_fraction = np.array([brown_mask.mean()])

    # Yellow proxy (for nutrient-deficiency-style yellowing)
    yellow_mask = (hue > 0.12) & (hue < 0.20) & (s > 0.3) & (v > 0.4)
    yellow_fraction = np.array([yellow_mask.mean()])

    # --- Texture features (GLCM on grayscale) ---
    gray = (rgb2gray(img) * 255).astype(np.uint8)
    glcm = graycomatrix(gray, distances=[3], angles=[0, np.pi / 4], levels=256, symmetric=True, normed=True)
    contrast = graycoprops(glcm, "contrast").flatten()
    homogeneity = graycoprops(glcm, "homogeneity").flatten()
    energy = graycoprops(glcm, "energy").flatten()
    correlation = graycoprops(glcm, "correlation").flatten()

    # --- Edge density (spot/lesion boundary proxy) ---
    edges = canny(gray / 255.0, sigma=1.5)
    edge_density = np.array([edges.mean()])

    return np.concatenate([
        h_hist, s_hist, v_hist,
        brown_fraction, yellow_fraction,
        contrast, homogeneity, energy, correlation,
        edge_density,
    ])


FEATURE_NAMES = (
    [f"hue_bin_{i}" for i in range(16)] +
    [f"sat_bin_{i}" for i in range(16)] +
    [f"val_bin_{i}" for i in range(16)] +
    ["brown_fraction", "yellow_fraction"] +
    ["contrast_0", "contrast_45", "homogeneity_0", "homogeneity_45",
     "energy_0", "energy_45", "correlation_0", "correlation_45"] +
    ["edge_density"]
)
