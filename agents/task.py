import json
from openai import OpenAI

class TaskExtractionAgent:
    def __init__(self, client: OpenAI):
        self.client = client

    def process(self, text: str, analysis: str) -> dict:
        """
        Extracts TODOs and Meeting Info from the text.
        Returns a dictionary containing meeting info and a list of tasks.
        """
        print("⛏️ [Task Extraction Agent] Extracting actionable tasks and meeting details...")
        
        prompt = f"""
        Extract actionable tasks (TODOs) and meeting metadata from the transcript.
        All output values must be in Korean (except for dates).
        
        Output JSON Format:
        {{
            "meeting_title": "string (Inferred title in Korean)",
            "meeting_date": "YYYY-MM-DD (If mentioned, else null. MUST be YYYY-MM-DD format)",
            "participants": ["Name1", "Name2", ...],
            "todos": [
                {{
                    "action": "string (Task Title in Korean)",
                    "description": "string (Detailed description in Korean)",
                    "owner": "string (Assignee name or null)",
                    "due": "YYYY-MM-DD or null (MUST be YYYY-MM-DD format. If vague like 'next week', use null)"
                }}
            ]
        }}
        
        Rules:
        1. 'action' should be a short summary (Tasks.Title) in Korean.
        2. 'description' should contain more context (Tasks.Description) in Korean.
        3. Extract all participants mentioned or speaking.
        4. Dates MUST be strictly YYYY-MM-DD. If exact date is unknown, use null. Do NOT use text like "다음주" or "올겨울".
        
        Context: {analysis}
        Transcript: {text}
        """

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a precise task extractor. You output only valid JSON. All text content must be in Korean."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"} 
        )
        
        content = response.choices[0].message.content
        try:
            data = json.loads(content)
            return data
        except json.JSONDecodeError:
            print("❌ [Task Extraction Agent] Failed to parse JSON.")
            return {"meeting_title": "Untitled Meeting", "meeting_date": None, "participants": [], "todos": []}
