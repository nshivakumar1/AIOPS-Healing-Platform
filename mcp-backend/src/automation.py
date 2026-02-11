import boto3
from typing import Dict, Any, Optional

class AutomationManager:
    def __init__(self, region: str = "us-east-1"):
        self.ecs_client = boto3.client("ecs", region_name=region)
        self.region = region

    def restart_service(self, cluster_name: str, service_name: str) -> Dict[str, Any]:
        """
        Restarts an ECS service by forcing a new deployment.
        """
        try:
            response = self.ecs_client.update_service(
                cluster=cluster_name,
                service=service_name,
                forceNewDeployment=True
            )
            return {
                "status": "success", 
                "message": f"Service {service_name} restart triggered.",
                "details": response.get("service", {}).get("serviceName")
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def execute_action(self, action_id: str, target: Dict[str, str]) -> Dict[str, Any]:
        """
        Dispatcher for automation actions.
        """
        if action_id == "restart_service":
            cluster = target.get("cluster")
            service = target.get("service")
            if not cluster or not service:
                return {"status": "error", "message": "Missing 'cluster' or 'service' in target"}
            return self.restart_service(cluster, service)
            
        return {"status": "error", "message": f"Unknown action_id: {action_id}"}
