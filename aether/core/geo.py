import yaml
import os
from .metrics import (
    compute_presence_score,
    compute_quality_score,
    compute_diversity_score
)
from .normalizers import normalize_input


def load_weights():
    path = os.path.join(os.path.dirname(__file__), "weights.yaml")
    with open(path, "r") as f:
        return yaml.safe_load(f)


def compute_geo_score(raw_data):
    data = normalize_input(raw_data)

    presence = compute_presence_score(data)
    quality = compute_quality_score(data)
    diversity = compute_diversity_score(data)

    weights = load_weights()

    final = (
        weights["presence"] * presence +
        weights["quality"] * quality +
        weights["diversity"] * diversity
    )

    return {
        "brand": data["brand"],
        "presence": presence,
        "quality": quality,
        "diversity": diversity,
        "geo_score": final
    }
