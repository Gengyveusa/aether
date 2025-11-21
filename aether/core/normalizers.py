def normalize_input(data):
    # Guarantee minimal keys
    normalized = {
        "brand": data.get("brand", "UNKNOWN"),
        "mentions": []
    }

    for m in data.get("mentions", []):
        normalized["mentions"].append({
            "source": m.get("source", "unknown"),
            "text": m.get("text", ""),
            "authority": float(m.get("authority", 0.5)),
            "sentiment": float(m.get("sentiment", 0.5)),
            "accuracy": float(m.get("accuracy", 0.5)),
            "completeness": float(m.get("completeness", 0.5)),
            "last_seen": m.get("last_seen", "2025-01-01T00:00:00"),
            "surface_area": m.get("surface_area", []),
            "persona": m.get("persona", "default"),
            "ontology": m.get("ontology", "none")
        })

    return normalized
