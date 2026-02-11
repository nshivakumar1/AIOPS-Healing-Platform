import google.generativeai as genai
import os
import json
from typing import Dict, Any

class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not set. AI features will be disabled.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')

    async def analyze_incident(self, incident_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes incident logs and context using Gemini to find RCA and fixes.
        """
        if not self.model:
            return {
                "error": "Gemini API not configured",
                "rca": "AI Analysis Unavailable",
                "remediation": "Manual investigation required."
            }

        prompt = f"""
        Act as a Senior Site Reliability Engineer (SRE). Analyze the following incident context and provide a Root Cause Analysis (RCA) and recommended remediation steps.
        
        Incident Context:
        {json.dumps(incident_context, indent=2)}
        
        Respond ONLY in JSON format with the following structure:
        {{
            "root_cause_analysis": "Detailed explanation of what went wrong...",
            "severity_assessment": "Critical/Major/Minor",
            "confidence_score": 0.0-1.0,
            "remediation_steps": [
                "Step 1...",
                "Step 2..."
            ],
            "automation_suggestion": "Description of a script to fix this automatically...",
            "suggested_code_fix": "Markdown code block (e.g., ```python ... ```) showing the specific code change if applicable, or null",
            "github_pr_body": "A concise PR description explaining the fix, suitable for GitHub."
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            # clean up potential markdown formatting in response
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error generating AI analysis: {e}")
            return {
                "error": str(e),
                "rca": "Analysis Failed",
                "remediation": "Please check logs manually."
            }
