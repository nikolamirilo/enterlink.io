"use client";

import { File, FileText, Table, Upload, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileDropzoneProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  disabled?: boolean;
}

export default function FileDropzone({
  onFileSelect,
  selectedFiles,
  disabled,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    disabled,
  });

  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    onFileSelect(newFiles);
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragActive
          ? "border-[#169FD6] bg-[#169FD6]/10 scale-105"
          : "border-white/10 hover:border-[#169FD6] hover:bg-[#169FD6]/5"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        {selectedFiles.length > 0 ? (
          <div className="w-full space-y-3">
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              <div className="bg-[#169FD6]/20 text-[#169FD6] px-3 py-1 rounded-full text-sm font-medium">
                {selectedFiles.length} file
                {selectedFiles.length !== 1 ? "s" : ""} selected
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 px-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 bg-[#101C34] p-3 rounded-lg border border-white/5 shadow-sm text-left relative group"
                >
                  {file.type.includes("pdf") ? (
                    <File className="w-8 h-8 text-red-400 shrink-0" />
                  ) : file.type.includes("csv") ||
                    file.name.endsWith(".csv") ? (
                    <Table className="w-8 h-8 text-green-400 shrink-0" />
                  ) : (
                    <FileText className="w-8 h-8 text-[#169FD6] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold text-white truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => removeFile(e, index)}
                    className="p-1 hover:bg-red-900/20 text-gray-500 hover:text-red-400 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 pt-2">
              Click or drop files to replace selection
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-16 h-16 text-gray-500" />
            <div>
              <p className="text-lg font-semibold text-white">
                {isDragActive
                  ? "Drop your files here"
                  : "Drag & drop your files here"}
              </p>
              <p className="text-sm text-gray-400 mt-2">or click to browse</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">Supported formats: CSV</p>
          </>
        )}
      </div>
    </div>
  );
}
