# AI 회의 비서 (Meeting AI Assistant)

이 프로젝트는 **AI 기반 회의록 자동화 및 업무 관리 서비스**입니다. 사용자가 회의 녹음 파일을 업로드하면, AI가 내용을 분석하여 요약하고, 실행 가능한 업무(Action Items)를 추출하여 사용자의 Notion 데이터베이스에 자동으로 동기화해 줍니다.

## 1. 간단한 설명 (Project Overview)
Next.js의 인터랙티브한 UI와 Python(FastAPI) 백엔드의 강력한 AI 파이프라인이 결합된 하이브리드 애플리케이션입니다. OpenAI의 Whisper(음성 인식)와 GPT-4o(분석) 모델을 활용하여 회의 내용을 심층 분석하고, 이를 구조화된 데이터로 변환하여 Notion과 실시간으로 연동합니다.

## 2. 사용자 워크플로 (User Workflow)
1.  **접속:** 웹사이트에 접속하면 3D 인터랙티브 배경과 함께 직관적인 UI가 반겨줍니다.
2.  **업로드:** '파일 선택' 영역에 회의 녹음 파일(MP3, M4A 등)을 드래그 앤 드롭합니다.
3.  **분석 (AI Pipeline):**
    *   **STT:** Whisper 모델이 음성을 텍스트로 변환합니다.
    *   **분석 & 요약:** GPT-4o가 회의의 맥락을 이해하고 핵심 내용을 요약합니다.
    *   **업무 추출:** 실행 가능한 할 일(Todo), 담당자, 마감 기한을 자동으로 추출합니다.
4.  **동기화:** 추출된 데이터가 사용자의 연결된 Notion 데이터베이스에 자동으로 저장됩니다.
5.  **확인:** 화면에 분석 결과가 표시되며, 아래 링크를 통해 실제 Notion에 데이터가 올라오는지 확인할 수 있습니다.
    *   👉 **[Notion 데이터 확인하기](https://www.notion.so/Meeting-AI-Assistant-2f217050c7c7802ea24afd461f721401?source=copy_link)**

## 3. 상세 기능 (Detailed Features)
*   **🎙️ 고성능 음성 인식:** OpenAI Whisper 모델을 활용한 높은 정확도의 다국어 음성 텍스트 변환.
*   **🧠 지능형 맥락 분석:** 단순 텍스트 변환을 넘어, 회의의 주제와 흐름을 파악하는 AI Business Analyst 에이전트 탑재.
*   **✅ 자동화된 업무 관리:** '누가', '언제까지', '무엇을' 해야 하는지 파악하여 구조화된 데이터로 변환.
*   **🔗 Seamless Notion Integration:** 별도의 작업 없이 분석 결과가 Notion 페이지로 생성되고 속성(Property) 값이 채워짐.
*   **🎨 몰입형 UI 경험:**
    *   **Spline 3D:** 반응형 3D 배경 애니메이션.
    *   **Glassmorphism:** 현대적인 반투명 유리 질감 디자인.
    *   **Framer Motion:** 부드러운 화면 전환 및 인터랙션 애니메이션.
*   **☁️ Serverless Architecture:** Vercel에 최적화된 Next.js + Python API 구조로 확장성과 유지보수 용이.

## 시작하기 (Getting Started)

### 개발 서버 실행
```bash
npm run dev
# 또는
python -m uvicorn api.index:app --reload
```

### 배포 (Deployment)
이 프로젝트는 [Vercel](https://vercel.com) 배포에 최적화되어 있습니다.
1. GitHub 저장소에 코드를 푸시합니다.
2. Vercel에서 새 프로젝트를 생성하고 저장소를 가져옵니다.
3. 환경 변수(`OPENAI_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`)를 설정합니다.
4. 배포가 완료되면 자동으로 `/api` 엔드포인트가 활성화됩니다.
