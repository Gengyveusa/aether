import requests
from bs4 import BeautifulSoup

class CrawlerSimulator:
    """
    Simulates LLM-powered web crawlers to explore the brand's online presence.
    """

    def crawl(self, url: str) -> dict:
        """
        Fetch a webpage and return its content and basic metadata.

        Args:
            url: The URL to crawl.

        Returns:
            A dictionary containing the URL, raw HTML content, and metadata such as title and content length.
        """
        try:
            response = requests.get(url, timeout=10)
            content = response.text
        except Exception as e:
            # If any error occurs during the request, return error info.
            return {"url": url, "content": "", "metadata": {"error": str(e)}}

        soup = BeautifulSoup(content, "html.parser")
        title = soup.title.string.strip() if soup.title and soup.title.string else None
        metadata = {
            "title": title,
            "length": len(content),
        }
        return {"url": url, "content": content, "metadata": metadata}
