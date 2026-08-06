import argparse
import os
import sys
import uvicorn
from dotenv import load_dotenv

load_dotenv()

# Add current directory and parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)


def run_server():
    print("\n🚀 Starting Anveshan AI FastAPI Server...")
    print("📡 Listening at http://localhost:8000")
    print("📖 API Documentation available at http://localhost:8000/docs\n")
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)


def run_cli():
    print("\n🤖 Anveshan AI — Multi-Agent Research System (CLI Mode)\n")
    topic = input("Enter research topic: ")
    if not topic.strip():
        print("Topic cannot be empty.")
        return
    try:
        from api import run_research_pipeline
    except ImportError:
        try:
            from pipeline import run_research_pipeline
        except ImportError:
            from backend.pipeline import run_research_pipeline

    res = run_research_pipeline(topic.strip())
    print("\n" + "=" * 60)
    print("📄 FINAL RESEARCH REPORT")
    print("=" * 60)
    print(res["report"])
    print("\n" + "=" * 60)
    print("🧐 CRITIC FEEDBACK")
    print("=" * 60)
    print(res["feedback"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Anveshan AI Launcher")
    parser.add_argument("--cli", action="store_true", help="Run in CLI terminal mode")
    parser.add_argument("--server", action="store_true", help="Run FastAPI web server")
    args = parser.parse_args()

    if args.cli:
        run_cli()
    else:
        run_server()
