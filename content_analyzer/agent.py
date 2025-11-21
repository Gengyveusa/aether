import re
from collections import Counter

class ContentAnalyzer:
    """
    Processes and summarizes page content, extracting entities and assessing quality, relevance and tone.
    """

    def analyze(self, text: str) -> dict:
        """
        Analyze the provided text and return summary metrics.

        Args:
            text: The text to analyze.

        Returns:
            A dictionary with word_count and top_words (list of tuples).
        """
        # Normalize text to lowercase and extract words
        words = re.findall(r"\b\w+\b", text.lower())
        word_count = len(words)
        counts = Counter(words)
        top_words = counts.most_common(5)
        return {"word_count": word_count, "top_words": top_words}
