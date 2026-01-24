from openai import OpenAI

class AnalysisAgent:
    def __init__(self, client: OpenAI):
        self.client = client

    def process(self, text: str) -> str:
        """
        Analyzes the meeting flow and context.
        """
        print("🧠 [Analysis Agent] Analyzing meeting context and flow...")
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert business analyst. Analyze the following meeting transcript. Identify the main topics, key decisions made, and the general flow of the conversation. Output a concise analysis in Korean."},
                {"role": "user", "content": text}
            ]
        )
        analysis = response.choices[0].message.content
        print("✅ [Analysis Agent] Analysis complete.")
        return analysis

class SummarizationAgent:
    def __init__(self, client: OpenAI):
        self.client = client

    def process(self, text: str, analysis: str) -> str:
        """
        Generates a concise executive summary based on text and analysis.
        """
        print("📝 [Summarization Agent] Generating executive summary...")
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an executive secretary. Create a 3-5 sentence summary of the meeting based on the transcript and analysis provided. The summary should be suitable for an executive report. Tone: Professional, Concise. Language: Korean (Must)."},
                {"role": "user", "content": f"Context Analysis: {analysis}\n\nTranscript: {text}"}
            ]
        )
        summary = response.choices[0].message.content
        print("✅ [Summarization Agent] Summary generated.")
        return summary
