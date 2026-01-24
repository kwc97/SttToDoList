import os
from openai import OpenAI

class SpeechAgent:
    def __init__(self, client: OpenAI):
        self.client = client

    def process(self, audio_file_path: str) -> str:
        """
        Transcribes audio file to text using OpenAI Whisper.
        """
        print(f"🎙️ [Speech Agent] Processing audio file: {audio_file_path}...")
        
        # Check if file exists
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        try:
            with open(audio_file_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            print("✅ [Speech Agent] Transcription complete.")
            return transcription.text
        except Exception as e:
            print(f"❌ [Speech Agent] Error: {e}")
            raise e
