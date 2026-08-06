import json
import os
import time
import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from backend.pipeline import run_research_pipeline
except ImportError:
    from pipeline import run_research_pipeline

app = FastAPI(
    title="Anveshan AI — Multi-Agent Research System API",
    description="FastAPI backend connecting Next.js frontend with LangChain AI agents",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_FILE = os.path.join(os.path.dirname(__file__), "storage.json")

# In-memory storage with file persistence
sessions_db: Dict[str, Dict[str, Any]] = {}
reports_db: Dict[str, Dict[str, Any]] = {}


def load_db():
    global sessions_db, reports_db
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                sessions_db = data.get("sessions", {})
                reports_db = data.get("reports", {})
        except Exception as e:
            print(f"Could not load storage.json: {e}")


def save_db():
    try:
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump({"sessions": sessions_db, "reports": reports_db}, f, indent=2)
    except Exception as e:
        print(f"Could not save storage.json: {e}")


load_db()


# Pydantic Schemas matching frontend/types/index.ts
class ResearchRequest(BaseModel):
    topic: str
    instructions: Optional[str] = None
    depth: Optional[str] = "standard"
    sourcePreference: Optional[str] = "mixed"


class ResearchResponse(BaseModel):
    id: str
    topic: str
    status: str
    createdAt: str
    updatedAt: str


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Anveshan AI API", "timestamp": time.time()}


@app.post("/api/research/", response_model=ResearchResponse)
def start_research(payload: ResearchRequest, background_tasks: BackgroundTasks):
    session_id = str(uuid.uuid4())
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ")

    session = {
        "id": session_id,
        "topic": payload.topic.strip(),
        "status": "pending",
        "currentStage": 0,
        "createdAt": now_str,
        "updatedAt": now_str,
        "stages": [
            {"name": "Search Agent", "status": "waiting", "startedAt": None, "completedAt": None},
            {"name": "Reader Agent", "status": "waiting", "startedAt": None, "completedAt": None},
            {"name": "Writer Agent", "status": "waiting", "startedAt": None, "completedAt": None},
            {"name": "Critic Agent", "status": "waiting", "startedAt": None, "completedAt": None},
        ],
        "logs": [
            {
                "timestamp": now_str,
                "message": f"Research session created for: '{payload.topic}'",
                "level": "info"
            }
        ],
        "sources": [],
        "report": None,
        "feedback": None,
    }

    sessions_db[session_id] = session
    save_db()

    def run_worker():
        sess = sessions_db[session_id]
        sess["status"] = "searching"
        sess["stages"][0]["status"] = "running"
        sess["stages"][0]["startedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")

        def callback(event: Dict[str, Any]):
            stage = event.get("stage")
            status = event.get("status")
            msg = event.get("message", "")
            data = event.get("data", {})
            t_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.localtime(event.get("timestamp", time.time())))

            level = "info"
            if status in ["completed", "finished"]:
                level = "success"
            elif status == "failed":
                level = "error"

            sess["logs"].append({"timestamp": t_str, "message": msg, "level": level})

            if stage == "search":
                sess["currentStage"] = 0
                if status == "running":
                    sess["status"] = "searching"
                    sess["stages"][0]["status"] = "running"
                elif status == "completed":
                    sess["stages"][0]["status"] = "completed"
                    sess["stages"][0]["completedAt"] = t_str
                    raw_urls = data.get("sources", [])
                    sess["sources"] = [
                        {
                            "id": str(i),
                            "title": f"Source {i+1}",
                            "url": u,
                            "domain": u.split("/")[2] if "/" in u and len(u.split("/")) > 2 else u,
                            "reliability": "official" if ".gov" in u or ".org" in u else "news"
                        }
                        for i, u in enumerate(raw_urls)
                    ]
            elif stage == "reader":
                sess["currentStage"] = 1
                if status == "running":
                    sess["status"] = "reading"
                    sess["stages"][1]["status"] = "running"
                elif status == "completed":
                    sess["stages"][1]["status"] = "completed"
                    sess["stages"][1]["completedAt"] = t_str
            elif stage == "writer":
                sess["currentStage"] = 2
                if status == "running":
                    sess["status"] = "writing"
                    sess["stages"][2]["status"] = "running"
                elif status == "completed":
                    sess["stages"][2]["status"] = "completed"
                    sess["stages"][2]["completedAt"] = t_str
            elif stage == "critic":
                sess["currentStage"] = 3
                if status == "running":
                    sess["status"] = "critiquing"
                    sess["stages"][3]["status"] = "running"
                elif status == "completed":
                    sess["stages"][3]["status"] = "completed"
                    sess["stages"][3]["completedAt"] = t_str

            sess["updatedAt"] = t_str
            save_db()

        try:
            result = run_research_pipeline(
                topic=payload.topic.strip(),
                depth=payload.depth or "standard",
                event_callback=callback
            )
            sess["status"] = "completed"
            sess["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")

            report_obj = {
                "id": session_id,
                "title": payload.topic.strip(),
                "content": result.get("report", ""),
                "generatedAt": sess["updatedAt"],
                "wordCount": len(result.get("report", "").split()),
                "sourcesUsed": len(sess["sources"])
            }
            sess["report"] = report_obj
            reports_db[session_id] = report_obj
            save_db()
        except Exception as e:
            sess["status"] = "failed"
            sess["error"] = str(e)
            sess["logs"].append({
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "message": f"Pipeline failed: {str(e)}",
                "level": "error"
            })
            save_db()

    background_tasks.add_task(run_worker)

    return ResearchResponse(
        id=session_id,
        topic=session["topic"],
        status=session["status"],
        createdAt=session["createdAt"],
        updatedAt=session["updatedAt"]
    )


@app.get("/api/research/{session_id}/")
def get_research_progress(session_id: str):
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Research session not found")
    return sessions_db[session_id]


@app.get("/api/report/{session_id}/")
def get_report(session_id: str):
    if session_id in reports_db:
        return reports_db[session_id]
    if session_id in sessions_db and sessions_db[session_id].get("report"):
        return sessions_db[session_id]["report"]
    raise HTTPException(status_code=404, detail="Report not found")


@app.get("/api/stats/")
def get_dashboard_stats():
    completed_sessions = [s for s in sessions_db.values() if s.get("status") == "completed"]
    total_reports = len([s for s in completed_sessions if s.get("report")])
    total_sources = sum(len(s.get("sources", [])) for s in completed_sessions)
    
    return {
        "reportsGenerated": total_reports,
        "averageResearchTime": 24.5 if completed_sessions else 0,
        "successfulPipelines": len(completed_sessions),
        "sourcesProcessed": total_sources
    }


@app.get("/api/reports/recent/")
@app.get("/api/reports/")
@app.get("/api/history/")
def get_recent_reports():
    items = []
    for s_id, s in reversed(list(sessions_db.items())):
        items.append({
            "id": s["id"],
            "title": s["topic"],
            "topic": s["topic"],
            "status": s["status"],
            "createdAt": s["createdAt"],
            "completedAt": s.get("updatedAt")
        })
    return items


@app.delete("/api/history/{session_id}/")
@app.delete("/api/research/{session_id}/")
def delete_history_item(session_id: str):
    removed = False
    if session_id in sessions_db:
        del sessions_db[session_id]
        removed = True
    if session_id in reports_db:
        del reports_db[session_id]
        removed = True
    if not removed:
        raise HTTPException(status_code=404, detail="Session not found")
    save_db()
    return {"status": "deleted", "id": session_id}


@app.post("/api/research/{session_id}/retry/")
def retry_research(session_id: str, background_tasks: BackgroundTasks):
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Research session not found")
    
    sess = sessions_db[session_id]
    payload = ResearchRequest(topic=sess["topic"])
    return start_research(payload, background_tasks)
