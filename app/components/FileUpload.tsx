"use client";

import { useState, useCallback } from "react";
import { Upload, FileAudio, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={clsx(
          "relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-gray-400",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={isLoading ? undefined : handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleChange}
          accept="audio/*"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center space-y-4 text-center p-4">
          {isLoading ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          ) : selectedFile ? (
            <div className="bg-blue-100 p-4 rounded-full">
              <FileAudio className="w-8 h-8 text-blue-600" />
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-full">
              <Upload className="w-8 h-8 text-gray-500" />
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-lg font-medium text-gray-700">
              {isLoading ? "오디오 처리 중..." : selectedFile ? selectedFile.name : "클릭하거나 파일을 여기로 드래그하세요"}
            </p>
            <p className="text-sm text-gray-500">
              {isLoading ? "잠시만 기다려 주세요" : "지원 형식: MP3, WAV, M4A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
