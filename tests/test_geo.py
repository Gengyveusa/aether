import json
from aether.core.geo import compute_geo_score


def test_geo_score():
    with open("tests/demo_data.json", "r") as f:
        data = json.load(f)
    score = compute_geo_score(data)
    assert "geo_score" in score
    assert 0 <= score["geo_score"] <= 1
    print(score)


if __name__ == "__main__":
    with open("tests/demo_data.json", "r") as f:
        data = json.load(f)
    score = compute_geo_score(data)
    print(score)
