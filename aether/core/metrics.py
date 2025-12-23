import numpy as np
from datetime import datetime, timezone


def _to_utc_datetime(value):
    """
    Normalize a datetime-ish value to a timezone-aware UTC datetime.

    Accepts:
    - ISO-8601 strings (supports a trailing 'Z')
    - datetime instances (naive treated as UTC)
    """
    if isinstance(value, str):
        # Support common "Z" suffix for UTC.
        if value.endswith("Z"):
            value = value[:-1] + "+00:00"
        value = datetime.fromisoformat(value)

    if not isinstance(value, datetime):
        raise TypeError(f"timestamp must be str or datetime, got {type(value)!r}")

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def time_decay(timestamp, lambda_=0.07, now=None):
    ts = _to_utc_datetime(timestamp)
    now_dt = _to_utc_datetime(now) if now is not None else datetime.now(timezone.utc)
    days = (now_dt - ts).days
    return np.exp(-lambda_ * days)

# ---------------------------
# PRESENCE METRICS
# ---------------------------

def compute_presence_score(data):
    mentions = data["mentions"]

    freq = len(mentions)
    systems = len(set(m["source"] for m in mentions))
    surfaces = len(set(s for m in mentions for s in m.get("surface_area", [])))

    recency = np.mean([time_decay(m["last_seen"]) for m in mentions])

    # Weighted sum
    presence = (
        0.4 * np.tanh(freq / 10) +
        0.3 * np.tanh(systems / 5) +
        0.2 * np.tanh(surfaces / 20) +
        0.1 * recency
    )

    return float(np.clip(presence, 0, 1))

# ---------------------------
# QUALITY METRICS
# ---------------------------

def compute_quality_score(data):
    mentions = data["mentions"]

    acc = np.mean([m.get("accuracy", 0.5) for m in mentions])
    auth = np.mean([m.get("authority", 0.5) for m in mentions])
    comp = np.mean([m.get("completeness", 0.5) for m in mentions])

    redundancy_penalty = 1 - np.tanh(len(mentions) / 40)

    quality = (
        0.35 * acc +
        0.35 * auth +
        0.25 * comp -
        0.05 * redundancy_penalty
    )

    return float(np.clip(quality, 0, 1))

# ---------------------------
# DIVERSITY METRICS
# ---------------------------

def entropy(values):
    # Convert values to strings to handle non-homogeneous sequences
    string_vals = [str(v) for v in values]
    vals, counts = np.unique(string_vals, return_counts=True)
    probs = counts / counts.sum()
    return -np.sum(probs * np.log2(probs + 1e-9))

def compute_diversity_score(data):
    mentions = data["mentions"]

    topics = [tuple(m.get("surface_area", [])) for m in mentions]
    personas = [m.get("persona", "default") for m in mentions]
    ontologies = [m.get("ontology", "none") for m in mentions]

    topic_entropy = entropy(topics)
    persona_var = entropy(personas)
    ontology_spread = entropy(ontologies)

    diversity = (
        0.4 * np.tanh(topic_entropy) +
        0.35 * np.tanh(persona_var) +
        0.25 * np.tanh(ontology_spread)
    )

    return float(np.clip(diversity, 0, 1))
