def compute_geo_score(data):
    """
    Computes the GEo visibility score based on provided data.

    Args:
        data (dict): Contains analysis results such as word_count, top_words,
            knowledge_graph (dict or list).

    Returns:
        float: Score between 0 and 1 representing GEo visibility.
    """
    # Validate input; return 0.0 for invalid or empty input
    if not data or not isinstance(data, dict):
        return 0.0

    # Collect numeric representations from the data
    score_components = []
    for value in data.values():
        if isinstance(value, (int, float)):
            score_components.append(float(value))
        elif isinstance(value, (list, tuple, set)):
            score_components.append(len(value))
        elif isinstance(value, dict):
            score_components.append(len(value))

    # If no components could be derived, return 0.0
    if not score_components:
        return 0.0

    # Compute a raw score as the sum of components
    raw_score = sum(score_components)

    # Normalize the score to a 0-1 range. This scaling factor (100.0) is arbitrary
    # and can be tuned based on empirical results or domain knowledge.
    normalized_score = raw_score / (raw_score + 100.0)

    # Ensure the score is capped at 1.0
    return min(1.0, normalized_score)
