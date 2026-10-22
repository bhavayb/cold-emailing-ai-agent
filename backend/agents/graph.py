from typing import TypedDict, Optional, List
from langgraph.graph import StateGraph, END
from agents.nodes import (
    parse_job_node,
    find_hm_node,
    research_node,
    compose_email_node,
)


# 1. Define the shared memory (State) passed between nodes
class CampaignState(TypedDict):
    job_input: str
    resume_dossier: Optional[dict]
    job_data: Optional[dict]
    hiring_manager: Optional[dict]
    hiring_managers: Optional[List[dict]]  # <-- Add this line for the 3-4 people
    confidence_score: int
    force_confirm: bool
    needs_review: bool
    research_data: Optional[dict]
    email_draft: Optional[dict]
    completed_steps: List[str]


# 2. Conditional Gate: Check if Hiring Manager confidence is high enough
def check_confidence_gate(state: CampaignState) -> str:
    score = state["confidence_score"]
    if score >= 80 or state.get("force_confirm"):
        print(f"   [GATE] 🟢 Confidence {score}% >= 80% -> Auto-confirming & continuing!", flush=True)
        state["needs_review"] = False
        return "continue"
    else:
        print(f"   [GATE] 🟡 Confidence {score}% < 80% -> Pausing for user review in UI!", flush=True)
        state["needs_review"] = True
        return "pause_for_review"


# 3. Build the LangGraph workflow
def build_campaign_graph():
    workflow = StateGraph(CampaignState)

    # Add the 4 nodes
    workflow.add_node("parse_job", parse_job_node)
    workflow.add_node("find_hiring_manager", find_hm_node)
    workflow.add_node("research_personalization", research_node)
    workflow.add_node("compose_email", compose_email_node)

    # Connect the flow
    workflow.set_entry_point("parse_job")
    workflow.add_edge("parse_job", "find_hiring_manager")

    # Conditional branch after finding the Hiring Manager
    workflow.add_conditional_edges(
        "find_hiring_manager",
        check_confidence_gate,
        {
            "continue": "research_personalization",
            "pause_for_review": END,
        },
    )

    workflow.add_edge("research_personalization", "compose_email")
    workflow.add_edge("compose_email", END)

    return workflow.compile()


# Compile once so our API can import and run it
campaign_graph = build_campaign_graph()