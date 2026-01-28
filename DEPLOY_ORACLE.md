# 🚀 Oracle Cloud Free Tier 배포 가이드

이 문서는 Vercel의 제한(4.5MB 용량, 10초 타임아웃)을 벗어나, **1시간 이상의 대용량 파일**을 처리할 수 있는 강력한 Oracle Cloud 서버에 프로젝트를 배포하는 방법을 설명합니다.

---

## 0. Vercel 배포 철회 (사전 작업)
이미 Vercel에 배포된 상태라면 다음 단계를 통해 정리를 권장합니다.
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속.
2. 해당 프로젝트 선택 -> `Settings` -> `Git`.
3. `Connected Repository`에서 **Disconnect** 클릭 (자동 배포 중단).
4. (선택 사항) `Settings` -> `General` 최하단의 **Delete**를 눌러 프로젝트 완전히 삭제.

---

## 1. Oracle Cloud 인스턴스 생성
1. [Oracle Cloud 콘솔](https://www.oracle.com/cloud/free/) 로그인.
2. **인스턴스 생성 (Create Instance)** 클릭.
3. **이미지 및 구성 (Image and shape)**:
   - **이미지**: `Canonical Ubuntu 22.04` (기본값)
   - **구성**: `변경` 클릭 -> `Ampere (ARM)` 선택 -> `VM.Standard.A1.Flex` 선택.
   - **OCPU 수**: 4, **메모리**: 24GB 설정 (**Always Free** 마크 확인).
4. **네트워킹**: `공용 IP 주소 할당` 선택.
5. **SSH 키 추가**: `프라이빗 키 저장`을 눌러 `.key` 파일을 컴퓨터에 저장 (매우 중요!).
6. **생성** 버튼 클릭.

---

## 2. 보안 목록 설정 (포트 개방)
외부에서 접속할 수 있도록 포트를 열어야 합니다.
1. 인스턴스 정보 페이지에서 **서브넷 (Subnet)** 링크 클릭.
2. **보안 목록 (Default Security List)** 클릭.
3. **수신 규칙 추가 (Add Ingress Rules)**:
   - **소스 CIDR**: `0.0.0.0/0`
   - **IP 프로토콜**: `TCP`
   - **대상 포트 범위**: `80, 8000` (80은 웹, 8000은 API용)
   - **추가** 클릭.

---

## 3. 서버 접속 및 환경 구축
터미널(Mac/Linux) 또는 PowerShell(Windows)에서 실행합니다.

```bash
# 1. 서버 접속 (키파일 경로와 서버 IP 수정)
ssh -i "path/to/your/key.key" ubuntu@your_server_ip

# 2. 시스템 업데이트 및 Docker 설치
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y

# 3. Docker 권한 설정 (로그아웃 후 재접속 필요할 수 있음)
sudo usermod -aG docker $USER
```

---

## 4. 프로젝트 배포
```bash
# 1. 코드 가져오기
git clone https://github.com/kwc97/SttToDoList.git
cd SttToDoList

# 2. 환경 변수 설정
nano .env
# 아래 내용 복사/붙여넣기 (Ctrl+O 저장, Ctrl+X 종료)
# OPENAI_API_KEY=your_key
# NOTION_TOKEN=your_token
# NOTION_DATABASE_ID=your_db_id

# 3. 서비스 실행 (Docker)
sudo docker-compose up -d --build
```

---

## 5. 확인 및 사용
- **웹 주소**: `http://your_server_ip` (포트 80)
- **API 주소**: `http://your_server_ip:8000/api`
- 이제 1시간 분량의 파일도 타임아웃 없이 쾌적하게 처리됩니다! 🚀

---

## 💡 팁: 도메인 및 HTTPS (추가 작업)
보안(HTTPS)을 적용하려면 `Nginx Proxy Manager`를 추가로 설치하거나 `Certbot`을 사용하는 것이 좋습니다. 초기 테스트는 위 과정만으로 충분합니다.
