import os
import re
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from langchain.tools import tool
from tavily import TavilyClient

load_dotenv()

tavily_api_key = os.getenv("TAVILY_API_KEY")
tavily = TavilyClient(api_key=tavily_api_key) if tavily_api_key else None


def clean_url(url: str) -> str:
    """Sanitize URL string by removing trailing punctuation, quotes, or brackets."""
    if not url:
        return ""
    url = url.strip().strip("'\"()[]{}<>.,;")
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    return url


def perform_search(query: str, max_results: int = 5) -> list:
    """Performs raw Tavily search returning a list of dicts with title, clean url, content."""
    if not tavily:
        return []
    try:
        res = tavily.search(query=query, max_results=max_results)
        cleaned = []
        for r in res.get("results", []):
            raw_u = r.get("url", "")
            u = clean_url(raw_u)
            if u:
                cleaned.append({
                    "title": r.get("title", ""),
                    "url": u,
                    "snippet": r.get("content", "")
                })
        return cleaned
    except Exception as e:
        print(f"Tavily search exception: {e}")
        return []


@tool
def web_search(query: str) -> str:
    """Search for recent and reliable information on a topic. Returns Titles, URLs, and Snippets."""
    results = perform_search(query, max_results=5)
    if not results:
        return f"No search results returned for query: '{query}'."

    out = []
    for r in results:
        out.append(f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}\n")
    return "\n----\n".join(out)


@tool
def scrape_url(url: str) -> str:
    """Scrape and return clean text content from a given URL for deeper reading and analysis."""
    sanitized_url = clean_url(url)
    if not sanitized_url:
        return f"Invalid URL string provided: {url}"

    try:
        resp = requests.get(
            sanitized_url,
            timeout=8,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
        )
        if resp.status_code != 200:
            return f"Failed to access {sanitized_url} (HTTP {resp.status_code})."

        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)
        return text[:3000] if text else "No main article body text found."
    except Exception as e:
        return f"Error occurred while scraping {sanitized_url}: {str(e)}"
