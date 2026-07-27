import time
import re
from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

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

def run_research_pipeline(topic: str) -> dict:

    state = {}

    # Step 1 - Search Agent
    print("\n" + "="*50)
    print("Step 1 - Search Agent is working")
    print("="*50)

    search_agent = build_search_agent()
    search_results = safe_invoke(search_agent, {
        "messages": [
            {
                "role": "user",
                "content": f"Find recent and reliable information on the topic: {topic}"
            }
        ]
    })
    
    state['search_results'] = search_results['messages'][-1].content
    print("\nSearch results:", state['search_results'])

    time.sleep(2)

    # Step 2 - Reader Agent
    print("\n" + "="*50)
    print("Step 2 - Reader Agent is working")
    print("="*50)

    reader_agent = build_reader_agent()
    scraped_result = safe_invoke(reader_agent, {
        "messages": [(
            "user",
            f"""
You are a senior research analyst responsible for gathering high-quality information.

Research Topic:
{topic}

Your tasks:
1. Review the search results carefully.
2. Select the single most relevant and trustworthy URL.
3. Prefer:
   - Official websites
   - Research papers
   - Government sources
   - Reputable news organizations
4. Avoid low-quality, duplicate, or clickbait sources.
5. Use the scrape_url tool to retrieve the full content of the selected page.
6. Extract and summarize:
   - Key facts
   - Important statistics
   - Major findings
   - Recent developments
7. If the page cannot be scraped, choose the next best source.

Return the result in the following format:

Selected URL:
<url>

Reason for Selection:
<why this source was chosen>

Extracted Information:
- Point 1
- Point 2
- Point 3
- ...

Search Results:
{state['search_results'][:800]}
"""
        )]
    })

    state['scraped_result'] = scraped_result['messages'][-1].content
    print("\nScraped result:", state['scraped_result'])

    time.sleep(2)

    # Step 3 - Writer Agent
    print("\n" + "="*50)
    print("Step 3 - Writer is drafting the final report")
    print("="*50) 

    research_combined = (
        f"Search Results:\n{state['search_results']}\n\n"
        f"Detailed Scraped Content : \n{state['scraped_result']}\n\n"
    )

    state['report'] = safe_invoke(writer_chain, {
        "topic": topic,
        "research": research_combined
    })

    print("\nFinal Report:\n", state['report'])

    time.sleep(2)

    # Step 4 - Critic Agent
    print("\n" + "="*50)
    print("Step 4 - Critic is reviewing the report")
    print("="*50)

    state['feedback'] = safe_invoke(critic_chain, {     
        "report": state['report']
    })

    print("\nCritic Feedback:\n", state['feedback'])

    return state

if __name__ == "__main__":
    topic = input("\nEnter the research topic: ")
    run_research_pipeline(topic)   