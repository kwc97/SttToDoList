from typing import List, Optional
from pydantic import BaseModel, ValidationError
import json
import os
from notion_client import Client

# --- Data Models ---
class TodoItem(BaseModel):
    action: str  # Tasks.Title
    description: Optional[str] # Tasks.Description
    owner: Optional[str] # AssignedToUserId (Name)
    due: Optional[str] # DueDate

class MeetingInfo(BaseModel):
    title: Optional[str]
    date: Optional[str]
    participants: List[str]

class MeetingResult(BaseModel):
    summary: str
    meeting_info: MeetingInfo
    todos: List[TodoItem]

# --- Agents ---

class StructuringAgent:
    def process(self, summary: str, extracted_data: dict) -> dict:
        """
        Normalizes the output into strict JSON structure.
        """
        print("📐 [Structuring Agent] Normalizing data structure...")
        
        raw_todos = extracted_data.get("todos", [])
        
        # Clean up todos
        cleaned_todos = []
        for todo in raw_todos:
            cleaned_todos.append({
                "action": todo.get("action"),
                "description": todo.get("description", ""),
                "owner": todo.get("owner"),
                "due": todo.get("due")
            })

        structured_data = {
            "summary": summary,
            "meeting_info": {
                "title": extracted_data.get("meeting_title", "Untitled Meeting"),
                "date": extracted_data.get("meeting_date"),
                "participants": extracted_data.get("participants", [])
            },
            "todos": cleaned_todos
        }
        return structured_data

import re

class IntegrationAgent:
    def __init__(self):
        self.notion_api_key = os.getenv("NOTION_API_KEY", "").strip()
        self.database_id = os.getenv("NOTION_DATABASE_ID", "").strip()
        self.client = None
        self._db_properties = None  # 데이터베이스 프로퍼티 캐시
        # 프로퍼티 이름을 .env에서 설정 가능하도록 지원 (기본값은 영어 스키마)
        self.prop_title = os.getenv("NOTION_PROP_TITLE", "Name").strip() or "Name"
        self.prop_meeting_title = os.getenv("NOTION_PROP_MEETING_TITLE", "Meeting Title").strip() or "Meeting Title"
        self.prop_description = os.getenv("NOTION_PROP_DESCRIPTION", "Description").strip() or "Description"
        self.prop_participants = os.getenv("NOTION_PROP_PARTICIPANTS", "Participants").strip() or "Participants"
        self.prop_assignee = os.getenv("NOTION_PROP_ASSIGNEE", "Assignee").strip() or "Assignee"
        self.prop_meeting_date = os.getenv("NOTION_PROP_MEETING_DATE", "Meeting Date").strip() or "Meeting Date"
        self.prop_due_date = os.getenv("NOTION_PROP_DUE_DATE", "Due Date").strip() or "Due Date"

        if self.notion_api_key:
            try:
                self.client = Client(auth=self.notion_api_key)
                print(f"🔹 [Integration Agent] Initialized with DB ID: {self.database_id}")
                self._validate_database_connection()
            except Exception as e:
                print(f"❌ [Integration Agent] Notion 클라이언트 초기화 실패: {e}")
                self.client = None

    def _validate_database_connection(self):
        """시작 시 데이터베이스 연결 및 스키마 검증"""
        if not self.client or not self.database_id:
            return

        try:
            db = self.client.databases.retrieve(database_id=self.database_id)

            # 데이터베이스 이름 출력
            title = db.get("title", [{}])
            db_name = title[0].get("plain_text", "제목 없음") if title else "제목 없음"
            print(f"📋 [Integration Agent] 연결된 데이터베이스: {db_name}")

            # 프로퍼티 목록 저장 및 출력
            self._db_properties = db.get("properties", {})
            print(f"📋 [Integration Agent] 데이터베이스 프로퍼티 목록:")
            for name, info in self._db_properties.items():
                print(f"   - {name}: {info.get('type')}")

            # 필수 프로퍼티 확인
            required = [self.prop_title, self.prop_meeting_title, self.prop_description, self.prop_participants, self.prop_assignee]
            missing = [p for p in required if p not in self._db_properties]

            # 타이틀 프로퍼티 자동 보정: .env 지정 이름이 없으면 title 타입을 탐색하여 대체
            if self.prop_title not in self._db_properties:
                fallback_title = None
                for k, v in self._db_properties.items():
                    if v.get("type") == "title":
                        fallback_title = k
                        break
                if fallback_title:
                    print(f"ℹ️ [Integration Agent] 타이틀 프로퍼티 '{self.prop_title}'를 찾지 못해 '{fallback_title}'로 자동 설정합니다.")
                    self.prop_title = fallback_title
                    if self.prop_title in missing:
                        missing.remove(self.prop_title)

            if missing:
                print(f"⚠️ [Integration Agent] 누락된 프로퍼티: {missing}")
                print(f"   💡 Notion 데이터베이스에 위 프로퍼티를 추가하거나, 코드의 프로퍼티 이름을 수정하세요.")
            else:
                print(f"✅ [Integration Agent] 데이터베이스 스키마 검증 완료")

        except Exception as e:
            print(f"❌ [Integration Agent] 데이터베이스 검증 실패: {e}")
            if "unauthorized" in str(e).lower() or "Could not find" in str(e):
                print("   💡 힌트: Integration이 데이터베이스에 연결(Share)되어 있는지 확인하세요.")

    def validate(self, data: dict) -> bool:
        """
        Validates if the data is ready for Notion integration.
        """
        print("🔌 [Integration Agent] Validating for Notion Database compatibility...")
        try:
            # Pydantic validation
            validated_model = MeetingResult(**data)
            print("✅ [Integration Agent] Validation Successful. Payload ready.")
            return True
        except ValidationError as e:
            print(f"❌ [Integration Agent] Validation Failed: {e}")
            return False

    def export(self, data: dict) -> str:
        """
        Returns the final JSON string.
        """
        return json.dumps(data, indent=2, ensure_ascii=False)
    
    def _is_valid_date(self, date_str: Optional[str]) -> bool:
        if not date_str:
            return False
        # Simple YYYY-MM-DD regex
        return bool(re.match(r"^\d{4}-\d{2}-\d{2}$", date_str))

    def sync_to_notion(self, data: dict) -> bool:
        """
        Syncs the validated data to Notion Database.
        """
        if not self.client or not self.database_id:
            print("⚠️ [Integration Agent] Notion credentials missing. Skipping sync.")
            return False
            
        print("🚀 [Integration Agent] Syncing to Notion Database...")
        
        try:
            meeting_info = data.get("meeting_info", {})
            todos = data.get("todos", [])
            
            success_count = 0
            
            # Insert each task as a row in the Tasks Database
            for todo in todos:
                properties = {
                    self.prop_title: { 
                        "title": [{"text": {"content": todo.get("action", "Untitled Task")}}]
                    },
                    self.prop_meeting_title: {
                        "rich_text": [{"text": {"content": meeting_info.get("title", "")}}]
                    },
                    self.prop_description: {
                        "rich_text": [{"text": {"content": todo.get("description", "")}}]
                    },
                    self.prop_participants: {
                        "rich_text": [{"text": {"content": ", ".join(meeting_info.get("participants", []))}}]
                    },
                    self.prop_assignee: {
                        "rich_text": [{"text": {"content": todo.get("owner") or "Unassigned"}}]
                    }
                }
                
                # Add Date fields ONLY if valid
                meeting_date = meeting_info.get("date")
                if self._is_valid_date(meeting_date):
                    properties[self.prop_meeting_date] = {"date": {"start": meeting_date}}
                elif meeting_date:
                     print(f"⚠️ [Integration Agent] Invalid Meeting Date format: '{meeting_date}'. Skipping date field.")

                due_date = todo.get("due")
                if self._is_valid_date(due_date):
                    properties[self.prop_due_date] = {"date": {"start": due_date}}
                elif due_date:
                    print(f"⚠️ [Integration Agent] Invalid Due Date format: '{due_date}'. Appending to description.")
                    # Append invalid date text to description so it's not lost
                    current_desc = todo.get("description", "")
                    properties[self.prop_description]["rich_text"][0]["text"]["content"] = f"{current_desc} (기한: {due_date})"

                try:
                    # 디버그: 전송 전 페이로드 출력
                    print(f"📤 [Integration Agent] 전송 중: {todo.get('action', 'Untitled Task')}")

                    result = self.client.pages.create(
                        parent={"database_id": self.database_id},
                        properties=properties
                    )

                    # 생성된 페이지 URL 출력
                    page_url = result.get("url", "URL 없음")
                    print(f"   ✅ 생성 완료: {page_url}")

                    success_count += 1
                except Exception as row_error:
                    print(f"❌ [Integration Agent] 삽입 실패: {row_error}")
                    # 상세 에러 정보 출력
                    if hasattr(row_error, "code"):
                        print(f"   에러 코드: {row_error.code}")
                    if hasattr(row_error, "body"):
                        print(f"   에러 상세: {row_error.body}")
                    print(f"   페이로드: {json.dumps(properties, ensure_ascii=False, indent=2)}")
                
            print(f"✅ [Integration Agent] Successfully synced {success_count}/{len(todos)} tasks to Notion!")
            
            if success_count == 0 and len(todos) > 0:
                print("⚠️ [Integration Agent] Warning: No tasks were synced. Check property names in Notion Database.")
                print(f"   Expected Properties: '{self.prop_title}', '{self.prop_meeting_title}', '{self.prop_meeting_date}', '{self.prop_due_date}', '{self.prop_description}', '{self.prop_participants}', '{self.prop_assignee}'")
                
            return True
            
        except Exception as e:
            print(f"❌ [Integration Agent] Notion Sync Critical Failure: {e}")
            return False

