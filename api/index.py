from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
from pipeline import PipelineOrchestrator
import json
from typing import Dict, Any

app = FastAPI(
    title="Meeting STT & Todo Pipeline API", 
    docs_url="/api/docs", 
    openapi_url="/api/openapi.json"
)

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Orchestrator
orchestrator = PipelineOrchestrator()

TEMP_DIR = "/tmp"
os.makedirs(TEMP_DIR, exist_ok=True)

# Task storage (In-memory for MVP, use Redis/DB for production)
tasks: Dict[str, Dict[str, Any]] = {}

def process_audio_task(task_id: str, file_path: str):
    """
    Background worker to process the audio file.
    """
    try:
        tasks[task_id]["status"] = "processing"
        print(f"⚙️ [Worker] Processing task {task_id}...")
        
        result_json_str = orchestrator.run(file_path)
        
        if result_json_str:
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["result"] = json.loads(result_json_str)
            print(f"✅ [Worker] Task {task_id} completed.")
        else:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = "Pipeline failed to generate output"
            print(f"❌ [Worker] Task {task_id} failed.")

    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        print(f"❌ [Worker] Task {task_id} error: {str(e)}")
    
    finally:
        # Cleanup
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🧹 [Worker] Cleaned up: {file_path}")
            except Exception as cleanup_error:
                print(f"⚠️ [Worker] Cleanup warning: {cleanup_error}")

# Serve static files if build directory exists
if os.path.exists("out"):
    app.mount("/", StaticFiles(directory="out", html=True), name="static")

@app.post("/api/upload")
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Uploads an audio file and starts a background task for processing.
    Returns a task_id immediately.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Generate unique task ID and filename
    task_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{task_id}{file_extension}"
    file_path = os.path.join(TEMP_DIR, unique_filename)

    # Initialize task status
    tasks[task_id] = {
        "status": "pending",
        "result": None,
        "error": None
    }

    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"📥 [API] File uploaded for task {task_id}: {file_path}")

        # Add to background tasks
        background_tasks.add_task(process_audio_task, task_id, file_path)
        
        return {"task_id": task_id, "status": "pending"}

    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status/{task_id}")
async def get_task_status(task_id: str):
    """
    Returns the current status and result of a task.
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return tasks[task_id]

@app.get("/")
def root():
    return {
        "message": "AI Meeting Assistant API is running (Async Mode)",
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "mode": "persistent_async"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, timeout_keep_alive=600)
