from crawler_simulator.agent import CrawlerSimulator
from content_analyzer.agent import ContentAnalyzer
from knowledge_graph_builder.agent import KnowledgeGraphBuilder
from geo_scoring.score import compute_geo_score


class Orchestrator:
    """
    Coordinates agent workflows and orchestrates pipelines within AETHER.

    This class ties together the individual agents: crawling web pages,
    analyzing content, building a knowledge graph, and computing a GEo visibility
    score. The `run` method orchestrates these steps for a given URL.
    """

    def run(self, url: str) -> dict:
        """
        Executes the AETHER pipeline on the provided URL.

        Args:
            url (str): The URL to process.

        Returns:
            dict: A dictionary containing the crawl data, analysis results,
                knowledge graph, and GEo score.
        """
        # Initialize agents
        crawler = CrawlerSimulator()
        analyzer = ContentAnalyzer()
        graph_builder = KnowledgeGraphBuilder()

        # Step 1: Crawl the webpage
        crawl_result = crawler.crawl(url)
        content = crawl_result.get("content", "") if isinstance(crawl_result, dict) else ""

        # Step 2: Analyze the content
        analysis = analyzer.analyze(content)

        # Step 3: Build a knowledge graph from the analysis results
        entities = analysis.get("top_words", []) if isinstance(analysis, dict) else []
        knowledge_graph = graph_builder.build_graph(entities)

        # Step 4: Compute a GEo visibility score
        score_input = {
            "word_count": analysis.get("word_count", 0) if isinstance(analysis, dict) else 0,
            "top_words": entities,
            "knowledge_graph": knowledge_graph,
        }
        geo_score = compute_geo_score(score_input)

        # Aggregate results
        return {
            "crawl": crawl_result,
            "analysis": analysis,
            "knowledge_graph": knowledge_graph,
            "geo_score": geo_score,
        }
