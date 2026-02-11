from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pydantic import BaseModel
from typing import Dict, Any, List
from gemini import GeminiClient
from automation import AutomationManager
from notifications import NotificationManager

app = FastAPI(
    title="MCP Backend Orchestrator",
    description="Model Context Protocol Backend for AIOps Platform",
    version="0.1.0"
)

# Initialize Clients
gemini_client = GeminiClient()
automation_manager = AutomationManager()
notification_manager = NotificationManager()

class IncidentPayload(BaseModel):
    id: str
    title: str
    description: str
    logs: List[str]
    service: str

class RemediationPayload(BaseModel):
    action_id: str
    target: Dict[str, str]

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3002",
    # Add CloudFront domain here later
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "mcp-backend"}

@app.post("/api/v1/analyze")
async def analyze_incident(payload: IncidentPayload):
    """
    Analyze incoming incident data with Gemini to generate RCA and fixes.
    """
    context = payload.model_dump()
    analysis = await gemini_client.analyze_incident(context)
    
    # Auto-Notify logic
    severity = analysis.get("severity_assessment", "").lower()
    if "critical" in severity or "major" in severity:
        # Send Slack Alert
        notification_manager.send_slack_alert(
            message=f"🚨 *High Severity Incident Detected: {payload.title}*\n\n*RCA*: {analysis.get('root_cause_analysis', 'N/A')}"
        )
        
        # Create Jira Ticket
        ticket_key = notification_manager.create_jira_ticket(
            summary=f"[AIOps] {payload.title}",
            description=f"Incident ID: {payload.id}\nService: {payload.service}\n\nRCA:\n{analysis.get('root_cause_analysis')}\n\nRemediation:\n{analysis.get('remediation_steps')}"
        )
        if ticket_key:
            analysis["jira_ticket"] = ticket_key

    return analysis

@app.post("/api/v1/execute-remediation")
async def execute_remediation(payload: RemediationPayload):
    """
    Execute an automated remediation action (e.g., restart service).
    """
    result = automation_manager.execute_action(payload.action_id, payload.target)
    return result

@app.get("/api/v1/incidents")
async def get_incidents():
    # Placeholder for fetching from DB/ELK
    return [
        {
            "id": "INC-2024-001",
            "title": "High Latency on Payment Gateway",
            "service": "payment-service",
            "status": "Analyzing",
            "severity": "Critical",
            "timestamp": "2024-02-11T10:00:00Z"
        },
        {
             "id": "INC-2024-002",
             "title": "Memory Leak in Auth Service",
             "service": "auth-service",
             "status": "Auto-Healing",
             "severity": "Major",
             "timestamp": "2024-02-11T09:45:00Z"
        }
    ]

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
