import json
from unittest.mock import MagicMock

class MockResponse:
    def __init__(self, content):
        self.choices = [MagicMock(message=MagicMock(content=content))]

class MockChat:
    def __init__(self):
        self.completions = self

    def create(self, model, messages, response_format=None):
        # Flatten messages to search for keywords regardless of role
        all_content = " ".join([m.get("content", "") for m in messages])
        
        # Mock Analysis
        if "Analyze the following meeting transcript" in all_content or "expert business analyst" in all_content:
            return MockResponse("회의는 로그인 버그 수정(담당: Sarah)과 분기 보고서(담당: Mike)에 집중되었습니다. 다음 주 클라이언트 미팅 일정도 논의되었습니다.")
        
        # Mock Summary
        if "You are an executive secretary" in all_content:
            return MockResponse("스테이징 서버의 로그인 버그 수정과 분기 보고서 마감 일정에 대한 주요 결정이 내려졌습니다. Sarah는 내일까지 버그 수정을 완료하고, Mike는 금요일까지 보고서 초안을 제출하기로 했습니다. 또한 다음 주 클라이언트 미팅 일정을 조율하기로 했습니다.")

        # Mock Task Extraction
        if "Extract actionable tasks" in all_content:
            mock_data = {
                "meeting_title": "주간 업무 회의",
                "meeting_date": "2026-01-24",
                "participants": ["John", "Sarah", "Mike"],
                "todos": [
                    {"action": "로그인 버그 수정", "description": "스테이징 서버에서 발생하는 로그인 버그 수정", "owner": "Sarah", "due": "2026-01-25"},
                    {"action": "분기 보고서 작성", "description": "분기 보고서 초안 작성 및 제출", "owner": "Mike", "due": "2026-01-30"},
                    {"action": "클라이언트 미팅 조율", "description": "클라이언트 가능 시간 확인 및 초대장 발송", "owner": "Sarah", "due": None}
                ]
            }
            return MockResponse(json.dumps(mock_data))
            
        return MockResponse("Mock content")

class MockClient:
    def __init__(self, api_key=None):
        self.chat = MockChat()
        self.audio = MagicMock()
        # Mock audio transcription
        self.audio.transcriptions.create.return_value = MagicMock(text="Mock Transcript Text")
