import asyncio
from pydantic import BaseModel
from pydantic_ai import Agent
from dotenv import load_dotenv
import os

load_dotenv()

class TestOutput(BaseModel):
    name: str

async def main():
    # Use a supported Groq model
    agent = Agent("groq:llama-3.3-70b-versatile", output_type=TestOutput)
    result = await agent.run("My name is Rohit")
    print(f"Result type: {type(result)}")
    print(f"Result dir: {dir(result)}")
    try:
        print(f"Result output: {result.output}")
        print(f"Result data type: {type(result.output)}")
    except Exception as e:
        print(f"Error accessing .output: {e}")

if __name__ == "__main__":
    asyncio.run(main())
