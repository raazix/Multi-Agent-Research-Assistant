import os
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_groq import ChatGroq

try:
    from tools import scrape_url, web_search
except ImportError:
    from backend.tools import scrape_url, web_search

load_dotenv()

model_name = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
groq_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model=model_name,
    api_key=groq_key,
    temperature=0,
    max_retries=2,
) if groq_key else None


def build_search_agent():
    if not llm:
        raise ValueError("GROQ_API_KEY is not configured in .env")
    return create_agent(
        model=llm,
        tools=[web_search]
    )


def build_reader_agent():
    if not llm:
        raise ValueError("GROQ_API_KEY is not configured in .env")
    return create_agent(
        model=llm,
        tools=[scrape_url]
    )


writer_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a senior research analyst and technical writer.

Your responsibilities:
- Analyze the provided information critically.
- Produce a well-structured, fact-based, and professional report.
- Synthesize information from multiple sources instead of simply copying it.
- Highlight important insights, trends, and key findings.
- Use clear and concise language.
- Do not invent facts or information that is not present in the research.
        """
    ),
    (
        "human",
        """
Create a comprehensive research report on the following topic.

# Research Topic
{topic}

# Collected Research
{research}

# Instructions
1. Write an engaging introduction that explains the importance of the topic.
2. Present at least 3-5 key findings with detailed explanations.
3. Include statistics, examples, or recent developments whenever available.
4. Summarize the overall findings in a conclusion.
5. Provide a list of all 3 to 5 source URLs scraped during the research under the ## Sources section. Do not claim the report is based on a single source URL.

# Output Format

# {topic}

## Introduction
...

## Key Findings
### Finding 1
...

### Finding 2
...

### Finding 3
...

## Conclusion
...

## Sources
- URL 1
- URL 2
- URL 3

The report should be detailed, professional, factual, and easy to read.
        """
    )
])

writer_chain = (writer_prompt | llm | StrOutputParser()) if llm else None


critic_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a senior research reviewer and editor.

Your task is to critically evaluate research reports for:
- Accuracy
- Completeness
- Clarity
- Structure
- Depth of analysis
- Use of evidence and sources

Be objective, constructive, and specific in your feedback.
"""
    ),
    (
        "human",
        """
Review the research report below.

# Research Report
{report}

Evaluate the report and respond in the following format:

Score: X/10

Strengths:
- Point 1
- Point 2
- Point 3

Areas to Improve:
- Point 1
- Point 2
- Point 3

Missing Information:
- Mention any important information that was omitted.

One-Line Verdict:
A concise summary of the overall quality of the report.
"""
    )
])

critic_chain = (critic_prompt | llm | StrOutputParser()) if llm else None
