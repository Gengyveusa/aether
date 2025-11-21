class KnowledgeGraphBuilder:
    """
    Builds and updates a knowledge graph from extracted entities.
    """

    def build_graph(self, entities: list) -> dict:
        """
        Construct or update the knowledge graph using extracted entities.

        Args:
            entities: A list of extracted entity strings.

        Returns:
            A dictionary mapping each entity to a set of related entities (co-occurrence graph).
        """
        graph: dict[str, set[str]] = {}
        for i, entity in enumerate(entities):
            # ensure node in graph
            if entity not in graph:
                graph[entity] = set()
            # connect with next entity if exists
            if i < len(entities) - 1:
                next_entity = entities[i + 1]
                graph[entity].add(next_entity)
                graph.setdefault(next_entity, set()).add(entity)
        return graph
