$ErrorActionPreference = "Stop"

# Activate the virtual environment
. .\venv\Scripts\Activate.ps1

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8080
