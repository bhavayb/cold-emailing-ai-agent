from fastapi import APIRouter
from pydantic import BaseModel
from agents.graph import campaign_graph
from api.resume_routes import CURRENT_DOSSIER
from config.storage import load_campaigns, save_campaigns
from typing import List
from config.mailer import send_single_email

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])

# Load saved campaigns from backend/data/campaigns.json on startup
CAMPAIGNS_LIST = load_campaigns()

class BulkSendRequest(BaseModel):
    recipients: List[dict]  # [{"name": "...", "email": "..."}]
    subject: str
    body_template: str
    primary_hm_name: str = ""


class CampaignRequest(BaseModel):
    job_input: str
    force_confirm: bool = False


@router.post("/run")
def run_campaign(request: CampaignRequest):
    initial_state = {
        "job_input": request.job_input,
        "resume_dossier": CURRENT_DOSSIER,
        "job_data": None,
        "hiring_manager": None,
        "confidence_score": 0,
        "force_confirm": request.force_confirm,
        "needs_review": False,
        "research_data": None,
        "email_draft": None,
        "completed_steps": [],
    }

    final_state = campaign_graph.invoke(initial_state)

    # Add to list and save to backend/data/campaigns.json
    CAMPAIGNS_LIST.insert(0, final_state)
    save_campaigns(CAMPAIGNS_LIST)

    return final_state

@router.post("/send-emails")
def send_emails_to_managers(req: BulkSendRequest):
    results = []
    primary_first_name = req.primary_hm_name.split()[0] if req.primary_hm_name else ""
    for person in req.recipients:
        name = person.get("name", "")
        email = person.get("email", "")
        first_name = name.split()[0] if name else "there"
        # Swap the first name in the greeting so each person gets a personalized 1-on-1 email!
        personalized_body = req.body_template
        if primary_first_name and primary_first_name in personalized_body:
            personalized_body = personalized_body.replace(primary_first_name, first_name, 1)
        res = send_single_email(
            to_email=email,
            subject=req.subject,
            body=personalized_body,
        )
        results.append({
            "name": name,
            "email": email,
            "success": res.get("success", False),
            "error": res.get("error"),
        })
    return {"results": results}


@router.get("")
def get_all_campaigns():
    return {"campaigns": CAMPAIGNS_LIST}