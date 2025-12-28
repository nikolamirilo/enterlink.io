import { NextRequest, NextResponse } from "next/server";

async function uploadToVectorize(
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

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const files = formData.getAll("file") as File[];

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: "No files provided" },
          { status: 400 }
        );
      }

      const vectorizeApiKey = process.env.VECTORIZE_API_KEY;
      const connectorId = process.env.VECTORIZE_CONNECTOR_ID;
      const organizationId = process.env.VECTORIZE_ORG_ID;

      if (!vectorizeApiKey || !connectorId || !organizationId) {
        console.error("Missing Vectorize configuration");
        return NextResponse.json(
          { error: "Server misconfiguration: Missing Vectorize credentials" },
          { status: 500 }
        );
      }

      const config = {
        apiKey: vectorizeApiKey,
        connectorId: connectorId,
        orgId: organizationId,
      };

      const results = await Promise.allSettled(
        files.map((file) => uploadToVectorize(file, config))
      );

      const successes = results.filter((r) => r.status === "fulfilled").length;
      const failures = results.filter((r) => r.status === "rejected").length;

      if (failures > 0 && successes === 0) {
        const firstError = (
          results.find((r) => r.status === "rejected") as PromiseRejectedResult
        ).reason;
        return NextResponse.json(
          {
            error: `All ${failures} files failed to upload. Last error: ${firstError.message}`,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Successfully uploaded ${successes} file(s). ${
          failures > 0 ? `${failures} failed.` : ""
        }`,
        data: {
          successCount: successes,
          failureCount: failures,
        },
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      { status: 500 }
    );
  }
}
