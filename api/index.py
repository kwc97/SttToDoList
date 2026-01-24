from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
from pipeline import PipelineOrchestrator
import json

app = FastAPI(title="Meeting STT & Todo Pipeline API")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. In production, specify domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Orchestrator
orchestrator = PipelineOrchestrator()

TEMP_DIR = "/tmp"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Uploads an audio file, runs the AI pipeline, and returns the structured result.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(TEMP_DIR, unique_filename)

    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"📥 [API] File uploaded: {file_path}")

        # Run Pipeline
        # Note: In a real app, this should be a background task (Celery/RQ)
        # But for this MVP, we run it synchronously.
        
        # Check if we should use mock (e.g. if key is missing or for testing)
        # We can detect if this is a "test" request or just rely on the env vars.
        # For now, let's just run it. The orchestrator handles mock fallback if keys are missing.
        
        result_json_str = orchestrator.run(file_path)
        
        if result_json_str:
            result_data = json.loads(result_json_str)
            return JSONResponse(content=result_data)
        else:
            raise HTTPException(status_code=500, detail="Pipeline failed to generate output")

    except Exception as e:
        print(f"❌ [API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"🧹 [API] Cleaned up: {file_path}")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
