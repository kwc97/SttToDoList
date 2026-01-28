"use client";

import { useState } from "react";
import axios from "axios";
import { Mic2, Sparkles, Upload, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import FileUpload from "./components/FileUpload";
import ResultViewer from "./components/ResultViewer";
import SplineBackground from "./components/SplineBackground";

// Define the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const pollTaskStatus = async (taskId: string) => {
    const baseUrl = API_URL.endsWith("/api") ? API_URL : `${API_URL.replace(/\/$/, "")}/api`;
    
    try {
      const response = await axios.get(`${baseUrl}/status/${taskId}`);
      const data = response.data;

      if (data.status === "completed") {
        setResult(data.result);
        setIsLoading(false);
        setStatus("");
      } else if (data.status === "failed") {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        setIsLoading(false);
        setStatus("");
      } else {
        // Continue polling
        setStatus(data.status === "processing" ? "AI가 내용을 분석하고 있습니다..." : "대기 중...");
        setTimeout(() => pollTaskStatus(taskId), 3000);
      }
    } catch (err) {
      console.error("❌ [Polling] Error:", err);
      setError("상태를 확인하는 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setIsLoading(true);
    setStatus("파일을 업로드하는 중...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // API URL 정규화
      const baseUrl = API_URL.endsWith("/api") ? API_URL : `${API_URL.replace(/\/$/, "")}/api`;
      
      console.log(`📤 [API] Uploading to: ${baseUrl}/upload`);

      // 1. Start the task
      const response = await axios.post(`${baseUrl}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { task_id } = response.data;
      console.log(`🆔 [API] Task started: ${task_id}`);
      
      // 2. Start polling for status
      setStatus("업로드 완료! 분석을 시작합니다...");
      pollTaskStatus(task_id);

    } catch (err: any) {
      console.error("❌ [API] Error:", err);
      setIsLoading(false);
      setStatus("");
      
      if (err.response?.status === 413) {
        setError("파일 용량이 너무 큽니다. 더 작은 파일로 시도해 주세요.");
      } else {
        setError(`연결 실패: ${err.message}. 서버 설정을 확인해 주세요.`);
      }
    }
  };

  return (
    <main className="min-h-screen relative font-[family-name:var(--font-geist-sans)] overflow-x-hidden pointer-events-none">
      <SplineBackground />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <Mic2 className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              말로 만드는 TODO
            </h1>
          </div>
          {/* Login section removed as requested */}
        </div>
      </header>

      {/* Hero Section - Full Screen with Spline Background Visible */}
      <section className="relative h-screen flex flex-col items-center justify-center z-10">
        {/* Text removed as requested */}
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce pointer-events-auto cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Content Section - Matches Spline "Interior" Feel */}
      <section className="relative min-h-screen z-20 bg-[#050505] pointer-events-auto">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#050505] -mt-32 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
              워크플로우 시작하기
            </h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              녹음 파일을 업로드하면 AI가 분석하여 Notion 데이터베이스에 자동으로 동기화합니다.
            </p>
            <div className="inline-block text-left bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
              <p className="text-sm text-blue-400 font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> 사용 방법 안내
              </p>
              <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside marker:text-blue-500">
                <li>회의 시작 시 <strong>회의 날짜</strong>를 말하고 시작하세요.</li>
                <li>회의 첫 발언 시 <strong>본인 이름</strong>을 말한 후 이야기하세요.</li>
                <li>업무가 나오면 <strong>마감일(Due date)</strong>도 함께 말해주면 더 정확하게 정리됩니다.</li>
              </ul>
            </div>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Upload Card - Glassmorphism fitting the dark interior */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={result ? "hidden" : "block"}
            >
              <div className="bg-[#0A0A0A] rounded-[2rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
                {/* Decorative gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                <div className="absolute -top-[200px] -right-[200px] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-colors duration-700" />
                
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-10 text-center space-y-5"
                  >
                    <div className="inline-flex items-center gap-3 text-blue-400 font-medium bg-blue-500/10 px-6 py-3 rounded-full border border-blue-500/20">
                      <Sparkles className="w-5 h-5 animate-spin-slow" />
                      <span>{status || "AI Processing Pipeline Active"}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">
                      {status.includes("분석") ? "Transcribing • Analyzing • Syncing" : "Preparing Audio Stream"}
                    </p>
                  </motion.div>
                )}
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-4 bg-red-500/10 text-red-400 rounded-xl text-center border border-red-500/20 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Results Section */}
            {result && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-10 flex justify-center">
                   <button 
                     onClick={() => { setResult(null); setFile(null); }}
                     className="group flex items-center gap-2 px-8 py-3 rounded-full bg-[#1A1A1A] text-gray-300 font-medium hover:text-white hover:bg-[#252525] transition-all border border-white/5 hover:border-white/10"
                   >
                     <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                     새로운 파일 분석하기
                   </button>
                </div>
                <div className="bg-[#0A0A0A] rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden">
                  <ResultViewer data={result} />
                </div>
              </motion.section>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="border-t border-white/5 py-12 bg-black text-center text-gray-600 text-sm">
          <p>© 2025 AI Meeting Assistant. All rights reserved.</p>
        </footer>
      </section>
    </main>
  );
}
