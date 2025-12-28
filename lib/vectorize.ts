export interface VectorizeSearchResult {
  content: string;
  metadata: Record<string, any>;
  similarity?: number;
  score?: number;
  [key: string]: any;
}

export interface VectorizeSearchResponse {
  documents: VectorizeSearchResult[];
  average_relevancy: number;
  ndcg: number;
  [key: string]: any;
}

export async function searchVectorize(
  query: string,
  numResults: number = 10,
  rerank: boolean = true
): Promise<VectorizeSearchResponse> {
  const vectorizeApiKey = process.env.VECTORIZE_API_KEY;
  const organizationId = process.env.VECTORIZE_ORG_ID;
  const pipelineId = process.env.VECTORIZE_PIPELINE_ID;

  if (!vectorizeApiKey || !organizationId || !pipelineId) {
    throw new Error("Missing Vectorize configuration");
  }

  const response = await fetch(
    `https://api.vectorize.io/v1/org/${organizationId}/pipelines/${pipelineId}/retrieval`,
    {
      method: "POST",
      headers: {
        Authorization: vectorizeApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        question: query,
        numResults: numResults,
        rerank: rerank,
        "advanced-query": {
          mode: "text",
          "match-type": "match"
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Vectorize API error: ${response.statusText}`
    );
  }

  return await response.json();
}
