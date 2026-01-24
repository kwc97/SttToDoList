import argparse
import sys
from pipeline import PipelineOrchestrator

def main():
    parser = argparse.ArgumentParser(description="AI Meeting Assistant Pipeline")
    parser.add_argument("file", nargs="?", help="Path to the audio file")
    parser.add_argument("--mock", action="store_true", help="Run with mock data for testing")
    
    args = parser.parse_args()

    orchestrator = PipelineOrchestrator()

    if args.mock:
        # Mock transcript for demonstration
        mock_text = """
        John: Okay everyone, let's start. We need to fix the login bug on the staging server.
        Sarah: I can handle that. I'll have it done by tomorrow.
        John: Great. Also, Mike, we need the quarterly report finalized.
        Mike: Sure, I'll send the draft by Friday.
        John: And we need to schedule a meeting with the client next week.
        Sarah: I'll check their availability and send out an invite.
        John: Perfect. Meeting adjourned.
        """
        orchestrator.run(audio_file_path="mock_audio.mp3", mock_transcript=mock_text)
        return

    if not args.file:
        print("Usage: python main.py <audio_file> or python main.py --mock")
        sys.exit(1)

    orchestrator.run(args.file)

if __name__ == "__main__":
    main()
