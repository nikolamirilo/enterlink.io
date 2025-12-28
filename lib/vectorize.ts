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


export async function uploadToVectorize(
  file: File,
  config: { apiKey: string; connectorId: string; orgId: string }
) {
  console.log(
    `Initiating upload for ${file.name} to: https://api.vectorize.io/v1/org/${config.orgId}/uploads/${config.connectorId}/files`
  );

  // Step 1: Initiate upload (Get Signed URL)
  const initiateResponse = await fetch(
    `https://api.vectorize.io/v1/org/${config.orgId}/uploads/${config.connectorId}/files`,
    {
      method: "PUT",
      headers: {
        Authorization: config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: file.name,
        contentType: file.type,
      }),
    }
  );

  const initiateData = await initiateResponse.json();

  if (!initiateResponse.ok) {
    console.error(`Vectorize Init API error for ${file.name}:`, initiateData);
    throw new Error(
      initiateData.message || "Failed to initiate upload to Vectorize"
    );
  }

  const uploadUrl = initiateData.uploadUrl;
  if (!uploadUrl) {
    console.error(`No uploadUrl returned from Vectorize for ${file.name}`);
    throw new Error("Invalid response from Vectorize: No upload URL");
  }

  // Step 2: Upload file content to Signed URL
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const uploadErrorText = await uploadResponse.text();
    console.error(
      `Vectorize S3 Upload error for ${file.name}:`,
      uploadErrorText
    );
    throw new Error("Failed to upload file content to storage");
  }

  return initiateData;
}

export async function startPipeline(config: { apiKey: string; orgId: string; pipelineId: string }) {
  console.log(`Starting pipeline: ${config.pipelineId}`);

  const response = await fetch(
    `https://api.vectorize.io/v1/org/${config.orgId}/pipelines/${config.pipelineId}/start`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to start pipeline:", data);
    throw new Error(data.message || "Failed to start pipeline");
  }

  console.log("Pipeline started successfully:", data);
  return data;
}