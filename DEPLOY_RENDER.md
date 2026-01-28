# 🚀 Render.com 백엔드 배포 가이드

Vercel의 10초 타임아웃 제한 없이 1시간 이상의 대용량 파일을 처리할 수 있도록, 백엔드(FastAPI)를 Render.com에 배포하는 방법입니다.

---

## 1. Render.com 대시보드 작업
1. [Render.com](https://render.com)에 로그인합니다.
2. 우측 상단 **New +** 버튼 클릭 -> **Blueprint**를 선택합니다.
3. GitHub 리포지토리(`SttToDoList`)를 연결합니다.
4. **Service Group Name**을 적당히 입력합니다 (예: `stt-todo-app`).
5. **Environment Variables** 입력 화면이 나오면 다음 값을 입력합니다:
   - `OPENAI_API_KEY`: 본인의 OpenAI 키
   - `NOTION_API_KEY`: 본인의 Notion API 키
   - `NOTION_DATABASE_ID`: 본인의 Notion 데이터베이스 ID
6. **Apply** 버튼을 누릅니다.

---

## 2. 배포 확인
1. 배포가 시작되면 로그 화면이 나타납니다. `Dockerfile`을 이용해 빌드가 진행됩니다.
2. 완료되면 상단에 `https://stt-todo-backend.onrender.com`과 같은 URL이 생성됩니다.
3. 이 URL을 복사해 두세요.

---

## 3. 프론트엔드(Vercel) 연결 수정
1. [Vercel 대시보드](https://vercel.com)로 이동합니다.
2. 프로젝트의 **Settings** -> **Environment Variables**로 이동합니다.
3. `NEXT_PUBLIC_API_URL` 값을 방금 복사한 Render URL로 변경합니다. (예: `https://stt-todo-backend.onrender.com`)
4. **Deployments** 탭에서 가장 최근 배포의 `...` 버튼을 눌러 **Redeploy**를 진행합니다.

---

## 💡 참고 사항
- Render 무료 플랜은 15분간 접속이 없으면 서버가 잠자기 모드로 들어갑니다. 다시 접속할 때 깨어나는 데 약 1분 정도 소요될 수 있습니다.
- 일단 서버가 깨어나면, 1시간 이상의 긴 파일도 타임아웃 없이 안정적으로 처리합니다.
