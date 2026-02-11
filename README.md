# AIOps Platform - Verification and Walkthrough Guide

This document guides you through verifying the deployed **AIOps Healing Platform**.

## 1. System Architecture Review

We have successfully implemented the following components:

| Component | Tech Stack | Status | Path |
|-----------|------------|--------|------|
| **Infrastructure** | Terraform (AWS ECS, ECR, S3, CloudFront) | ✅ Ready | `terraform-infra/` |
| **Backend Orchestrator** | Python FastAPI + Boto3 | ✅ Ready | `mcp-backend/` |
| **AI Intelligence** | Google Gemini Pro | ✅ Ready | `mcp-backend/src/gemini.py` |
| **Frontend Dashboard** | Next.js + Tailwind + SWR | ✅ Ready | `frontend-app/` |
| **CI/CD** | GitHub Actions | ✅ Ready | `.github/workflows/` |

---

## 2. Local Verification (Run the Stack)

You can run the entire platform locally to verify functionality before deploying.

### Step 1: Start the Backend (Orchestrator + AI)
Requires `GEMINI_API_KEY` environment variable.

```bash
# Terminal 1
cd mcp-backend
pip install -r requirements.txt
export GEMINI_API_KEY="your-api-key-here" 
# export AWS_PROFILE="your-profile" (Optional, for Boto3)
uvicorn src.main:app --reload --port 8000
```
**Verify:** Visit `http://localhost:8000/docs` to see the Swagger UI.

### Step 2: Start the Frontend
```bash
# Terminal 2
cd frontend-app
npm install
npm run dev
```
**Verify:** Visit `http://localhost:3000`. You should see the "System Overview" dashboard.

---

## 3. Usage Walkthrough (The "Healing" Flow)

### Scenario: "Critical Payment Service Failure"

1.  **View Incidents**: on the Dashboard, observe the "Active Incidents" list. You should see mock incidents (e.g., "High Latency on Payment Gateway").
2.  **Analyze**:
    *   Click the **"Analyze (AI)"** button on the Payment Gateway incident.
    *   The **Remediation Modal** will open.
    *   **Gemini** will analyze the logs and output a Root Cause Analysis (RCA).
3.  **Review Code Fix**:
    *   If Gemini identifies a code issue, a **Suggested Code Fix** block will appear.
4.  **Execute Remediation**:
    *   Click **"Execute Fix"**.
    *   The backend will use `boto3` to trigger an ECS Service restart (or other action).
    *   *Note: Locally, this will fail if you don't have AWS credentials exported, but the API call will be attempted.*

---

## 4. Deployment Verification

To deploy the infrastructure to your AWS account:

```bash
cd terraform-infra
terraform init
terraform apply
```

This will create:
- **VPC**: `dev-vpc`
- **ECS Cluster**: `dev-cluster`
- **ALB**: `dev-alb`
- **ECR Repos**: `dev-frontend-repo`, `dev-backend-repo`

After `apply`, push your code to GitHub to trigger the Actions pipeline, which will build and deploy the containers to Fargate.
