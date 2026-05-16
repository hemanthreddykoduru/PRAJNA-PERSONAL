import asyncio
import os
import json
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# --- INSTITUTIONAL TOOLS (Tools for the Agents) ---

def list_institutional_faculty(campus=None):
    """
    Retrieves the complete list of faculty members for a specific campus or the entire institution.
    Use this to audit user distribution or fetch specific faculty details.
    """
    # This will eventually call your DynamoDB /admin?action=list logic
    return "Querying institutional directory for campus: " + (campus or "All")

def analyze_research_impact(department):
    """
    Performs deep-reasoning analysis on the research output of a specific department.
    Calculates h-index trends, publication density, and grant success rates.
    """
    return f"Analyzing research metrics for the {department} department..."

# --- AGENT DEFINITIONS (The Specialized Intellects) ---

# 1. The Sentinel (Administrative Agent)
sentinel_agent = Agent(
    model="gemini-2.0-flash",
    name="Sentinel",
    description="Institutional Administrator responsible for directory management and security audits.",
    instruction="""
    You are the PRAJNA Sentinel. You manage the institutional directory. 
    You can list faculty members, check registration status, and audit user roles.
    Be precise, professional, and maintain strict institutional standards.
    """,
    tools=[list_institutional_faculty]
)

# 2. The Analyst (Discovery Agent)
analyst_agent = Agent(
    model="gemini-2.0-flash",
    name="Analyst",
    description="Research Intelligence Agent specializing in analytics and publication tracking.",
    instruction="""
    You are the PRAJNA Analyst. You provide deep insights into institutional research.
    You can analyze department impact, track publication trends, and identify top-performing researchers.
    Your tone should be data-driven, insightful, and strategic.
    """,
    tools=[analyze_research_impact]
)

# --- AGENT CORE RUNTIME ---

APP_NAME = "PRAJNA_AGENTIC_LAYER"
session_service = InMemorySessionService()
app = BedrockAgentCoreApp()

async def execute_agentic_reasoning(query, user_id, session_id):
    """Orchestrates the multi-agent reasoning flow"""
    
    # In a full ADK implementation, we can use a Supervisor agent to delegate.
    # For this phase, we use a primary agent (Sentinel) that can delegate to Analyst.
    
    content = types.Content(role='user', parts=[types.Part(text=query)])
    runner = Runner(agent=sentinel_agent, app_name=APP_NAME, session_service=session_service)
    
    events = runner.run_async(user_id=user_id, session_id=session_id, new_message=content)
    
    final_response = "I encountered an error processing your institutional request."
    async for event in events:
        if event.is_final_response():
            final_response = event.content.parts[0].text
            
    return final_response

@app.entrypoint
def agent_invocation(payload, context):
    """Primary Entry point for Bedrock AgentCore"""
    prompt = payload.get("prompt", "Analyze the current institutional status.")
    user_id = payload.get("user_id", "ANONYMOUS_ADMIN")
    session_id = context.session_id if hasattr(context, 'session_id') else "GLOBAL_SESSION"
    
    print(f"[PRAJNA-AGENT] Processing reasoning request: {prompt}")
    
    return asyncio.run(execute_agentic_reasoning(prompt, user_id, session_id))

if __name__ == "__main__":
    app.run()
