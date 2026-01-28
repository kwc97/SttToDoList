from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
from pipeline import PipelineOrchestrator
import json

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

# Serve static files if build directory exists
# This allows the API to serve the frontend on the same port in production
if os.path.exists("out"):
    app.mount("/", StaticFiles(directory="out", html=True), name="static")

@app.post("/api/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Uploads an audio file, runs the AI pipeline, and returns the structured result.
    Supports large files in non-serverless environments.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(TEMP_DIR, unique_filename)

    try:
        # Save uploaded file
        # Using a buffer to handle potentially large files
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"📥 [API] File uploaded: {file_path} ({os.path.getsize(file_path)} bytes)")

        # Run Pipeline
        # In a persistent server, we can afford longer processing times.
        result_json_str = orchestrator.run(file_path)
        
        if result_json_str:
            result_data = json.loads(result_json_str)
            return JSONResponse(content=result_data)
        else:
            raise HTTPException(status_code=500, detail="Pipeline failed to generate output")

    except Exception as e:
        print(f"❌ [API] Error during processing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🧹 [API] Cleaned up: {file_path}")
            except Exception as cleanup_error:
                print(f"⚠️ [API] Cleanup warning: {cleanup_error}")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "mode": "persistent"}

if __name__ == "__main__":
    import uvicorn
    # Increase timeout for long-running AI tasks
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=600)
