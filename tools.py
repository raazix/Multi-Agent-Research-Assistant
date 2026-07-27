
from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from dotenv import load_dotenv
from rich import print

load_dotenv()

tavily=TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


@tool
def web_search(query : str) -> str:
    """ Search for recent and reliable information on a topic. Returns Titles, URLs, and Snippets """
    results=tavily.search(query=query, max_results=3)

    out=[]
    for r in results['results']:
        out.append(
            f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content']}\n"
        )
    
    return "\n----\n".join(out)
    

@tool
def scrape_url(url:str)->str:
    """Scrape and return clean text content from a given URL for deeper reading and analysis."""
    try:
        resp=requests.get(url,timeout=5,headers={"User-Agent":"Mozilla/5.0"})
        soup=BeautifulSoup(resp.text,"html.parser")
        for tag in soup(["script","style","nav","footer"]):
            tag.decompose()
        return soup.get_text(separator=" ",strip=True)[:1500]
    except Exception as e:
        return f"Error occurred while scraping {url}: {e}"



# @tool
# def scrape_url(url: str) -> str:
#     """Scrape and return clean text content from a given URL for deeper reading and analysis."""
#     try:
#         resp = requests.get(
#             url,
#             timeout=10,
#             headers={"User-Agent": "Mozilla/5.0"}
#         )

#         soup = BeautifulSoup(resp.text, "html.parser")

#         article = soup.find("article")

#         if article is None:
#             return "No <article> tag found on this page."

#         for tag in article(["script", "style", "nav", "footer"]):
#             tag.decompose()

#         return article.get_text(separator=" ", strip=True)[:3000]

#     except Exception as e:
#         return f"Error occurred while scraping {url}: {e}"

#print(scrape_url.invoke("https://www.newsbytesapp.com/news/sports/ipl-2026-final-becomes-most-watched-match/story"))
