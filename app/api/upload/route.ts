import { startPipeline, uploadToVectorize } from "@/lib/vectorize";
import { NextRequest, NextResponse } from "next/server";

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
      const pipelineId = process.env.VECTORIZE_PIPELINE_ID;

      if (!vectorizeApiKey || !connectorId || !organizationId || !pipelineId) {
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

      // Start pipeline after successful uploads
      let pipelineStarted = false;
      if (successes > 0) {
        try {
          await startPipeline({
            apiKey: vectorizeApiKey,
            orgId: organizationId,
            pipelineId: pipelineId,
          });
          pipelineStarted = true;
        } catch (pipelineError) {
          console.error("Failed to start pipeline:", pipelineError);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully uploaded ${successes} file(s). ${failures > 0 ? `${failures} failed.` : ""
          }${pipelineStarted ? " Pipeline started." : ""}`,
        data: {
          successCount: successes,
          failureCount: failures,
          pipelineStarted,
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
