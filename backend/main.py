from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.resume_routes import router as resume_router
from api.campaign_routes import router as campaign_router

app = FastAPI(title="Envoy AI — Cold Email Agent API")

# Allow Next.js frontend (localhost:3000) to talk to FastAPI (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers from api/ folder
app.include_router(resume_router)
app.include_router(campaign_router)


@app.get("/")
def health_check():
    return {"status": "running", "service": "Envoy LangGraph API"}