export interface Mention {
  source: string;
  text: string;
  authority: number;
  accuracy: number;
  completeness: number;
  sentiment: number;
  last_seen: string;
  surface_area: string[];
  persona?: string;
  ontology?: string;
}

export interface GeoInput {
  brand: string;
  mentions: Mention[];
}

export interface GeoScore {
  brand: string;
  presence: number;
  quality: number;
  diversity: number;
  geo_score: number;
}

export async function fetchGeoScore(apiUrl: string, data: GeoInput): Promise<GeoScore> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}
