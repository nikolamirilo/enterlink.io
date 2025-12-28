"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowLeft, FileText, Sparkles } from "lucide-react";

interface SearchResult {
  id?: string;
  content?: string;
  text?: string;
  metadata?: {
    filename?: string;
    chunk_index?: number;
    total_chunks?: number;
    file_type?: string;
    [key: string]: any;
  };
  similarity?: number;
  score?: number;
  [key: string]: any;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Search results:", data);
        setResults(data.results || []);
      } else {
        console.error("Search failed:", data.error);
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-row gap-2 justify-center items-center mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">
              Search Documents
            </h1>
          </div>
        </div>


        {/* Search Form */}
        <div className="max-w-4xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question or search for information..."
                className="w-full px-6 py-5 pr-14 text-lg rounded-2xl border-2 border-white/5 bg-[#0d1629] text-white focus:border-[#169FD6] focus:outline-none shadow-lg transition-all placeholder-gray-500"
                disabled={searching}
              />
              <button
                type="submit"
                disabled={searching || !query.trim()}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2
                  p-3 rounded-xl transition-all
                  ${searching || !query.trim()
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-[#169FD6] text-white hover:bg-[#0A68A8] shadow-md hover:shadow-lg"
                  }
                `}
              >
                {searching ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto">
          {searching && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#169FD6] mx-auto mb-4" />
              <p className="text-gray-400">
                Searching through your documents...
              </p>
            </div>
          )}

          {!searching && hasSearched && results.length === 0 && (
            <div className="text-center py-12 bg-[#1e2d4b]/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/5">
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-400">
                Try rephrasing your query or upload more documents
              </p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Found {results.length} relevant{" "}
                {results.length === 1 ? "result" : "results"}
              </p>

              {results.map((result, index) => {
                const score = result.relevancy ?? 0;
                const content = result.content ?? result.text ?? "";
                const filename =
                  result.source.split("/")[2] ?? "Unknown Document";
                const chunkIndex = result?.chunk_id;
                const totalChunks = result?.total_chunks;

                return (
                  <div
                    key={result.id || index}
                    className="bg-[#1e2d4b]/30 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:bg-[#1e2d4b]/50 transition-all border border-white/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-6 h-6 text-[#169FD6]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-white">
                              {filename}
                            </h3>
                            {chunkIndex !== undefined &&
                              totalChunks !== undefined && (
                                <span className="text-xs text-gray-300 bg-[#101C34] px-2 py-1 rounded border border-white/5">
                                  Chunk {chunkIndex + 1} of {totalChunks}
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-[#169FD6]">
                              {(score * 100).toFixed(1)}% match
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                          {content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!searching && !hasSearched && (
            <div className="text-center py-12 bg-[#1e2d4b]/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/5">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Start searching
              </h3>
              <p className="text-gray-400">
                Enter a query above to search through your documents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
