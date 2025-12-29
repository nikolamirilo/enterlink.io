"use client";

import FileDropzone from "@/components/FileDropzone";
import {
  CheckCircle,
  Loader2,
  XCircle
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus({
        type: "error",
        message: "Please select at least one file",
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      if (selectedFiles.length > 0) {
        // Handle all file types (PDF, TXT, CSV) - Send as FormData for Vectorize
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("file", file);
        });

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setUploadStatus({
            type: "success",
            message: data.message || "Files uploaded successfully!",
          });
          setSelectedFiles([]);
        } else {
          setUploadStatus({
            type: "error",
            message: data.error || "Failed to upload files",
          });
        }
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "An error occurred while processing",
      });
    } finally {
      setUploading(false);
    }
  };

  const isSubmitDisabled = uploading || selectedFiles.length === 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-row gap-2 justify-center items-center mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
              Upload Documents
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1e2d4b]/30 backdrop-blur-sm border border-white/5 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                Drop your files here
              </h2>
            </div>

            <FileDropzone
              onFileSelect={setSelectedFiles}
              selectedFiles={selectedFiles}
              disabled={uploading}
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`
                w-full mt-6 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-white text-sm sm:text-base
                transition-all duration-200 flex items-center justify-center gap-2
                ${isSubmitDisabled
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-[#169FD6] hover:bg-[#0A68A8] shadow-lg hover:shadow-xl transform hover:scale-105"
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Documents"
              )}
            </button>

            {/* Status Messages */}
            {uploadStatus.type && (
              <div
                className={`
                  mt-6 p-3 sm:p-4 rounded-lg flex items-start gap-3
                  ${uploadStatus.type === "success"
                    ? "bg-green-900/20 border border-green-800"
                    : "bg-red-900/20 border border-red-800"
                  }
                `}
              >
                {uploadStatus.type === "success" ? (
                  <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 sm:w-6 h-5 sm:h-6 text-red-500 shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm sm:text-base
                    ${uploadStatus.type === "success"
                      ? "text-green-200"
                      : "text-red-200"
                    }
                  `}
                >
                  {uploadStatus.message}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
