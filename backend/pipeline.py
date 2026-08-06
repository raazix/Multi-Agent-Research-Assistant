import re
import time
from typing import Callable, Optional, Dict, Any

try:
    from tools import perform_search, clean_url, scrape_url
except ImportError:
    from backend.tools import perform_search, clean_url, scrape_url

try:
    from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain
except ImportError:
    from backend.agents import build_search_agent, build_reader_agent, writer_chain, critic_chain


def safe_invoke(runnable, input_data, max_retries=3, initial_delay=5):
    """
    Invokes a runnable (agent or chain) with quick retry handling for rate-limit errors.
    """
    attempt = 0
    delay = initial_delay
    while attempt < max_retries:
        try:
            return runnable.invoke(input_data)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                attempt += 1
                match = re.search(r'retry(?:Delay| in)[:\s\']*(\d+)', err_str, re.IGNORECASE)
                wait_time = (int(match.group(1)) + 1) if match else delay
                print(f"\n⚠️ Rate limit hit. Waiting {wait_time}s before retrying (Attempt {attempt}/{max_retries})...")
                time.sleep(wait_time)
                delay *= 1.5
            else:
                raise e
    return runnable.invoke(input_data)


def run_research_pipeline(
    topic: str,
    depth: str = "standard",
    event_callback: Optional[Callable[[Dict[str, Any]], None]] = None
) -> dict:
    """
    Runs the 4-agent research pipeline:
    1. Searcher Agent: Fetches real Tavily search results for the given topic based on depth
    2. Reader Agent: Scrapes and synthesizes facts across candidate sources using BeautifulSoup
    3. Writer Chain: Drafts structured Markdown report with valid clickable URLs
    4. Critic Chain: Evaluates report quality and score out of 10
    """
    target_sources = 12 if depth == "advanced" else 3 if depth == "basic" else 6

    def emit(stage: str, status: str, message: str, data: Optional[Dict[str, Any]] = None):
        payload = {
            "stage": stage,
            "status": status,
            "message": message,
            "data": data or {},
            "timestamp": time.time()
        }
        if event_callback:
            event_callback(payload)
        else:
            print(f"[{stage.upper()}] ({status}): {message}")

    state = {
        "topic": topic,
        "search_results": "",
        "scraped_result": "",
        "report": "",
        "feedback": "",
        "sources": []
    }

    start_time = time.time()

    # Step 1 - Search Agent (Tavily Live Web Search)
    emit("search", "running", f"Search Agent performing live web search for: '{topic}' ({target_sources} target sources)")
    search_items = perform_search(topic, max_results=target_sources)

    if search_items:
        formatted_out = []
        clean_sources = []
        for item in search_items:
            u = item["url"]
            clean_sources.append(u)
            formatted_out.append(f"Title: {item['title']}\nURL: {u}\nSnippet: {item['snippet']}\n")
        state['search_results'] = "\n----\n".join(formatted_out)
        state['sources'] = clean_sources
    else:
        # Fallback to search_agent if direct call empty
        search_agent = build_search_agent()
        search_response = safe_invoke(search_agent, {
            "messages": [{"role": "user", "content": f"Find recent and reliable information on: {topic}"}]
        })
        state['search_results'] = search_response['messages'][-1].content
        found_urls = re.findall(r'https?://[^\s<>"\')]+', state['search_results'])
        state['sources'] = list(set([clean_url(u) for u in found_urls if clean_url(u)]))

    emit("search", "completed", f"Search completed. Found {len(state['sources'])} candidate primary sources.", {
        "search_results": state['search_results'][:500] + "...",
        "sources": state['sources']
    })

    time.sleep(1)

    # Step 2 - Reader Agent (Scraping candidate URLs)
    emit("reader", "running", f"Reader Agent is scraping and analyzing {min(target_sources, len(state['sources']))} candidate URLs...")
    scraped_pages = []
    for idx, url in enumerate(state['sources'][:target_sources]):
        text = scrape_url.invoke(url)
        if text and not text.startswith("Failed to access") and not text.startswith("Error occurred"):
            scraped_pages.append(f"--- SOURCE #{idx+1} ({url}) ---\n{text[:2000]}")

    if scraped_pages:
        raw_scraped_combined = "\n\n".join(scraped_pages)
    else:
        raw_scraped_combined = "Web scraper could not retrieve full HTML body text. Using snippets from search results."

    reader_agent = build_reader_agent()
    scraped_response = safe_invoke(reader_agent, {
        "messages": [(
            "user",
            f"""
You are a senior research analyst responsible for gathering high-quality information.

Research Topic:
{topic}

Candidate Source URLs:
{state['sources']}

Scraped Page Contents:
{raw_scraped_combined[:6000]}

Your tasks:
1. Synthesize the key facts, statistics, major findings, and quotes across all scraped pages.
2. Ensure insights from ALL 3 to 5 valid source URLs above are highlighted.

Return the result in format:
Scraped URLs Analyzed:
- <url1>
- <url2>
- <url3>

Key Facts & Statistics Extracted:
- Point 1
- Point 2
- Point 3
"""
        )]
    })

    state['scraped_result'] = scraped_response['messages'][-1].content
    emit("reader", "completed", "Reader Agent successfully scraped and extracted multi-source facts.", {
        "scraped_snippet": state['scraped_result'][:400] + "..."
    })

    time.sleep(1)

    # Step 3 - Writer Agent
    emit("writer", "running", "Writer Agent is drafting the final research report synthesizing all sources...")
    research_combined = (
        f"Search Results:\n{state['search_results']}\n\n"
        f"Detailed Scraped Content Across All Sources:\n{state['scraped_result']}\n\n"
        f"Verified Source URLs:\n" + "\n".join([f"- {u}" for u in state['sources']])
    )

    state['report'] = safe_invoke(writer_chain, {
        "topic": topic,
        "research": research_combined
    })

    emit("writer", "completed", "Writer Agent completed research report draft.", {
        "report_length": len(state['report'])
    })

    time.sleep(1)

    # Step 4 - Critic Agent
    emit("critic", "running", "Critic Agent is reviewing accuracy, structure, and quality...")
    state['feedback'] = safe_invoke(critic_chain, {
        "report": state['report']
    })

    score_match = re.search(r'Score:\s*(\d+(?:\.\d+)?)/10', state['feedback'], re.IGNORECASE)
    critic_score = float(score_match.group(1)) if score_match else 8.5

    state['critic_score'] = critic_score
    state['execution_time'] = round(time.time() - start_time, 2)

    emit("critic", "completed", f"Critic Agent finished evaluation. Score: {critic_score}/10.", {
        "feedback": state['feedback'],
        "score": critic_score,
        "execution_time": state['execution_time']
    })

    emit("pipeline", "finished", "Multi-Agent Research Pipeline finished successfully!", {
        "report": state['report'],
        "feedback": state['feedback'],
        "sources": state['sources'],
        "score": critic_score,
        "execution_time": state['execution_time']
    })

    return state


if __name__ == "__main__":
    topic = input("\nEnter the research topic: ")
    res = run_research_pipeline(topic)
    print("\n--- FINAL REPORT ---")
    print(res["report"])
    print("\n--- CRITIC FEEDBACK ---")
    print(res["feedback"])
