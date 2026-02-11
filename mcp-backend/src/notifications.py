import os
import requests
from jira import JIRA
from typing import Optional, Dict, Any

class NotificationManager:
    def __init__(self):
        # Jira Config
        self.jira_url = os.getenv("JIRA_URL")
        self.jira_user = os.getenv("JIRA_USER")
        self.jira_token = os.getenv("JIRA_TOKEN")
        self.jira_project = os.getenv("JIRA_PROJECT", "AIOPS")
        
        self.jira_client = None
        if self.jira_url and self.jira_user and self.jira_token:
            try:
                self.jira_client = JIRA(
                    server=self.jira_url,
                    basic_auth=(self.jira_user, self.jira_token)
                )
            except Exception as e:
                print(f"Failed to initialize Jira client: {e}")

        # Slack Config
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")

    def create_jira_ticket(self, summary: str, description: str, issue_type: str = "Bug", priority: str = "High") -> Optional[str]:
        """
        Creates a Jira ticket and returns the key (e.g., AIOPS-123).
        """
        if not self.jira_client:
            print("Jira client not initialized.")
            return None

        try:
            issue_dict = {
                'project': {'key': self.jira_project},
                'summary': summary,
                'description': description,
                'issuetype': {'name': issue_type},
                # 'priority': {'name': priority} # Priority names vary by instance, omitted for safety
            }
            new_issue = self.jira_client.create_issue(fields=issue_dict)
            return new_issue.key
        except Exception as e:
            print(f"Failed to create Jira ticket: {e}")
            return None

    def send_slack_alert(self, message: str, blocks: Optional[list] = None) -> bool:
        """
        Sends a message to Slack via Webhook.
        """
        if not self.slack_webhook_url:
            print("Slack webhook not set.")
            return False

        payload = {"text": message}
        if blocks:
            payload["blocks"] = blocks

        try:
            response = requests.post(self.slack_webhook_url, json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Failed to send Slack alert: {e}")
            return False
