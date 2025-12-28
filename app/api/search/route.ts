import { NextRequest, NextResponse } from "next/server";
import { searchVectorize } from "@/lib/vectorize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, numResults = 1000, rerank = true } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    const data = await searchVectorize(query, numResults, rerank);
    console.log(data);

    return NextResponse.json({
      success: true,
      results: data.documents || [],
      metadata: {
        average_relevancy: data.average_relevancy,
        ndcg: data.ndcg,
      },
      raw: data,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while searching" },
      { status: 500 }
    );
  }
}
