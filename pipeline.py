import os
from openai import OpenAI
from dotenv import load_dotenv
from mocks import MockClient

# Import Agents
from agents.speech import SpeechAgent
from agents.analysis import AnalysisAgent, SummarizationAgent
from agents.task import TaskExtractionAgent
from agents.structure import StructuringAgent, IntegrationAgent

# Load environment variables
load_dotenv()

class PipelineOrchestrator:
    def __init__(self):
        # Initialize OpenAI Client
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key or "your_api_key_here" in api_key:
            print("⚠️ [System] OPENAI_API_KEY not found or invalid. Switching to MOCK MODE for demonstration.")
            self.client = MockClient()
        else:
            self.client = OpenAI(api_key=api_key)

        # Initialize Agents
        self.speech_agent = SpeechAgent(self.client)
        self.analysis_agent = AnalysisAgent(self.client)
        self.summary_agent = SummarizationAgent(self.client)
        self.task_agent = TaskExtractionAgent(self.client)
        self.structuring_agent = StructuringAgent()
        self.integration_agent = IntegrationAgent()

    def run(self, audio_file_path: str, mock_transcript: str = None):
        print("\n🚀 [System] Starting AI Pipeline...")
        
        # Step 1: Speech to Text
        if mock_transcript:
            print("ℹ️ [System] Using mock transcript for demonstration.")
            transcript = mock_transcript
        else:
            transcript = self.speech_agent.process(audio_file_path)

        # Step 2: Analysis
        analysis = self.analysis_agent.process(transcript)

        # Step 3: Summarization
        summary = self.summary_agent.process(transcript, analysis)

        # Step 4: Task Extraction (Now returns dict with metadata)
        extracted_data = self.task_agent.process(transcript, analysis)

        # Step 5: Structuring
        structured_data = self.structuring_agent.process(summary, extracted_data)

        # Step 6: Integration & Validation
        if self.integration_agent.validate(structured_data):
            # Attempt to sync to Notion
            self.integration_agent.sync_to_notion(structured_data)
            
            final_output = self.integration_agent.export(structured_data)
            print("\n📤 [System] Final Output Generated:")
            print(final_output)
            return final_output
        else:
            print("❌ [System] Pipeline failed at validation stage.")
            return None

if __name__ == "__main__":
    # Test run
    orchestrator = PipelineOrchestrator()
    # orchestrator.run("meeting.mp3")
