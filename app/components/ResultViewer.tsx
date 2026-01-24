import { CheckCircle2, Circle, Calendar, User, FileText, Briefcase, Clock, Users } from "lucide-react";
import clsx from "clsx";

interface TodoItem {
  action: string;
  description: string;
  owner: string | null;
  due: string | null;
}

interface MeetingInfo {
  title: string | null;
  date: string | null;
  participants: string[];
}

interface ResultData {
  summary: string;
  meeting_info: MeetingInfo;
  todos: TodoItem[];
}

interface ResultViewerProps {
  data: ResultData;
}

export default function ResultViewer({ data }: ResultViewerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Meeting Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">회의 상세 정보</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">회의 제목</h3>
            <p className="text-lg font-medium text-gray-900">{data.meeting_info.title || "제목 없음"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">일시</h3>
            <div className="flex items-center gap-2 text-gray-900">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{data.meeting_info.date || "날짜 불명"}</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-1">참여자</h3>
            <div className="flex flex-wrap gap-2">
              {data.meeting_info.participants.length > 0 ? (
                data.meeting_info.participants.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Users className="w-3 h-3 text-gray-500" />
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">감지된 참여자 없음</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">핵심 요약</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed text-lg">{data.summary}</p>
        </div>
      </div>

      {/* Todos Section (Enhanced UI) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">할 일 목록</h2>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {data.todos.length}개 업무
          </span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {data.todos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              추출된 할 일이 없습니다.
            </div>
          ) : (
            data.todos.map((todo, idx) => (
              <div key={idx} className="p-5 hover:bg-gray-50 transition-colors flex items-start gap-4 group">
                <div className="mt-1">
                  <Circle className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-gray-900 font-semibold text-lg">{todo.action}</h3>
                    {todo.due && (
                      <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{todo.due}까지</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">{todo.description}</p>
                  
                  <div className="pt-2 flex items-center gap-4">
                    {todo.owner && (
                      <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{todo.owner}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
          <CheckCircle2 className="w-4 h-4" />
          Notion 데이터베이스 동기화 완료
        </div>
      </div>
    </div>
  );
}
