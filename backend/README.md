# ⚡ Multi-Agent Research Assistant - Backend API

FastAPI backend service powering the **Multi-Agent Research Assistant**. Deploys a team of 4 specialized AI agents (Searcher, Reader, Writer, Critic) using **LangChain** and **Groq (Llama 3.3 70B)**, and streams real-time step execution to the Next.js web application.

---

## 🛠️ Setup & Running

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

### 3. Launch Backend API Server
```bash
python main.py
```
*Server starts at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

### 4. Optional CLI Mode
```bash
python main.py --cli
```

---

## 📡 API Endpoints Summary

- `GET /api/health` ➔ Service health status
- `POST /api/research` ➔ Trigger new research topic run
- `GET /api/research/{session_id}/stream` ➔ SSE real-time step streaming
- `GET /api/reports` ➔ Fetch all generated reports
- `GET /api/stats` ➔ Fetch system research metrics
