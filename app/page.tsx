"use client";

import { useState } from "react";
import axios from "axios";
import { Mic2, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";
import FileUpload from "./components/FileUpload";
import ResultViewer from "./components/ResultViewer";
import SplineBackground from "./components/SplineBackground";

// Define the API URL
// In a real app, this would be in an environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Send to FastAPI Backend
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to process audio file. Please ensure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative font-[family-name:var(--font-geist-sans)] overflow-hidden">
      <SplineBackground />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600/90 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              AI 회의 비서
            </h1>
          </div>
          <div className="text-sm text-gray-300 font-medium px-3 py-1 rounded-full bg-white/10 border border-white/10">
            Powered by Trae Builder
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 space-y-6 pointer-events-auto"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            회의 내용을 <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              실행 가능한 업무
            </span>로
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-black/30 p-4 rounded-2xl border border-white/10 shadow-sm">
            회의 녹음 파일을 업로드하세요. <br/>
            AI가 자동으로 요약하고 Notion 업무 리스트에 동기화해 드립니다.
          </p>
        </motion.div>

        <div className="space-y-12 max-w-3xl mx-auto pointer-events-auto">
          {/* Upload Section */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={result ? "hidden" : "block"}
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/10">
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center space-y-4"
                >
                  <div className="flex items-center justify-center gap-3 text-blue-400 font-medium bg-blue-500/10 py-3 rounded-full">
                    <Sparkles className="w-5 h-5 animate-spin-slow" />
                    <span>AI 파이프라인 가동 중...</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    음성 변환 • 맥락 분석 • 업무 추출 • Notion 연동
                  </p>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-900/50 backdrop-blur-sm text-red-200 rounded-xl text-center border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Results Section */}
          {result && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 flex justify-center">
                 <button 
                   onClick={() => { setResult(null); setFile(null); }}
                   className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 text-gray-200 font-medium hover:text-blue-400 hover:bg-white/20 transition-all border border-white/10"
                 >
                   <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                   다른 파일 처리하기
                 </button>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <ResultViewer data={result} />
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </main>
  );
}
